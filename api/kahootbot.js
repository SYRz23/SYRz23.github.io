const WebSocket = require("ws");
const Kahoot = require("kahoot.js-latest");

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { kahootPin, username, botCount = 1 } = req.body;

  try {
    for (let i = 0; i < Math.min(botCount, 50); i++) {
      const client = new Kahoot();
      const botName = botCount > 1 ? `${username}_${i+1}` : username;

      // 1️⃣ Open WebSocket to Kahoot servers
      const ws = new WebSocket(`wss://kahoot.it/cometd/${kahootPin}/handshake`);

      ws.on("open", () => {
        console.log(`🔗 Bot ${botName} WebSocket opened`);
        
        // 2️⃣ Send Handshake request
        ws.send(JSON.stringify({
          channel: "/meta/handshake",
          id: "1",
          version: "1.0",
          minimumVersion: "1.0",
          supportedConnectionTypes: ["websocket", "long-polling"],
          advice: { timeout: 60000, interval: 0 },
        }));
      });

      ws.on("message", async (data) => {
        const response = JSON.parse(data.toString());

        // 3️⃣ Wait for successful handshake response
        if (response.channel === "/meta/handshake" && response.successful) {
          console.log(`✅ Bot ${botName} handshake successful!`);
          
          // 4️⃣ Join the game
          await client.join(kahootPin, botName).catch(err => {
            console.error(`Bot ${i+1} failed:`, err);
          });

          // 5️⃣ Auto-answer questions
          client.on("QuestionStart", (q) => {
            q.answer(Math.floor(Math.random() * q.numberOfAnswers));
          });
        }
      });

      ws.on("error", (err) => {
        console.error(`❌ WebSocket error for bot ${botName}:`, err);
      });

      ws.on("close", () => {
        console.log(`🔒 WebSocket closed for bot ${botName}`);
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `✅ ${botCount} bot(s) joining game ${kahootPin}!` 
    });
  } catch (error) {
    res.status(500).json({ error: "Bot join failed: " + error.message });
  }
};
