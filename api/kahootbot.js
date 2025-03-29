const Kahoot = require('kahoot.js-latest');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { kahootPin, username, botCount = 1 } = req.body;

  try {
    const joinPromises = [];
    const clients = [];
    
    // Create multiple bots if requested
    for (let i = 0; i < Math.min(Number(botCount) || 1; i++) {
      const client = new Kahoot();
      clients.push(client);
      
      const botUsername = botCount > 1 ? `${username}${i+1}` : username;
      
      joinPromises.push(new Promise((resolve) => {
        client.join(kahootPin, botUsername)
          .then(() => {
            console.log(`Bot ${i+1} joined as ${botUsername}`);
            resolve();
          })
          .catch(err => {
            console.error(`Bot ${i+1} failed to join:`, err);
            resolve(); // Resolve even if failed to prevent hanging
          });

        client.on('QuestionStart', question => {
          console.log(`Bot ${i+1}: Question started, answering randomly`);
          question.answer(Math.floor(Math.random() * question.numberOfAnswers));
        });

        client.on('QuizEnd', () => {
          console.log(`Bot ${i+1}: Quiz ended`);
        });
      }));
    }

    // Wait for all bots to attempt joining
    await Promise.all(joinPromises);
    
    return res.status(200).json({ 
      success: true, 
      message: `Successfully sent ${clients.length} bots to the game` 
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
