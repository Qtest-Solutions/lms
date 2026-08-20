export const JITSI_HOST = process.env.JITSI_HOST || "8x8.vc";
export const JITSI_APP_ID = process.env.JITSI_APP_ID || "";

export function jitsiRoom(sessionId: string): string {
  return JITSI_APP_ID ? `${JITSI_APP_ID}/lms-${sessionId}` : `lms-${sessionId}`;
}

export function jitsiRoomUrl(sessionId: string): string {
  return `https://${JITSI_HOST}/${jitsiRoom(sessionId)}`;
}

export function jitsiExternalApiUrl(): string {
  return `https://${JITSI_HOST}/${JITSI_APP_ID}/external_api.js`;
}