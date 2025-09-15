// This is your secure server-side function.
// The user's browser will call this, and this function will securely call Google.

exports.handler = async function(event) {
  // --- CORRECT: Define the headers that will be used in all responses ---
  const headers = {
    'Access-Control-Allow-Origin': '*', // Allows any origin to call this function
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // --- CORRECT: Handle the CORS preflight request ---
  // Browsers will send an OPTIONS request first to check permissions
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No Content
      headers
    };
  }

  // Only allow POST requests for the actual function execution
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    
    // The API_KEY is stored securely in Netlify's environment variables
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
       // Add a generationConfig to ask for a JSON response
      generationConfig: {
          responseMimeType: "application/json",
      }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Error:", data);
      return { statusCode: response.status, headers, body: JSON.stringify(data) };
    }
    
    // The response from Google is now guaranteed to be a JSON string.
    // We pass it directly to the client.
    const responseText = data.candidates[0].content.parts[0].text;
    
    return {
      statusCode: 200,
      headers, // Add headers to the successful response
      body: responseText // The body is now a clean JSON string
    };

  } catch (error) {
    console.error("Serverless function error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};

