import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ instance: string; remoteJid: string }> }) {
    try {
        const resolvedParams = await params;
        const res = await fetch(`http://config-manager:8082/api/leads/${resolvedParams.instance}/${resolvedParams.remoteJid}`, { cache: 'no-store' });
        if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status });
        return NextResponse.json(await res.json());
    } catch (error) {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ instance: string; remoteJid: string }> }) {
    try {
        const resolvedParams = await params;
        const body = await request.json();
        const res = await fetch(`http://config-manager:8082/api/leads/${resolvedParams.instance}/${resolvedParams.remoteJid}/toggle`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) return NextResponse.json({ error: 'Failed' }, { status: res.status });
        return NextResponse.json(await res.json());
    } catch (error) {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}