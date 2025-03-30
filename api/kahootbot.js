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
    
    // Immediate response
    res.status(200).json({ 
      success: true,
      message: 'Bot join request received'
    });

    // Background processing
    const client = new Kahoot();
    await client.join(kahootPin, username);
    
    client.on("QuestionReady", question => {
      const answer = Math.floor(Math.random() * 4);
      client.answer(answer);
    });

    // Keep process alive temporarily
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (err) {
    console.error('Bot error:', err);
  }
};
