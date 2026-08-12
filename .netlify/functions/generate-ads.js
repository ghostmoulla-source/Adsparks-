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

    const prompt = `You are an expert ad copywriter. Create 3 high-converting ad variations for a ${business} business located in ${location} for ${platform}. Each ad should be catchy, professional, and optimized for the platform. Format each on a new line starting with "Ad 1:", "Ad 2:", "Ad 3:"`;

    console.log("Calling GROQ API");

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

    console.log("Response status:", response.status);

    const responseText = await response.text();
    console.log("Response text:", responseText);

    if (!response.ok) {
      console.error("Error response:", responseText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API Error: ${response.status}` }),
      };
    }

    const data = JSON.parse(responseText);
    const text = data.choices?.[0]?.message?.content || "No ads generated";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

module.exports = { handler };
