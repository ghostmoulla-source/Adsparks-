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

    // TEMPORARY: Return test ads to verify the function works
    const testAds = `Ad 1: Looking for the best ${business} in ${location}? We've got you covered! Professional service, guaranteed satisfaction.

Ad 2: Need a trusted ${business} near you? Call us today for a free consultation and special offer!

Ad 3: ${business} in ${location} - Quality service at unbeatable prices. Your satisfaction is our priority!`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: testAds }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error: ' + error.message }),
    };
  }
};

module.exports = { handler };
