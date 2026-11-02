export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const CONFIG_MANAGER_URL = "http://config-manager:8082/api/tenants";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '';

    const res = await fetch(CONFIG_MANAGER_URL, { 
      cache: 'no-store',
      headers: { 'X-User-ID': userId }
    });
    if (!res.ok) throw new Error("Failed to fetch tenants");
    let data = await res.json();
    
    // Mask the API keys
    data = data.map((tenant: any) => {
      if (tenant.aiApiKey) {
        tenant.aiApiKey = "sk-••••••••••••••••••••••••••••••••";
      }
      return tenant;
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '';

    const body = await request.json();
    const res = await fetch(CONFIG_MANAGER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
