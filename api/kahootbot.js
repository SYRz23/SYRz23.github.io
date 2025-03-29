const WebSocket = require('ws');
const crypto = require('crypto');

class KahootBot {
  constructor() {
    this.ws = null;
    this.pin = null;
    this.token = null;
    this.clientId = null;
  }

  async getSessionToken(pin) {
    const response = await fetch(`https://kahoot.it/reserve/session/${pin}`);
    const data = await response.json();
    
    // Extract the offset (usually 73, but parsed dynamically)
    const offsetMatch = data.challenge.match(/offset\s*=\s*\(\((\d+)\+/);
    const offset = offsetMatch ? parseInt(offsetMatch[1]) : 73;
    
    // Extract encoded message
    const message = data.challenge.match(/'([^']+)'/)[1];
    
    // Decode each character
    let token = '';
    for (let i = 0; i < message.length; i++) {
      const code = ((message.charCodeAt(i) * i + offset) % 77) + 48;
      token += String.fromCharCode(code);
    }
    
    return token;
  }

  async join(pin, username) {
    this.pin = pin;
    this.token = await this.getSessionToken(pin);
    this.clientId = crypto.randomBytes(16).toString('hex');

    this.ws = new WebSocket(`wss://kahoot.it/cometd/${pin}/${this.token}`);

    return new Promise((resolve, reject) => {
      this.ws.on('open', () => {
        // 1. Handshake
        this.send('/meta/handshake', {
          version: '1.0',
          minimumVersion: '1.0',
          supportedConnectionTypes: ['websocket']
        });

        // 2. Connect after handshake
        this.ws.on('message', (data) => {
          const msg = JSON.parse(data);
          
          if (msg.channel === '/meta/handshake' && msg.successful) {
            this.send('/meta/connect', {
              connectionType: 'websocket',
              clientId: this.clientId
            });
          }
          
          // 3. Join game after connection
          else if (msg.channel === '/meta/connect' && msg.successful) {
            this.send('/service/controller', {
              type: 'login',
              gameid: pin,
              host: 'kahoot.it',
              name: username,
              content: JSON.stringify({
                device: { userAgent: 'Mozilla/5.0' }
              })
            });
          }
          
          // 4. Confirm join success
          else if (msg.channel === '/service/player' && 
                  JSON.parse(msg.data?.content || '{}').type === 'loginResponse') {
            resolve();
          }
        });
      });

      this.ws.on('error', reject);
    });
  }

  send(channel, data) {
    this.ws.send(JSON.stringify({
      channel,
      clientId: this.clientId,
      data,
      id: crypto.randomBytes(8).toString('hex')
    }));
  }

  answer(questionIndex, choice) {
    this.send('/service/controller', {
      type: 'message',
      content: JSON.stringify({
        type: 'questionAnswer',
        choice,
        questionIndex,
        meta: { lag: Math.floor(Math.random() * 100) }
      })
    });
  }
}

// Usage example
module.exports = async (req, res) => {
  const { pin, username, botCount = 1 } = req.body;
  const bots = [];

  for (let i = 0; i < Math.min(botCount, 50); i++) {
    const bot = new KahootBot();
    await bot.join(pin, `${username}_${i+1}`);
    bots.push(bot);
    
    // Auto-answer logic
    bot.ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.data?.content?.type === 'question') {
        const q = JSON.parse(msg.data.content);
        bot.answer(q.questionIndex, Math.floor(Math.random() * q.numberOfChoices));
      }
    });
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  res.json({ success: true, bots: bots.length });
};
