const Kahoot = require('kahoot.js-updated');

async function handler(req, res) {
    const pin = req.body.kahootPin;
    const name = req.body.username;
    const client = new Kahoot();

    try {
        await client.join(pin, name);
        console.log(`✅ ${name} joined successfully!`);

        client.on("QuestionReady", question => {
            // Auto-answer logic (remove readlineSync)
            const randomAnswer = Math.floor(Math.random() * (question.quizQuestionAnswers?.[question.questionIndex] || 4));
            client.answer(randomAnswer);
            console.log(`${name} answered: ${randomAnswer}`);
        });

        client.on("QuestionEnd", () => console.log("Question ended"));
        client.on("QuizEnd", () => console.log("Game ended"));

        // Send response immediately - Vercel functions can't stay open
        return res.status(200).json({ 
            success: true,
            message: `${name} joined successfully`
        });

    } catch (err) {
        console.log(`❌ Error: ${err.description}`);
        return res.status(500).json({
            error: "Bot join failed",
            details: err.description
        });
    }
}

module.exports = handler;
