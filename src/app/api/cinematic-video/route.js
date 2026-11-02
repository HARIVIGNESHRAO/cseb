import { isVideoReleased } from '@/lib/videoRelease';
export const dynamic = 'force-dynamic';
const VIDEO_URL = 'https://avbltpanxovdiutnglzb.supabase.co/storage/v1/object/public/dhurandhar/dhurandhar_fade_from_19_6.mp4';

export async function GET(request) {
  if (!isVideoReleased()) return new Response('Video is not released yet.', { status: 403, headers: { 'Cache-Control': 'no-store' } });
  try {
    const headers = new Headers();
    if (request.headers.has('range')) headers.set('Range', request.headers.get('range'));
    const upstream = await fetch(VIDEO_URL, { headers, cache: 'no-store', signal: request.signal });
    const responseHeaders = new Headers({ 'Cache-Control': 'no-store' });
    for (const key of ['content-type', 'content-length', 'content-range', 'accept-ranges']) {
      if (upstream.headers.has(key)) responseHeaders.set(key, upstream.headers.get(key));
    }
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return new Response('Video temporarily unavailable.', { status: 502 });
  }
}
