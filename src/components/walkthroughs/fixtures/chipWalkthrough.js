// The chip walkthrough the Fathom case study showed until 2026-10-25, when the owner swapped it
// for the replay in src/components/FathomReplay.jsx. The page no longer renders it; the
// walkthrough engine's tests keep it as their fixture, unchanged, so they still exercise every
// part of the engine (thirteen steps, a decision step, tags, evidence and person notes).
export const chipWalkthroughFixture = {
  type: "walkthrough",
  figure: "orion-chip",
  name: "Fathom",
  pace: 0.85,
  regionLabel: "Fathom walkthrough",
  note: "The whole design on one chip. Each part says built or designed.",
  stepsLabel: "Steps of the walkthrough",
  caption: { number: "Fig 1", title: "Fathom as one chip, every part of the design" },
  hint: "Point at a part of the chip to open it. Move away and it runs on its own.",
  hintTouch: "Tap a part of the chip to open it.",
  listHeading: "All thirteen steps as a list",
  listCollapsed: true,
  legend: [
    { term: "built", meaning: "means it exists and works today." },
    { term: "designed", meaning: "means it is planned and not built yet." },
  ],
  controls: {
    play: "Play",
    pause: "Pause",
    prev: "Previous step",
    next: "Next step",
    replay: "Replay",
    skip: "Skip to the list",
    show: "Show on the chip",
    approve: "Approve",
    waive: "Waive",
    reject: "Reject",
  },
  states: {
    paused: "Paused",
    playing: "Playing",
    offscreen: "Plays when in view",
    reading: "Paused while you read",
    waiting: "Waiting for you",
    done: "All thirteen steps shown",
  },
  announce: {
    step: "Step {n}, {label}, {tag}.",
    waiting: "The chip stopped. It is waiting for your decision.",
    decision: "Decision {kind} recorded to the ledger.",
  },
  labels: {
    stepOf: "Step {n} of {total}",
    person: "A person decides.",
    personInList: "A person decides:",
    evidence: "Evidence",
    waiting: "The chip stopped. It is waiting for you.",
    recorded: "You recorded {kind}. The chip carries on.",
    decisionReadout: "Decision recorded: {kind}",
    designedSuffix: "· designed",
    showAria: "Show step {n}, {label}, on the chip",
  },
  steps: [
    {
      id: "sync",
      label: "Sync",
      tag: "built",
      readout: "dbt · Airflow · Git · incident reports",
      does:
        "Gathers tables, jobs, owners and past incidents from dbt, Airflow, Git and incident reports kept as files. It builds a map of what depends on what, plus a log that is only ever added to, all in one database file.",
      evidence:
        "625 dbt models, 21 Airflow pipelines, column-level lineage for 621 of them, full sync in 2 min 9 s, on cal-itp/data-infra, California's public transit data warehouse.",
    },
    {
      id: "store",
      label: "One store",
      tag: "built",
      readout: "every fact says where it came from",
      does:
        "Every fact it stores says where it came from, and the store refuses any fact that does not.",
    },
    {
      id: "explain",
      label: "Explain",
      tag: "built",
      readout: "owner · tier · what it reaches · incidents",
      does:
        "For any table: who owns it, how important it is (its tier), what feeds it and what it feeds, and which tier-1 consumers (its most important users) sit anywhere downstream, the full blast radius of a change. It also shows which scheduled job builds it, which columns feed which, the rules that cover it and recent incidents. Every item carries an id.",
    },
    {
      id: "preflight",
      label: "Preflight",
      tag: "built",
      readout: "inform · warn · block",
      does:
        "The verdict, given before a change ships. It returns what the change does, which downstream columns and tables it reaches, which rules it triggers, past incidents on the same path, a risk score you can inspect, recommended checks and a summary. Every claim cites its evidence.",
      person: "block means a person decides, and the three levels are inform (for information), warn and block.",
    },
    {
      id: "review",
      label: "Review",
      tag: "built",
      readout: "find · suggest · check · format",
      does:
        "Four stages. First, plain code finds what it can using fixed rules. Next, the AI model suggests more possible problems. Then code checks each suggestion against the change and the stored facts. Last, the output is formatted. A finding with no valid evidence is marked uncertain, and one outside the change is rejected.",
    },
    {
      id: "gate",
      label: "Gate",
      tag: "built",
      readout: "fails on warn or block",
      does:
        "A check a team can run automatically on every proposed change (this is called CI). It runs the pre-flight on the change and fails the build when the verdict reaches warn or block, as the team chooses. The verdict is advice only until a team switches this on.",
      person: "Fathom never blocks on its own. The gate is how a team's automatic checks make its verdict binding.",
    },
    {
      id: "mcp",
      label: "MCP",
      tag: "built",
      readout: "seven tools · none write to the platform",
      does:
        "The MCP server, a standard way for coding agents to call a tool. It offers seven: preflight, explain, history, ask, review, record_decision (log a person's choice) and propose_constraint (suggest a new rule). None of them can change the data platform.",
      person:
        "The server's instructions tell the agent to call preflight before writing code and again before opening a pull request, to cite evidence ids rather than paraphrase, and that block means a person decides.",
    },
    {
      id: "record",
      label: "History",
      tag: "built",
      readout: "incidents · past fixes · runs",
      does:
        "What has broken before. Incident reports kept as files, past fixes in Git and the scheduler's run history, tied to the tables and columns they touched, so a check can say this path failed before and how. It makes no AI model call.",
    },
    {
      id: "decision",
      label: "Decision",
      tag: "built",
      readout: "approve / waive / reject",
      does: "Records a person's choice to approve, waive (set aside) or reject a verdict, in a permanent log called the ledger.",
      person: "This is the step. Nothing lands until a person records a decision.",
    },
    {
      id: "postflight",
      label: "Postflight",
      tag: "built",
      readout: "next three runs · outcome recorded",
      does:
        "Closes the loop after a change ships. For each verdict, it finds the change that was merged. It then watches the tables that change touched, and the ones downstream, for their next three scheduled runs. It records one outcome linked to the verdict: clean, failed, missed its promised delivery time (an SLA), or caused an incident.",
    },
    {
      id: "propose",
      label: "Propose",
      tag: "built",
      readout: "rules drafted from ledger patterns",
      does:
        "Drafts new rules (constraints) from patterns in the ledger: repeated missed delivery times, failures after changes, incident reports with no matching rule, and verdicts that were too mild. A nightly job proposes them as a pull request, a request for a person to review and merge the files. Merging is the approval.",
      person:
        "Git, the tool that keeps every version of a project's files, stores the decisions. Rules and incident reports are files, merging is approval, and the history is the audit trail.",
    },
    {
      id: "bench",
      label: "PipelineBench",
      tag: "built",
      readout: "sixty scenarios · four setups",
      does:
        "The benchmark: sixty scenarios with answers written by hand, tried in four setups for what the agent is given (nothing, the repository's files, plain document search, or Fathom), all graded by code.",
      evidence:
        "Forbidden calls by AI agents: 0 of 50 with Fathom, against 8 of 50 with no context.",
    },
    {
      id: "next",
      label: "Next",
      tag: "designed",
      readout: "designed · not built",
      does:
        "Next: a first release for dbt, a second public warehouse, more platform adapters (Dagster, Snowflake query history) and a design partner.",
    },
  ],
};
