// This is your secure server-side function.
// The user's browser will call this, and this function will securely call Google.

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
  
    try {
      const { prompt } = JSON.parse(event.body);
      
      // The API_KEY is stored securely in Netlify's environment variables
      const API_KEY = process.env.GEMINI_API_KEY;
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
  
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
      };
  
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        // Forward the error from Google's API
        return { statusCode: response.status, body: await response.text() };
      }
  
      const data = await response.json();
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
  
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
  };
  