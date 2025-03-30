// api/kahootbot.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
  try {
    // Extract data from request
    const { kahootPin, username, botCount = 1 } = req.body;
    
    // Validate inputs
    if (!kahootPin || !username) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: kahootPin and username are required'
      });
    }
    
    // Log the request for debugging
    console.log(`Bot request received - PIN: ${kahootPin}, Username: ${username}, Bots: ${botCount}`);
    
    // Send a success response (we're not actually connecting to Kahoot yet)
    return res.status(200).json({
      success: true,
      message: `Bot request processed for game PIN: ${kahootPin} with username: ${username}`,
      details: {
        pin: kahootPin,
        username: username,
        botCount: botCount
      }
    });
    
  } catch (error) {
    // Log the error for debugging
    console.error('Error in kahootbot API:', error.message);
    
    // Send an error response
    return res.status(500).json({
      success: false,
      message: 'Server error occurred while processing your request',
      error: error.message
    });
  }
}
