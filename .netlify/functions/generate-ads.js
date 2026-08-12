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
      console.error("GROQ_API_KEY not found in environment");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GROQ API key not configured" }),
      };
    }

    const prompt = `You are an expert ad copywriter. Create 3 high-converting ad variations for a ${business} business located in ${location} for ${platform}. Each ad should be catchy, professional, and optimized for the platform.`;

    console.log("Calling GROQ API with prompt:", prompt);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    console.log("GROQ API Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("GROQ API Error Response:", errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `GROQ API failed: ${response.status} - ${errorData}` }),
      };
    }

    const data = await response.json();
    console.log("GROQ API Success:", data);
    
    const text = data.choices?.[0]?.message?.content || "No ads generated";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    console.error("Function Error:", error.message, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Function error: ${error.message}` }),
    };
  }
};

module.exports = { handler };
