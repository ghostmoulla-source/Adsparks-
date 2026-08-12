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

    const prompt = `You are an expert ad copywriter. Create 3 high-converting ad variations for a ${business} business located in ${location} for ${platform}. Each ad should be catchy, professional, and optimized for the platform. Format: Ad 1: [text] Ad 2: [text] Ad 3: [text]`;

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
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("GROQ API Error:", errorData);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to call GROQ API" }),
      };
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || "No ads generated";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};

module.exports = { handler };
