// Route-level proof of the owner's master-copy change (2026-10-08): renders all seven served
// routes in process, the way src/prerenderIntegration.test.js does, and checks the strings,
// the human-gate marker and the cross-reference sentences in the HTML a visitor would receive.
// The banned list below is written out here on purpose, independent of scripts/forbidden-copy.mjs,
// so a scanner regression cannot hide a leak from this file.
import { describe, expect, it } from 'vitest';
import { assemblePage, sitePagePaths } from '../scripts/route-pages.mjs';
import { render, pageMetaFor, headTags } from './entry-server.jsx';
import { portfolioData } from './data/portfolioData';

const BASE = '/Portfolio';
const DECISION_PATH = '/work/apple-llm-triage';
const INTEGRATION_PATH = '/work/apple-integration';
const WORKHORSE_PATH = '/work/workhorse';

const SHELL_HTML =
  '<!doctype html><html><head><title>shell title</title>\n' +
  '<meta name="description" content="shell description">\n' +
  '</head><body><div id="root"></div></body></html>';

const DECISION_SENTENCE =
  'The decision this produces is carried out by a separate tool I built, covered in the next case study.';
const INTEGRATION_SENTENCE =
  'The judgment behind these requests is covered in the previous case study. This one is about what happens after the decision is made.';
const THROUGHPUT_SENTENCE = 'It came from removing the investigation in front of it.';
const STUDBOOK_SUBTITLE = "Cited retrieval (RAG) over WorkHorse's engineering record";
const HERO_HEADING = 'I find the step everyone is waiting on.';
const HERO_LEAD =
  'Data Engineer at Apple Maps. The platform is rarely the problem, the process around it usually is. So I start by finding where the work actually stalls, scope the fix with the people it affects, and put agents and automation on live data behind guardrails that make them safe to trust. Success is a number that moved; anything short of that is another iteration.';

// The master document's item 1 and item 2 list.
const BANNED_ON_EVERY_ROUTE = [
  /\bTCS\b/i,
  /\bTata\b/i,
  /\bvia\b/i,
  /\bcontractors?\b/i,
  /\bvendors?\b/i,
  /\bconsultanc(?:y|ies)\b/i,
  /\bplugins?\b/i,
  /\bmessy\b/i,
  /approve, reject or hold/i,
  /\bdecision layer\b/i,
  /\bacts? on live data\b/i,
  /\bdecision systems?\b/i,
  /\btickets decided\b/i,
  /\bdecides each ticket\b/i,
  /\bself-hosted\b/i,
  /\bOllama\b/i,
  /\beleven times\b/i,
  /(?<!\d)0 rejected\b|\bzero rejected\b/i,
];

const CROSS_TEAM = /cross[- ]teams?/i;
// Active and modal forms ("the agent can approve", "the model will decide") and passive forms
// ("is applied automatically", "are approved automatically") that give the agent the decision.
const AGENT_AUTHORITY = new RegExp(
  '\\b(?:(?:agent|system|model) (?:(?:can|will|may|could|would|should) )?(?:decides?|approves?|rejects?|unlocks?|applies|apply|acts?)'
    + '|(?:is|are) (?:applied|approved|rejected|decided|unlocked) automatically)\\b',
  'i',
);

const pages = Object.fromEntries(
  sitePagePaths().map((path) => [path, servedPage(path)]),
);

function servedPage(path) {
  const meta = pageMetaFor(path);
  const appHtml = render(`${BASE}${path === '/' ? '' : path}`);
  return assemblePage(SHELL_HTML, { headHtml: headTags(meta), appHtml });
}

function parse(html) {
  return new DOMParser().parseFromString(html, 'text/html');
}

function occurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function textOf(html) {
  return parse(html).body.textContent;
}

function studyForPath(path) {
  return portfolioData.caseStudies.find((study) => `/work/${study.id}` === path);
}

function gateStepCountInData(path) {
  const study = studyForPath(path);
  if (!study) return 0;
  return study.sections
    .flatMap((section) => section.blocks)
    .filter((block) => block.type === 'flow')
    .flatMap((block) => block.steps)
    .filter((step) => step.gate === true).length;
}

describe('master copy served on every route (2026-10-08)', () => {
  it('serves all seven routes', () => {
    expect(sitePagePaths()).toHaveLength(7);
  });

  it('renders six decision steps with Reviewer decides as the only dark human gate (R5, item 5)', () => {
    const doc = parse(pages[DECISION_PATH]);

    const items = [...doc.querySelectorAll('#built ol > li')];
    const gates = items.filter((item) => item.hasAttribute('data-gate'));

    expect(items).toHaveLength(6);
    expect(gates).toHaveLength(1);
    expect(gates[0]).toBe(items[5]);
    expect(gates[0].getAttribute('data-gate')).toBe('true');
    expect(gates[0].textContent.trim()).toBe('Reviewer decides');
    expect(occurrences(pages[DECISION_PATH], 'data-gate')).toBe(1);
  });

  it('places each cross-reference sentence exactly once, on its own page (R7, item 6)', () => {
    for (const path of sitePagePaths()) {
      const html = pages[path];
      const decisionCount = path === DECISION_PATH ? 1 : 0;
      const integrationCount = path === INTEGRATION_PATH ? 1 : 0;

      expect(occurrences(html, escapeHtml(DECISION_SENTENCE)), `${path} decision sentence`).toBe(decisionCount);
      expect(occurrences(html, escapeHtml(INTEGRATION_SENTENCE)), `${path} integration sentence`).toBe(integrationCount);
    }
  });

  it('serves the new hero as the h1 and as every home description tag (R1, items 13, 14)', () => {
    const doc = parse(pages['/']);

    expect(doc.querySelector('h1').textContent).toBe(HERO_HEADING);
    expect(doc.querySelector('meta[name="description"]').getAttribute('content')).toBe(HERO_LEAD);
    expect(doc.querySelector('meta[property="og:description"]').getAttribute('content')).toBe(HERO_LEAD);
    expect(doc.querySelector('meta[name="twitter:description"]').getAttribute('content')).toBe(HERO_LEAD);
    expect(doc.querySelectorAll('noscript')).toHaveLength(0);
    expect(pages['/']).not.toContain('<noscript');
  });

  it('serves no banned string on any route, with cross-team only off the integration page (R3, items 1, 2)', () => {
    for (const path of sitePagePaths()) {
      for (const banned of BANNED_ON_EVERY_ROUTE) {
        expect(pages[path], `${path} matches ${banned}`).not.toMatch(banned);
      }
    }

    expect(pages[INTEGRATION_PATH]).not.toMatch(CROSS_TEAM);
    expect(pages[DECISION_PATH]).toMatch(CROSS_TEAM);
  });

  it('explains the throughput gain and gives the agent no authority and no accuracy figure (R13, items 3, 4)', () => {
    const text = textOf(pages[DECISION_PATH]);

    expect(text).toContain(THROUGHPUT_SENTENCE);
    expect(text).not.toContain('%');
    expect(text).not.toMatch(/accura/i);
    expect(text).not.toMatch(AGENT_AUTHORITY);
  });

  it('serves the Studbook subtitle once, under its heading, on the WorkHorse page only (R9)', () => {
    const escaped = escapeHtml(STUDBOOK_SUBTITLE);
    const studbook = studyForPath(WORKHORSE_PATH).sections.find((section) => section.id === 'studbook');
    const heading = [...parse(pages[WORKHORSE_PATH]).querySelectorAll('h2')].find(
      (h2) => h2.textContent === studbook.heading,
    );

    for (const path of sitePagePaths()) {
      expect(occurrences(pages[path], escaped), path).toBe(path === WORKHORSE_PATH ? 1 : 0);
    }

    expect(heading.nextElementSibling.tagName).toBe('P');
    expect(heading.nextElementSibling.textContent).toBe(STUDBOOK_SUBTITLE);
  });

  it('serves a human gate marker on the decision page and only on gate steps elsewhere (R5)', () => {
    for (const path of sitePagePaths()) {
      const expected = path === DECISION_PATH ? 1 : gateStepCountInData(path);

      expect(occurrences(pages[path], 'data-gate'), path).toBe(expected);
    }
    expect(gateStepCountInData(DECISION_PATH)).toBe(1);
  });
});

describe('AGENT_AUTHORITY pattern', () => {
  it.each([
    'The agent decides each ticket.',
    'The agent can approve the change.',
    'The model will decide which tickets ship.',
    'The system may reject a request.',
    'Every fix is applied automatically.',
    'Low-risk changes are approved automatically.',
  ])('hits the bad phrasing: %s', (sentence) => {
    expect(sentence).toMatch(AGENT_AUTHORITY);
  });

  it.each([
    'The agent recommends and a person decides.',
    'The system can recommend a fix for a person to review.',
    'The model will suggest an order; a person approves it.',
    'Nothing is applied until a person approves it.',
    'Changes are approved by a person.',
  ])('does not hit the near miss: %s', (sentence) => {
    expect(sentence).not.toMatch(AGENT_AUTHORITY);
  });
});
