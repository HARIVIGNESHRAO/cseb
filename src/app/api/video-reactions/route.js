import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

async function requestReactions(action, visitorId = '', reaction = '') {
  const url = process.env.GOOGLE_SHEETS_VIDEO_REACTIONS_URL;
  const token = process.env.VIDEO_REACTIONS_SECRET;
  if (!url || !token) return NextResponse.json({ error: 'Reactions are currently unavailable.' }, { status: 503 });
  const response = await fetch(url, {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(15000),
    body: new URLSearchParams({ action, visitorId, reaction, token }),
  });
  if (!response.ok) throw new Error('Reaction service request failed');
  const data = await response.json();
  if (data.error || !Number.isSafeInteger(data.likes) || data.likes < 0 ||
      !Number.isSafeInteger(data.dislikes) || data.dislikes < 0 ||
      !['like', 'dislike', 'none'].includes(data.reaction)) throw new Error('Invalid reaction response');
  return NextResponse.json({ likes: data.likes, dislikes: data.dislikes, reaction: data.reaction }, { headers: { 'Cache-Control': 'no-store' } });
}
function validVisitor(value) { return typeof value === 'string' && /^[a-zA-Z0-9-]{16,80}$/.test(value); }
export async function GET(request) {
  const visitorId = new URL(request.url).searchParams.get('visitorId') || '';
  if (visitorId && !validVisitor(visitorId)) return NextResponse.json({ error: 'Invalid visitor.' }, { status: 400 });
  try { return await requestReactions('get', visitorId); }
  catch { return NextResponse.json({ error: 'Unable to load reactions.' }, { status: 502 }); }
}
export async function POST(request) {
  try {
    const { visitorId, reaction } = await request.json();
    if (!validVisitor(visitorId) || !['like', 'dislike', 'none'].includes(reaction)) {
      return NextResponse.json({ error: 'Invalid reaction.' }, { status: 400 });
    }
    return await requestReactions('react', visitorId, reaction);
  } catch { return NextResponse.json({ error: 'Unable to save reaction.' }, { status: 502 }); }
}
