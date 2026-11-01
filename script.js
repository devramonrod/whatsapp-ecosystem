require('dotenv').config();

async function run() {
  const evolutionUrl = process.env.EVOLUTION_SERVER_URL || 'http://localhost:8080';
  const apiKey = process.env.EVOLUTION_API_KEY;
  const webhookUrl = process.env.WHATSAPP_GATEWAY_URL ? `${process.env.WHATSAPP_GATEWAY_URL}/webhook/evolution` : 'http://whatsapp-gateway:8081/webhook/evolution';

  if (!apiKey) {
    console.error("EVOLUTION_API_KEY not set in environment");
    process.exit(1);
  }

  const res = await fetch(`${evolutionUrl}/webhook/set/ELOISA`, {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: webhookUrl,
        byEvents: false,
        base64: true,
        events: ['MESSAGES_UPSERT']
      }
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
