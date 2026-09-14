// Vite inlines small assets as data: URLs, which this site's font-src 'self' blocks, so every font
// is emitted as a file instead (ADR 0001). Returning false means "emit a file" and undefined means
// "use Vite's default". vite.config.js imports this module; nothing runs it.

const FONT_EXTENSION = /\.(woff2?|ttf|otf|eot)$/i

export function neverInlineFonts(filePath) {
  return FONT_EXTENSION.test(filePath) ? false : undefined
}
