import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import {
  DEFAULT_MODE,
  FESTIVAL_MODE_KEY,
  type FestivalMode,
} from "@/lib/festivalMode";

// Node.js (next dev) 環境では getCloudflareContext が使えないためフォールバック
let devModeStore: FestivalMode = DEFAULT_MODE;

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const mode = await env.APP_CONFIG.get(FESTIVAL_MODE_KEY);
    return NextResponse.json({ mode: (mode as FestivalMode) ?? DEFAULT_MODE });
  } catch {
    return NextResponse.json({ mode: devModeStore });
  }
}

export async function POST(request: Request) {
  const { mode } = (await request.json()) as { mode: unknown };
  if (mode !== "tanabata" && mode !== "sakura") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }
  try {
    const { env } = await getCloudflareContext({ async: true });
    await env.APP_CONFIG.put(FESTIVAL_MODE_KEY, mode);
  } catch {
    devModeStore = mode;
  }
  return NextResponse.json({ mode });
}
