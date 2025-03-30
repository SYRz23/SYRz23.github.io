const Kahoot = require("kahoot.js-updated");

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { kahootPin, username } = req.body;

    if (!kahootPin || !username) {
        return res.status(400).json({ success: false, message: "Missing PIN or username" });
    }

    try {
        const client = new Kahoot();
        
        client.join(kahootPin, username).then(() => {
            console.log(`✅ ${username} joined successfully!`);
        });

        client.on("QuestionReady", question => {
            console.log("\nNew Question:");
            console.log(Type: ${question.type});
            
            if (question.type === "quiz") {
                console.log("Choices:", question.quizQuestionAnswers[question.questionIndex]);
                const answer = readline.question('Enter answer (0-3): ');
                client.answer(parseInt(answer));
            } else if (question.type === "word_cloud" || question.type === "open_ended") {
                const answer = readline.question('Enter text answer: ');
                client.answer(answer);
            } else {
                console.log("Auto-answering randomly");
                const randomAnswer = Math.floor(Math.random() * question.quizQuestionAnswers[question.questionIndex]);
                client.answer(randomAnswer);
            }
        });

        client.on("Joined", () => {
            return res.status(200).json({ success: true, message: `${username} joined successfully!` });
        });

        client.on("QuizEnd", () => {
            console.log("Game ended");
        });

    } catch (error) {
        console.error(`❌ Error: ${error}`);
        return res.status(500).json({ success: false, message: "Failed to join Kahoot" });
    }
}
