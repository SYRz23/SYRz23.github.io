const Kahoot = require('kahoot.js-latest');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { kahootPin, username, botCount = 1 } = req.body;

    if (!kahootPin || !username) {
      return res.status(400).json({ error: 'Missing PIN or username' });
    }

    const clients = [];
    const botUsername = botCount > 1 ? `${username}_${i+1}` : username;

    for (let i = 0; i < Math.min(Number(botCount) || 1, 50); i++) {
      const client = new Kahoot();
      clients.push(client);

      await new Promise((resolve) => {
        client.join(kahootPin, botUsername)
          .then(() => {
            console.log(`Bot ${i+1} joined as ${botUsername}`);
            resolve();
          })
          .catch(err => {
            console.error(`Bot ${i+1} failed:`, err);
            resolve();
          });

        client.on('QuestionStart', (question) => {
          question.answer(Math.floor(Math.random() * question.numberOfAnswers));
        });
      });
    }

    return res.status(200).json({ success: true, message: `${clients.length} bots joined!` });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
