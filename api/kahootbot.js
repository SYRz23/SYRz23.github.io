const WebSocket = require('ws');
const fetch = require('node-fetch');
const crypto = require('crypto');

// Anti-blocking headers
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Origin': 'https://kahoot.it',
  'Referer': 'https://kahoot.it/'
};

async function getKahootToken(pin) {
  const url = `https://kahoot.it/reserve/session/${pin}?_=${Date.now()}`;
  const response = await fetch(url, { headers: HEADERS });
  
  if (!response.ok) throw new Error(`Kahoot API responded with ${response.status}`);
  
  const data = await response.json();
  const challenge = data.challenge.match(/'([^']+)'/)[1];
  
  // 2024 Decoding Algorithm
  return Array.from(challenge).map((char, i) => {
    return String.fromCharCode(((char.charCodeAt(0) * i + 73) % 77 + 48);
  }).join('');
}

module.exports = async (req, res) => {
  // CORS handling...
  
  try {
    const { kahootPin, username, botCount = 1 } = req.body;
    
    // Validate PIN format (6-7 digits)
    if (!/^\d{6,7}$/.test(kahootPin)) {
      return res.status(400).json({ error: 'Invalid PIN format' });
    }

    const token = await getKahootToken(kahootPin);
    const results = [];
    
    for (let i = 0; i < Math.min(botCount, 10); i++) { // Reduced to 10 bots max
      const botName = `${username}_${i+1}`;
      
      try {
        const ws = new WebSocket(`wss://kahoot.it/cometd/${kahootPin}/${token}`, {
          headers: HEADERS,
          handshakeTimeout: 15000
        });

        await new Promise((resolve, reject) => {
          ws.on('open', () => {
            const clientId = crypto.randomBytes(16).toString('hex');
            
            // Critical: Must send exactly this handshake
            ws.send(JSON.stringify({
              channel: "/meta/handshake",
              version: "1.0",
              supportedConnectionTypes: ["websocket"],
              id: clientId
            }));
          });

          ws.on('message', (data) => {
            const msg = JSON.parse(data);
            if (msg.successful) results.push({ botName, status: 'connected' });
          });

          ws.on('error', reject);
        });

        // Randomized delay (500-1500ms)
        await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
        
      } catch (err) {
        results.push({ botName, status: 'failed', error: err.message });
      }
    }

    res.json({
      success: results.some(r => r.status === 'connected'),
      connected: results.filter(r => r.status === 'connected').length,
      failed: results.filter(r => r.status === 'failed').length
    });

  } catch (error) {
    res.status(500).json({ 
      error: "Connection blocked",
      solution: "Kahoot is detecting bots. Try: 1) Different IP 2) Fewer bots 3) Wait 1 hour",
      details: error.message
    });
  }
};
