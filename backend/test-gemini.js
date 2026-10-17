require('dotenv').config();

const key = process.env.AI_API_KEY;
const model = process.env.AI_MODEL || 'gemini-1.5-flash';

console.log('Provider :', process.env.AI_PROVIDER || 'gemini');
console.log('Model    :', model);
console.log('Key      :', key ? key.slice(0, 10) + '...' : 'NOT SET');
console.log('Valid fmt:', key ? key.startsWith('AIzaSy') : false);
console.log('');

if (!key) {
  console.log('No AI_API_KEY set in .env — exiting.');
  process.exit(0);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Say exactly: Gemini is working!' }] }],
    generationConfig: { maxOutputTokens: 50 },
  }),
})
  .then((r) => r.json())
  .then((d) => {
    if (d.error) {
      console.log('GEMINI ERROR:', d.error.message);
      console.log('Reason      :', d.error.details?.[0]?.reason || 'unknown');
    } else {
      const text = d?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('GEMINI OK! Response:', text);
    }
  })
  .catch((e) => console.log('Network error:', e.message));
