const Kahoot = require("kahoot.js-latest");

module.exports = async (req, res) => {
  // Handle CORS preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { kahootPin, username, botCount = 1 } = req.body;

  try {
    for (let i = 0; i < Math.min(botCount, 50); i++) {
      const client = new Kahoot();
      const botName = botCount > 1 ? `${username}_${i+1}` : username;
      
      await client.join(kahootPin, botName).catch(err => {
        console.error(`Bot ${i+1} failed:`, err);
      });

      // Auto-answer randomly
      client.on("QuestionStart", (q) => {
        q.answer(Math.floor(Math.random() * q.numberOfAnswers));
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `✅ ${botCount} bot(s) joining game ${kahootPin}!` 
    });
  } catch (error) {
    res.status(500).json({ error: "Bot join failed: " + error.message });
  }
};
