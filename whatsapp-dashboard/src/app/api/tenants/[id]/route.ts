import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { encrypt } from '@/utils/encryption';

const CONFIG_MANAGER_URL = "http://config-manager:8082/api/tenants";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '';

    const { id } = await params;
    const body = await request.json();
    
    // Encrypt the API key before sending to backend if it's not masked
    if (body.aiApiKey && !body.aiApiKey.includes('••••')) {
      body.aiApiKey = encrypt(body.aiApiKey);
    } else if (body.aiApiKey && body.aiApiKey.includes('••••')) {
      // Don't update the key if it's just the masked placeholder
      delete body.aiApiKey;
    }

    const res = await fetch(`${CONFIG_MANAGER_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '';

    const url = new URL(request.url);
    const instanceName = url.searchParams.get("instanceName");

    const { id } = await params;

    // 1. Apagar no Evolution API
    if (instanceName) {
      const evolutionUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || "http://evolution_api:8080";
      const apikey = process.env.EVOLUTION_API_KEY || "429683C4C977415CAAFCCE10F7D57E11";
      
      try {
        // Logout first
        await fetch(`${evolutionUrl}/instance/logout/${instanceName}`, {
          method: 'DELETE',
          headers: { 'apikey': apikey }
        });
        
        // Then delete
        await fetch(`${evolutionUrl}/instance/delete/${instanceName}`, {
          method: 'DELETE',
          headers: { 'apikey': apikey }
        });
        console.log(`Instância ${instanceName} apagada do Evolution API.`);
      } catch (err) {
        console.error(`Erro ao apagar instância ${instanceName} do Evolution API:`, err);
        // Continue to delete from DB even if evolution fails
      }
    }

    // 2. Apagar no Banco de Dados (config-manager)
    const res = await fetch(`${CONFIG_MANAGER_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'X-User-ID': userId }
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

