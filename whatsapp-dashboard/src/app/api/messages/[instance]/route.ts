import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ instance: string }> }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || '';

        const resolvedParams = await params;
        const res = await fetch(`http://config-manager:8082/api/messages/${resolvedParams.instance}`, {
            cache: 'no-store',
            headers: { 'X-User-ID': userId }
        });
        
        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: res.status });
        }
        const messages = await res.json();
        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
