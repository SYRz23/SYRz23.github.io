import Kahoot from 'kahoot.js-updated';
import readlineSync from 'readline-sync';

export default async function handler(req, res) {
    const pin = req.body.kahootPin;
    const name = req.body.username;
    const client = new Kahoot();

    try {
        await client.join(pin, name);
        console.log(`✅ ${name} joined successfully!`);

        client.on("QuestionReady", question => {
            console.log("\nNew Question:");
            console.log(`Type: ${question.type}`);
            
            if (question.type === "quiz") {
                console.log("Choices:", question.quizQuestionAnswers[question.questionIndex]);
                const answer = readlineSync.question('Enter answer (0-3): ');
                client.answer(parseInt(answer));
            } else if (question.type === "word_cloud" || question.type === "open_ended") {
                const answer = readlineSync.question('Enter text answer: ');
                client.answer(answer);
            } else {
                console.log("Auto-answering randomly");
                const randomAnswer = Math.floor(Math.random() * question.quizQuestionAnswers[question.questionIndex]);
                client.answer(randomAnswer);
            }
        });

        client.on("QuestionEnd", () => console.log("Question ended"));
        client.on("QuizEnd", () => console.log("Game ended"));

    } catch (err) {
        console.log(`❌ Error: ${err.description}`);
    }
}
