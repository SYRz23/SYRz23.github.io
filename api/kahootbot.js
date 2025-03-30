import Kahoot from 'kahoot.js-updated';

export default async (req, res) => {
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
    res.status(200).json({ 
      success: true,
      message: 'Bot join initiated (disconnects after timeout)'
    });

    // Background processing
    await client.join(kahootPin, username);
    
    client.on("QuestionReady", question => {
      const answer = Math.floor(Math.random() * 4);
      client.answer(answer);
    });

    // Keep process alive temporarily (max 10s on free tier)
    await new Promise(resolve => setTimeout(resolve, 9000));

  } catch (err) {
    console.error('Bot error:', err);
  }
};
