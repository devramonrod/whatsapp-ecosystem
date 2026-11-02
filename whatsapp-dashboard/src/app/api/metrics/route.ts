import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || '';

        const res = await fetch('http://config-manager:8082/api/messages/metrics', { 
            cache: 'no-store',
            headers: { 'X-User-ID': userId }
        });
        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
