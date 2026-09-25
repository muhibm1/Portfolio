/**
 * Prerenders every route the app serves into dist/, plus the not-found page (spec interface
 * (d), ADR 0001). Reads dist/index.html once as the shell, imports the SSR build's render()
 * from dist-ssr/entry-server.js, and for each path in sitePagePaths() plus one path the app
 * does not define (for the 404 page), assembles the page with assemblePage() and writes it with
 * writePage().
 *
 * Fails closed: a missing shell, a missing dist-ssr build, a shell that assemblePage rejects, or
 * a render throw exits 1 with `::error::Prerender failed: <reason>` and writes nothing. Prints
 * `Prerendered <n> pages` on success.
 *
 * Usage, from the repository root, after `vite build` and `vite build --ssr src/entry-server.jsx
 * --outDir dist-ssr`:
 *   node scripts/prerender.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { sitePagePaths, assemblePage, writePage } from './route-pages.mjs'

const EXIT_OK = 0
const EXIT_FAILED = 1
// Resolved against the working directory, not this script's own location, so this file behaves
// the same whether npm runs it from the repository root (the real build) or a test spawns it
// with a temporary directory as cwd (F1).
const WORKING_DIRECTORY = process.cwd()
const DIST_DIR = path.join(WORKING_DIRECTORY, 'dist')
const SSR_ENTRY = path.join(WORKING_DIRECTORY, 'dist-ssr', 'entry-server.js')
const BASE = '/Portfolio'
// A path the app defines no route for, so it renders the not-found page (ADR 0001). Used both
// as the rendered URL and as the pathname pageMetaFor reads, so the two agree on which page this is.
const NOT_FOUND_ROUTE_PATH = '/prerender-not-found-sentinel'

process.exitCode = await main()

async function main() {
  try {
    const shellHtml = readShell()
    const { render, pageMetaFor, headTags } = await import(pathToFileURL(SSR_ENTRY).href)

    const pages = [
      ...sitePagePaths().map((pagePath) => ({
        pagePath,
        routePath: pagePath,
        url: `${BASE}${pagePath === '/' ? '' : pagePath}`,
      })),
      { pagePath: '/404', routePath: NOT_FOUND_ROUTE_PATH, url: `${BASE}${NOT_FOUND_ROUTE_PATH}` },
    ]

    const written = pages.map(({ pagePath, routePath, url }) => {
      const meta = pageMetaFor(routePath)
      const html = assemblePage(shellHtml, { headHtml: headTags(meta), appHtml: render(url) })
      return writePage(DIST_DIR, pagePath, html)
    })

    console.log(`Prerendered ${written.length} pages`)
    return EXIT_OK
  } catch (error) {
    console.log(`::error::Prerender failed: ${error.message}`)
    return EXIT_FAILED
  }
}

function readShell() {
  const shellPath = path.join(DIST_DIR, 'index.html')
  if (!fs.existsSync(shellPath)) {
    throw new Error(`${relativeToRoot(shellPath)} does not exist; run the client build first`)
  }
  if (!fs.existsSync(SSR_ENTRY)) {
    throw new Error(
      `${relativeToRoot(SSR_ENTRY)} does not exist; run "vite build --ssr src/entry-server.jsx --outDir dist-ssr" first`,
    )
  }
  return fs.readFileSync(shellPath, 'utf8')
}

function relativeToRoot(absolutePath) {
  return path.relative(WORKING_DIRECTORY, absolutePath).split(path.sep).join('/')
}
