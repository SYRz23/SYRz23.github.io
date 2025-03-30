// Use CommonJS require (Vercel prefers this)
const Kahoot = require('kahoot.js-updated');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { kahootPin, username } = req.body;
    const client = new Kahoot();
    
    // Immediate response - Vercel functions can't stay open
    res.status(202).json({ 
      status: 'processing',
      message: 'Bot join initiated' 
    });

    // Actual bot logic (runs after response)
    await client.join(kahootPin, username);
    
    client.on("QuestionReady", question => {
      const answer = Math.floor(Math.random() * 4);
      setTimeout(() => client.answer(answer), 1000);
    });

    // Keep process alive (Vercel-specific hack)
    await new Promise(() => {});
    
  } catch (err) {
    console.error('Bot error:', err);
    // Note: Can't modify response after sending
  }
};
