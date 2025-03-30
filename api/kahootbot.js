import Kahoot from 'kahoot.js-latest';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { pin, user } = req.body;

    try {
      const kahootPin = pin;
      const kahootName = user;

      // Background processing
      const client = new Kahoot();
      await client.join(kahootPin, kahootName);

      client.on("QuestionReady", (question) => {
        const answer = Math.floor(Math.random() * 4);
        client.answer(answer);
      });

      // Temporarily keep process alive
      await new Promise(resolve => setTimeout(resolve, 5000));

      res.status(200).json({ message: 'Bot started successfully!' });
    } catch (err) {
      console.error('Bot error:', err);
      res.status(500).json({ error: 'Bot error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
