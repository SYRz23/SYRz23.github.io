const Kahoot = require("kahoot.js-latest");

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

  const { kahootPin, username, botCount = 1 } = req.body;

  // Input validation
  if (!kahootPin || !username) {
    return res.status(400).json({ error: 'PIN and username are required' });
  }

  const maxBots = Math.min(Math.max(1, parseInt(botCount) || 1), 50);
  const successfulBots = [];
  const failedBots = [];

  try {
    const botPromises = Array.from({ length: maxBots }, (_, i) => {
      return new Promise(async (resolve) => {
        const botName = maxBots > 1 ? `${username}_${i+1}` : username;
        const client = new Kahoot();

        try {
          // Join with timeout (fixed syntax)
          await Promise.race([
            client.join(kahootPin, botName),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Join timeout')), 10000);
            })
          ]);

          // Set up answer handler
          client.on("QuestionStart", (question) => {
            const randomAnswer = Math.floor(Math.random() * question.numberOfAnswers);
            question.answer(randomAnswer);
          });

          successfulBots.push(botName);
          console.log(`✅ ${botName} joined successfully`);
        } catch (err) {
          failedBots.push({ botName, error: err.message });
          console.error(`❌ ${botName} failed:`, err.message);
        } finally {
          resolve();
        }
      });
    });

    await Promise.all(botPromises);

    res.status(200).json({ 
      success: true,
      totalBots: maxBots,
      successful: successfulBots.length,
      failed: failedBots.length,
      failedDetails: failedBots,
      message: `Successfully joined ${successfulBots.length}/${maxBots} bots to game ${kahootPin}`
    });
  } catch (error) {
    console.error('Global error:', error);
    res.status(500).json({ 
      error: "Bot join failed",
      details: error.message,
      successful: successfulBots.length,
      failed: failedBots.length
    });
  }
};
