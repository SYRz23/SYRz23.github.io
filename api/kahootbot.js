// api/kahootbot.js
const Kahoot = require('kahoot.js-updated');  // Import the kahoot-js library

module.exports = async (req, res) => {
    const { gamePin, nickname } = req.body;

    if (!gamePin || !nickname) {
        return res.status(400).json({ success: false, message: "Missing game pin or nickname" });
    }

    try {
        // Create a new Kahoot client
        const client = new Kahoot();

        // Join the game using the game pin and nickname
        client.join(gamePin, nickname);

        // When successfully joined, listen for events
        client.on('joined', () => {
            console.log(`Successfully joined the game: ${gamePin} as ${nickname}`);
            res.status(200).json({ success: true, message: `Successfully joined the game as ${nickname}` });
        });

        // Listen for when the quiz starts
        client.on('quizStart', (quiz) => {
            console.log('Quiz has started!');
            console.log('Quiz info:', quiz);
        });

        // Handle answers
        client.on('questionStart', (question) => {
            console.log('New question:', question);
            const answer = question.answers[0]; // Simple strategy to pick the first answer
            client.answer(question, answer);
        });

        client.on('gameOver', () => {
            console.log('Game over!');
        });

        // Handle errors
        client.on('error', (error) => {
            console.error('Error:', error);
            res.status(500).json({ success: false, message: 'Error joining game or sending answer' });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error connecting to Kahoot' });
    }
};
