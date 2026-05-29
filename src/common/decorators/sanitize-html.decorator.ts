import * as sanitizeHtml from 'sanitize-html';
import {
  ALLOWED_HTML_TAGS,
  ALLOWED_HTML_ATTRIBUTES,
  ALLOWED_HTML_SCHEMES,
} from '../constants/html-sanitizer.constants';
import { Transform } from 'class-transformer';

/**
 * Decorador para DTOs que sanitiza campos HTML de entrada utilizando sanitize-html.
 * Previene vulnerabilidades de Cross-Site Scripting (XSS) limpiando
 * etiquetas y atributos no deseados, según la lista blanca definida en el RFC.
 */
export function SanitizeHtml() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const sanitize = sanitizeHtml as unknown as (
      text: string,
      options?: Record<string, unknown>,
    ) => string;

    return sanitize(value, {
      allowedTags: ALLOWED_HTML_TAGS,
      allowedAttributes: ALLOWED_HTML_ATTRIBUTES,
      allowedSchemes: ALLOWED_HTML_SCHEMES,
      allowedIframeHostnames: [],
    });
  });
}
