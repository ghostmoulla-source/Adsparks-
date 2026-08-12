const Groq = require("groq-sdk");

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

    const groq = new Groq({ apiKey: groqApiKey });

    const message = await groq.messages.create({
      model: "mixtral-8x7b-32768",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an expert ad copywriter. Create 3 high-converting ad variations for a ${business} business located in ${location} for ${platform}. Each ad should be catchy, professional, and optimized for the platform. Format: Ad 1: [text] Ad 2: [text] Ad 3: [text]`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

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
