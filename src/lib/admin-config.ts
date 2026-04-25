// Full access admin emails - can access all admin pages
export const FULL_ACCESS_ADMIN_EMAILS = [
  "admin@linexforsa.com",
  // Add more full access admin emails here
];

export function isFullAccessAdmin(email: string): boolean {
  return FULL_ACCESS_ADMIN_EMAILS.includes(email.toLowerCase());
}
