import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Forward the message to the config-manager service
    // Ensure you use the correct internal Docker URL or localhost if running locally
    const backendUrl = process.env.NEXT_PUBLIC_CONFIG_MANAGER_URL || "http://config_manager:8082";
    
    const response = await fetch(`${backendUrl}/api/messages/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

