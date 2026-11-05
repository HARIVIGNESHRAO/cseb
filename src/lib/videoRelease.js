export const VIDEO_RELEASE_AT = Date.parse('2026-11-20T17:00:00+05:30');
export function isVideoReleased(now = Date.now()) {
  return process.env.DHURANDHAR_VIDEO_PREVIEW === 'true' || now >= VIDEO_RELEASE_AT;
}
