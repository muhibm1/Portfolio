export const portfolioData = {
  personal: {
    name: "Muhammad Muhibullah",
    monogram: "MM",
    role: "Forward Deployed Engineer & Systems Integration",
    subtitle: "Data Engineer at Apple (via TCS) · Austin, TX",
    email: "mmalqaim@gmail.com",
    phone: "(512) 508-1536",
    location: "Austin, TX",
    linkedin: "https://www.linkedin.com/in/muhibm1/",
    linkedinHandle: "linkedin.com/in/muhibm1",
    status: "Available for Forward Deployed Engineering & Solutions Eng Roles",
    summary: `Engineer targeting Forward Deployed Engineering roles, where connecting a client's real systems and shipping working software matter more than following a fixed roadmap. Built production integrations between disparate backend systems through authenticated APIs, owned the data validation layer that keeps automated decisions trustworthy, and shipped full-stack features—from backend logic to user interfaces—for a live LLM system in production. Comfortable moving fast, with judgment on where more rigor is warranted.`
  },

  telemetry: [
    {
      metric: "350+",
      unit: "tickets/day",
      label: "LLM Triage Throughput",
      context: "Scaled from 30/day at Apple with auditable decision layer"
    },
    {
      metric: "50+",
      unit: "regions",
      label: "ML Remediation Reach",
      context: "Automated cleanup & data modernization across global pipelines"
    },
    {
      metric: "-40%",
      unit: "incidents",
      label: "Production Outage Drop",
      context: "Achieved via CI/CD gates, schema rewrites & WebSocket sync"
    },
    {
      metric: "99.9%",
      unit: "reliability",
      label: "Release Continuity",
      context: "Spark, Iceberg, Snowflake & AWS EKS checkpoint gates"
    }
  ],

  philosophy: [
    {
      number: "01",
      title: "Zero-to-One Systems Integration",
      tagline: "Connecting real enterprise architectures, not clean-room abstractions.",
      description: "Client data never lives in one tidy place. I build authenticated integration bridges (OAuth2, REST, WebSockets) that connect ticketing systems, git repositories, data lakes, and geo-data layers—turning manual cross-team friction into on-demand automation."
    },
    {
      number: "02",
      title: "Auditable LLM Decision Gates",
      tagline: "Moving beyond toy chatbots to safe, production-grade automated actions.",
      description: "Autonomous models must never run rampant on live enterprise state. I architect hybrid decision gates: deterministic validation rules paired with LLM contextual reasoning, strict confidence thresholds, and human-in-the-loop review queues for complete auditability."
    },
    {
      number: "03",
      title: "Production Rigor & Scale",
      tagline: "Distributed pipelines that survive concurrent global releases.",
      description: "Speed without resilience creates operational fires. Having maintained quality gates and automated ML remediation across 50+ regions on Spark, Iceberg, Snowflake, and AWS EKS, I know how to enforce data health while preserving deployment velocity."
    }
  ],

  caseStudies: [
    {
      id: "apple-llm-triage",
      title: "Apple: Production LLM Ticket Decision & Triage Engine",
      client: "Apple (via TCS)",
      role: "Forward Deployed & Data Systems Engineer",
      period: "Feb 2025 – Present",
      category: "LLM Decision Systems",
      badge: "Production AI Gate",
      summary: "Architected and maintain an auditable LLM decision system reviewing structured ticket payloads, classifying access requests (approve / hold / reject), and scaling throughput from 30 to 350+ tickets/day with zero unauthorized actions.",
      challenge: `At enterprise scale, manual cross-team request approvals created a severe bottleneck: high-volume ticket queues (ticketing, repository permissions, and geo-data access) required human engineering review, capping throughput at ~30 tickets/day. Previous automation attempts failed due to edge-case ambiguities and the high risk of granting incorrect automated permissions on production systems.`,
      solution: `Designed a hybrid decision pipeline uniting:
1. Cross-System OAuth2 Tool: Built a Python integration bridge communicating via authenticated REST APIs with ticketing, Git repos, and geo-data systems.
2. Structured Ticket Parser: Normalized disparate ticket payloads into typed feature sets and validation schemas.
3. LLM Decision Gate with Dual-Guardrails: Deterministic safety policies filter clear rejections; an LLM classifies nuanced tickets and outputs structured rationale with confidence scores.
4. Human-Reviewable Decision Layer: Low-confidence or high-risk requests are routed to an auditable triage dashboard, while high-confidence routine tickets execute automated actions safely on live data.`,
      impact: [
        { label: "Daily Throughput", before: "30 tickets/day", after: "350+ tickets/day", change: "11x Increase" },
        { label: "Cross-System Workflow", before: "Manual emails & tickets", after: "On-demand OAuth2 tool", change: "100% Automated" },
        { label: "Audit Compliance", before: "Fragmented logs", after: "Immutable audit trail", change: "Enterprise Compliant" }
      ],
      diagramSteps: [
        { title: "Ticketing & Geo Ingest", desc: "Tickets pulled via OAuth2 REST API from enterprise systems." },
        { title: "Schema Normalization", desc: "Python tool validates permissions, repo status, and geo boundaries." },
        { title: "Dual Decision Gate", desc: "Deterministic rules + LLM structured classification & confidence scoring." },
        { title: "Action Routing", desc: "Confidence ≥ 95% -> Auto-Approve; Low/Ambiguous -> Human-in-the-Loop Queue." }
      ],
      techStack: ["Python", "OAuth2", "REST APIs", "LLM Prompt Tuning", "Postgres", "Docker", "Git Integration"]
    },
    {
      id: "apple-data-health",
      title: "Apple / Data Health: 50+ Region ML Remediation & Pipeline Reliability",
      client: "Apple (via TCS)",
      role: "Data & Systems Reliability Engineer",
      period: "Feb 2025 – Present",
      category: "Distributed Data & Cloud",
      badge: "Distributed Systems",
      summary: "Built and tuned ML-driven remediation jobs that continuously clean and modernize live production data across 50+ regions, maintaining quality gates and rollback logic on Spark, Iceberg/S3, Snowflake, and AWS EKS.",
      challenge: `Managing a distributed data pipeline spanning 50+ geographic regions meant that even minor data drift or validation discrepancies in upstream ingest blocked repositories from being promoted to production. Uncoordinated releases risked cascading validation failures and stalled multi-regional deployment schedules.`,
      solution: `As an integral member of the Data Health team setting pipeline quality and engineering standards:
1. Automated ML-Driven Remediation: Deployed continuous jobs to detect anomalies, reconcile schema drift, and cleanse production data before downstream consumers ingest it.
2. Build Readiness Gating: Established automated validation checkpoints that verify data integrity before promoting repos to production, coordinating directly with DataOps.
3. Distributed Reliability & Rollbacks: Maintained quality gates and automated rollback mechanisms across Spark, Iceberg/S3, Snowflake, Kafka streaming ingest, and AWS EKS execution.
4. Production Incident Triage: Spearheaded technical triage during high-severity outages, establishing permanent regression prevention.`,
      impact: [
        { label: "Regional Coverage", before: "Ad-hoc monitoring", after: "50+ Global Regions", change: "Continuous" },
        { label: "Release Promotion", before: "Frequent validation blocks", after: "Automated ML remediation", change: "On Schedule" },
        { label: "Build Continuity", before: "Manual rollbacks", after: "Checkpoint rollback logic", change: "Zero Data Corruption" }
      ],
      diagramSteps: [
        { title: "Distributed Ingest", desc: "Streaming Kafka & batch S3 files across 50+ concurrent regions." },
        { title: "ML Remediation Engine", desc: "Tuned Spark jobs identify schema drift and clean validation anomalies." },
        { title: "Data Health Gates", desc: "Strict checkpoints verify repo build readiness before promotion." },
        { title: "Snowflake & Iceberg Sync", desc: "Reliable commits with automated rollback guards on AWS EKS." }
      ],
      techStack: ["Apache Spark", "Apache Iceberg", "Snowflake", "AWS EKS", "AWS S3", "Kafka", "Docker", "Jenkins"]
    },
    {
      id: "neural-newsletters-llm",
      title: "Neural Newsletters: Full-Stack Personalized LLM Platform",
      client: "Neural Newsletters",
      role: "Software & Systems Engineer",
      period: "May 2024 – Feb 2025",
      category: "Full-Stack & Real-Time",
      badge: "Real-Time AI System",
      summary: "Owned end-to-end personalization LLM integration, iterated prompt logic directly against live user behavior, optimized Postgres schemas, and built Elixir Phoenix WebSocket real-time delivery.",
      challenge: `The client faced two compounding issues: personalization LLM outputs suffered from prompt variance and inconsistent tone for live readers, while heavy database query load and lack of real-time streaming caused sluggish page loads and frequent production incidents.`,
      solution: `Engineered an end-to-end full-stack solution:
1. LLM Integration & Prompt Iteration: Owned prompt architecture and system conditioning, testing iterations against real user engagement data for consistent output quality.
2. Elixir Phoenix REST & WebSocket Infrastructure: Designed and built the REST API layer and WebSocket infrastructure, powering instant live in-app streaming updates.
3. Database & Query Redesign: Overhauled the Postgres schema, eliminated obsolete dead fields, and rewrote slow join queries.
4. CI/CD Quality Gates: Introduced automated test suites and deployment gates that prevented breaking regressions from reaching production.`,
      impact: [
        { label: "Production Incidents", before: "Baseline outages", after: "40% Incident Reduction", change: "-40%" },
        { label: "Live Updates", before: "Polling intervals", after: "Elixir Phoenix WebSockets", change: "< 50ms Real-Time" },
        { label: "Database Performance", before: "Slow multi-table joins", after: "Optimized Postgres schema", change: "3x Query Speed" }
      ],
      diagramSteps: [
        { title: "User Ingest & Profiling", desc: "User reading preferences and interactions captured via client app." },
        { title: "Production LLM Pipeline", desc: "Iterated prompt pipeline creates tailored, coherent editorial feeds." },
        { title: "Optimized Postgres Store", desc: "Cleaned schema and indexed tables deliver sub-10ms data fetches." },
        { title: "WebSocket Push", desc: "Elixir Phoenix backend streams real-time updates directly to frontend." }
      ],
      techStack: ["Elixir Phoenix", "WebSockets", "Postgres", "Python", "LLM Prompt Tuning", "TypeScript", "React", "CI/CD"]
    }
  ],

  experience: [
    {
      company: "Apple (via TCS)",
      role: "Data Engineer · Systems Integration & Data Health",
      period: "Feb 2025 – Present",
      location: "Austin, TX",
      highlights: [
        "Cross-System Integration: Built a Python tool integrating ticketing, repository, and geo-data systems through authenticated REST APIs (OAuth2), replacing a fully manual, cross-team workflow with on-demand access control.",
        "LLM Decision System: Built and maintain a production LLM system reviewing structured ticket data to decide whether requests are approved, rejected, or held; created an auditable human-reviewable decision layer that grew throughput from 30 to 350+ tickets/day.",
        "Data Validation & Remediation: Run and continuously tune ML-driven remediation jobs that clean up and modernize live production data at scale across a pipeline spanning 50+ regions.",
        "Build Readiness & Release Coordination: Part of the Data Health team setting pipeline quality and engineering standards; resolve gating validation failures that block repo production promotion.",
        "Pipeline Reliability: Maintain quality gates, checkpoints, and rollback logic across distributed systems (Spark, Iceberg/S3, Snowflake, Kafka, AWS EKS) for concurrent regional deployments.",
        "Incident Response: Lead technical triage on high-severity production data outages, driving root cause analysis (RCA) and long-term remediation."
      ]
    },
    {
      company: "Neural Newsletters",
      role: "Software Engineer · Full-Stack & LLM Infrastructure",
      period: "May 2024 – Feb 2025",
      location: "Austin, TX",
      highlights: [
        "LLM Feature Integration: Owned the LLM integration behind core personalization end-to-end, iterating on prompt logic directly against production behavior for consistent outputs.",
        "REST API Design: Designed and built the REST API layer connecting the Elixir Phoenix backend to the product frontend; introduced CI/CD quality gates cutting production incidents by ~40%.",
        "Database & Schema Design: Redesigned the Postgres schema and rewrote query plans, eliminating dead fields and accelerating data retrieval.",
        "Real-Time Infrastructure: Built the WebSocket-based real-time infrastructure on Elixir Phoenix, powering live, in-app updates for end users."
      ]
    },
    {
      company: "edX",
      role: "Machine Learning Instructor",
      period: "Oct 2023 – Mar 2025",
      location: "Remote",
      highlights: [
        "Curriculum Delivery: Delivered a full-lifecycle ML curriculum (ingestion, ETL, training, evaluation, deployment) to two cohorts of ~30 students each, including foundational Python.",
        "1:1 Technical Mentorship: Conducted weekly office hours, hands-on code reviews, and architectural problem-solving sessions driving high retention and placement."
      ]
    }
  ],

  education: [
    {
      degree: "B.S. Computer Science",
      institution: "University of Texas at Dallas",
      graduation: "Dec 2022"
    },
    {
      degree: "A.A.S. Business Administration",
      institution: "Austin Community College",
      graduation: "May 2020"
    }
  ],

  skills: {
    engineering: [
      "Python", "SQL", "TypeScript", "JavaScript", "React", "Elixir / Phoenix", 
      "Postgres", "WebSockets", "Git", "REST APIs", "OAuth2 Authentication"
    ],
    aiMl: [
      "LLM Decision Systems", "Prompt Engineering", "MLOps", "Fine-Tuning", 
      "Vector Databases", "Model Evaluation", "TensorFlow", "Scikit-Learn", "NLP"
    ],
    dataCloud: [
      "Apache Spark", "Apache Iceberg", "Snowflake", "Apache Kafka", "AWS (S3, EMR, Lambda, EKS)", 
      "Apache Airflow", "dbt", "Docker", "Kubernetes", "Jenkins", "Apache NiFi"
    ],
    reliability: [
      "Incident Response & Triage", "Root Cause Analysis (RCA)", "Quality Gates", 
      "Rollback Checkpoints", "CI/CD Pipelines", "Agile / Scrum", "Data Health & Governance"
    ]
  }
};
