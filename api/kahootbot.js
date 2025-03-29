const Kahoot = require('kahoot.js-latest');
const client = new Kahoot();

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { kahootPin, username } = req.body;

    console.log("Joining Kahoot...");
    client.join(kahootPin, username);

    client.on('Joined', () => {
      console.log("I joined the Kahoot!");
      res.status(200).json({ success: true, message: "Joined the game!" });
    });

    client.on('QuizStart', () => {
      console.log("The quiz has started!");
    });

    client.on('QuestionStart', question => {
      console.log("A new question has started, answering the first answer.");
      question.answer(0);  // Answers the first option
    });

    client.on('QuizEnd', () => {
      console.log("The quiz has ended.");
    });

    // Optional timeout if you want to send a response immediately
    setTimeout(() => {
      res.status(200).json({ success: true, message: "Request processed." });
    }, 1000); // Delay to ensure the function doesn't hang
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
