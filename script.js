async function run() {
  const res = await fetch('http://localhost:8080/webhook/set/ELOISA', {
    method: 'POST',
    headers: {
      'apikey': 'B6D711FCDE4D4FD5936544120E713976',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: 'http://whatsapp-gateway:8081/webhook/evolution',
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
