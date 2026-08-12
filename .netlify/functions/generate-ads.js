const https = require('https');

const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { business, location, platform } = JSON.parse(event.body);

    if (!business || !location || !platform) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GROQ API key not configured" }),
      };
    }

    const prompt = `Create 3 short, catchy ad variations for a ${business} in ${location} for ${platform}. Keep each ad under 100 characters.`;

    const requestBody = JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 256,
      temperature: 0.7,
    });

    return new Promise((resolve) => {
      const options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            
            if (res.statusCode !== 200) {
              resolve({
                statusCode: res.statusCode,
                body: JSON.stringify({ error: parsed.error?.message || 'API Error' }),
              });
              return;
            }

            const text = parsed.choices?.[0]?.message?.content || 'No ads generated';
            resolve({
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text }),
            });
          } catch (e) {
            resolve({
              statusCode: 500,
              body: JSON.stringify({ error: 'Parse error: ' + e.message }),
            });
          }
        });
      });

      req.on('error', (e) => {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: 'Request error: ' + e.message }),
        });
      });

      req.write(requestBody);
      req.end();
    });
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error: ' + error.message }),
    };
  }
};

module.exports = { handler };
