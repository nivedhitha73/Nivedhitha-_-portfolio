// SECURITY LAYER: shared/lib
// Use this ANY time you must render HTML that didn't come from your own
// trusted templates (e.g. rich text from a CMS or user bio). Never call
// dangerouslySetInnerHTML directly with raw content elsewhere in the app.
import DOMPurify from 'dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
}
