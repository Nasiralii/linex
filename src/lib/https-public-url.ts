/**
 * Whether the app is served over HTTPS for end users.
 * Used for cookie `Secure` flag: browsers ignore Secure cookies on plain HTTP,
 * so EC2/IP deployments using http:// must not set secure: true.
 */
export function isPublicUrlHttps(): boolean {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
  return url.startsWith("https://");
}
