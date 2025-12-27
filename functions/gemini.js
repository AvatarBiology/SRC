// This is your secure backend function.
// It receives requests from your frontend, adds the secret API key,
// and forwards the request to the Google Gemini API.

const fetch = require('node-fetch');

exports.handler = async function(event) {
  // Only allow POST requests from your website.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Securely read the API key from Netlify's environment variables.
    // This key is never exposed to the frontend.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API 金鑰未在伺服器環境中設定");
    }

    // Parse the conversation history sent from the frontend.
    const { contents } = JSON.parse(event.body);

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;

    // Make the request to the Google Gemini API on behalf of the frontend.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Gemini API 請求失敗` }),
      };
    }

    const data = await response.json();

    // Send the successful result back to the frontend.
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('伺服器函式錯誤:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
