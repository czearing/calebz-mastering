// Build a mailto: href with an optional pre-filled subject and body. We encode
// each field with encodeURIComponent (not URLSearchParams, which encodes spaces
// as "+"), so RFC 6068 clients render the template with real spaces and line
// breaks instead of literal "+" characters.
export type MailtoFields = {
  subject?: string;
  body?: string;
};

export function buildMailto(email: string, fields: MailtoFields = {}): string {
  const parts: string[] = [];
  if (fields.subject) parts.push(`subject=${encodeURIComponent(fields.subject)}`);
  if (fields.body) parts.push(`body=${encodeURIComponent(fields.body)}`);
  return `mailto:${email}${parts.length ? `?${parts.join("&")}` : ""}`;
}
