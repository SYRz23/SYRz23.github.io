// Import the correct package
import Kahoot from 'kahoot.js-updated';

export default async function handler(req, res) {
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
  
  try {
    const { kahootPin, username, botCount } = req.body;
    
    // Validate input
    if (!kahootPin || !username) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required parameters' 
      });
    }
    
    // Respond immediately as Vercel serverless functions have limited execution time
    res.status(200).json({ 
      success: true,
      message: `Bot join initiated for game PIN: ${kahootPin}`
    });
    
    // The rest runs after response is sent (though execution may still time out)
    const client = new Kahoot();
    await client.join(kahootPin, username);
    
    client.on("QuestionStart", question => {
      const answer = Math.floor(Math.random() * question.quizQuestionAnswers || 4);
      client.answer(answer);
    });
    
    // Keep connection alive briefly
    await new Promise(resolve => setTimeout(resolve, 9000));
    
  } catch (err) {
    console.error('Bot error:', err);
    // Note: We can't send another response here as one has already been sent
  }
}
