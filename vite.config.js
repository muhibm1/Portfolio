import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { neverInlineFonts } from './scripts/never-inline-fonts.mjs'

// GitHub Pages serves this repository as a project site under /Portfolio/. Without this prefix
// every asset URL points at the domain root and the page loads with no CSS or JS.
const PAGES_BASE = '/Portfolio/'

// Pages cannot set response headers, so the policy ships as a meta tag (ADR 0006). The
// directives are the spec's policy verbatim, in the spec's order.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  'upgrade-insecure-requests',
].join('; ')

const REFERRER_POLICY = 'strict-origin-when-cross-origin'

// https://vite.dev/config/
export default defineConfig({
  base: PAGES_BASE,
  plugins: [
    react(),
    tailwindcss(),
    githubPagesBuild(),
  ],
  // Which assets Vite may inline as data: URLs is decided in scripts/never-inline-fonts.mjs.
  build: { assetsInlineLimit: neverInlineFonts },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    include: ['src/**/*.test.{js,jsx}'],
    restoreMocks: true,
  },
})

/**
 * Build-only step GitHub Pages needs: puts the CSP and referrer meta tags first in <head>, so
 * every prerendered page inherits them from this shell (ADR 0001). Writing the route pages
 * themselves moved out of this plugin: scripts/prerender.mjs now does it after a second SSR
 * build, so each page carries its own rendered markup and head tags instead of a byte-identical
 * copy of this file (ADR 0001, 2026-09-25). Dev is left alone.
 */
function githubPagesBuild() {
  return {
    name: 'github-pages-build',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: () => [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
          injectTo: 'head-prepend',
        },
        {
          tag: 'meta',
          attrs: { name: 'referrer', content: REFERRER_POLICY },
          injectTo: 'head-prepend',
        },
      ],
    },
  }
}
