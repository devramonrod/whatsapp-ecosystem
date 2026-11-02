import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://evolution-api:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '';

    const body = await request.json();
    const { instanceName } = body;

    if (!instanceName) {
      return NextResponse.json({ error: "Instance name is required" }, { status: 400 });
    }

    // 1. Create Instance in Evolution API
    const createRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      })
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      return NextResponse.json({ error: "Failed to create instance", details: err }, { status: createRes.status });
    }

    const instanceData = await createRes.json();

    // 2. Set Webhook so Agent Core can receive messages
    await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        webhook: {
          enabled: true,
          url: "http://whatsapp-gateway:8081/webhook/evolution",
          byEvents: false,
          base64: true,
          events: ["MESSAGES_UPSERT"]
        }
      })
    });

    // 3. Create placeholder TenantConfig in our DB
    try {
      await fetch("http://config-manager:8082/api/tenants", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': userId 
        },
        body: JSON.stringify({
          phoneNumberId: instanceName,
          businessType: "Novo Negócio",
          systemPrompt: "Você é um assistente virtual.",
          aiProvider: "OPENAI",
          aiApiKey: ""
        })
      });
    } catch (dbErr) {
      console.error("Failed to create tenant config. Ignoring for now.", dbErr);
    }

    return NextResponse.json(instanceData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
