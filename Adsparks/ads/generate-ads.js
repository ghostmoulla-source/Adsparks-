exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { business, location, platform } = JSON.parse(event.body);
        
        // This connects directly to Groq's high-speed AI engine
        const response = await fetch("https://groq.com", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{
                    role: "user",
                    content: `Act as a world-class local marketing copywriter. Write 3 highly engaging ad variations for a local business.
                    Business Type: ${business}
                    Location: ${location}
                    Target Platform: ${platform}
                    Make sure the ads include local references, a strong emotional hook, benefits, and a compelling Call to Action. Separate each variation clearly.`
                }]
            })
        });

        const data = await response.json();
        const textOutput = data.choices[0].message.content;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textOutput })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.toString() }) };
    }
};