import React, { useState } from 'react';
import { Play, RotateCcw, ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Clock, Terminal, ChevronRight, Sparkles, Server } from 'lucide-react';

const PRESETS = [
  {
    id: 'geo-sync',
    name: 'Routine Geo-Data Ingest & Boundary Update',
    system: 'Apple Geo Ingest API',
    type: 'Data Ingest Pipeline',
    payload: {
      ticket_id: "GEO-92841",
      requester: "dataops-service@internal",
      target_layer: "vector_boundaries_na_west",
      regions: ["us-west-1", "us-west-2"],
      oauth2_scope: "geo.boundaries:write",
      schema_version: "v2.4.1",
      is_automated_cadence: true
    },
    expected: 'APPROVE',
    confidence: 98.4,
    reasoning: "Routine scheduled boundary update matching automated DataOps signature. OAuth2 token verified, schema validation passed with zero drift across target regions.",
    automatedAction: "Auto-provisioned Git branch merge & Iceberg partition reload via REST integration."
  },
  {
    id: 'elevated-perm',
    name: 'Elevated Production Repo Access Escalation',
    system: 'Core Repo Auth Gateway',
    type: 'Access Escalation',
    payload: {
      ticket_id: "SEC-41908",
      requester: "dev-contractor@partner-firm",
      target_layer: "production_master_repos",
      regions: ["global-50+"],
      oauth2_scope: "admin:force-push",
      schema_version: "v3.0.0-unreleased",
      is_automated_cadence: false
    },
    expected: 'HOLD',
    confidence: 72.1,
    reasoning: "High blast-radius request: Admin force-push requested across 50+ global regions by external contractor. Flagged by deterministic safety policy #402. Routing to Data Health on-call review queue.",
    automatedAction: "Ticket placed in human-in-the-loop review queue with automated audit log snapshot."
  },
  {
    id: 'corrupt-payload',
    name: 'Malformed Coordinate Array & Invalid Token',
    system: 'Regional Ingest Gateway',
    type: 'Schema Discrepancy',
    payload: {
      ticket_id: "ING-77123",
      requester: "legacy-collector@cron",
      target_layer: "raw_telemetry_partitions",
      regions: ["unknown-zone-99"],
      oauth2_scope: "telemetry:invalid_bearer",
      schema_version: "legacy-v1.0",
      is_automated_cadence: true
    },
    expected: 'REJECT',
    confidence: 99.8,
    reasoning: "Deterministic gate failure: Token scope is invalid or expired. Target region does not match 50+ recognized operational zones. Immediate rejection with zero downstream execution.",
    automatedAction: "Rejected with 401 unauthorized code; remediation alert dispatched to logging stream."
  }
];

export default function InteractiveTriageSimulator() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0); // 0: Idle, 1: OAuth2 auth, 2: Schema check, 3: LLM reasoning, 4: Done
  const [result, setResult] = useState(null);

  const handleRunSimulation = () => {
    setIsProcessing(true);
    setResult(null);
    setProcessingStage(1);

    setTimeout(() => {
      setProcessingStage(2);
    }, 400);

    setTimeout(() => {
      setProcessingStage(3);
    }, 900);

    setTimeout(() => {
      setProcessingStage(4);
      setResult({
        decision: selectedPreset.expected,
        confidence: selectedPreset.confidence,
        reasoning: selectedPreset.reasoning,
        action: selectedPreset.automatedAction,
        latency: Math.floor(Math.random() * 25) + 38, // 38-63ms
        timestamp: new Date().toISOString().slice(11, 19) + ' UTC'
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleReset = () => {
    setIsProcessing(false);
    setProcessingStage(0);
    setResult(null);
  };

  return (
    <section id="simulator" className="py-20 px-4 border-t border-[#e2e0d8] bg-[#fbfbf9]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 font-mono text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Production Prototype</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#181818] font-['Space_Grotesk',sans-serif]">
              Live FDE Decision Triage Simulator
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#615f59] max-w-md leading-relaxed">
            Test the decision logic modeled after the production system built at Apple. Select structured ticket payloads and observe how deterministic safety policies and LLM classification interact in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Preset Selector & Payload Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Preset Selector */}
            <div className="p-5 rounded-2xl bg-white border border-[#e4e2da] shadow-2xs space-y-3">
              <label className="text-xs font-mono uppercase tracking-widest text-[#787670] font-semibold block">
                Select Scenario Preset
              </label>

              <div className="space-y-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset);
                      handleReset();
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedPreset.id === preset.id
                        ? 'border-[#181818] bg-[#f6f5f1] shadow-2xs'
                        : 'border-[#dedcd4] bg-white hover:border-[#cbc8be]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#181818]">
                        {preset.name}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        preset.expected === 'APPROVE' ? 'bg-emerald-100 text-emerald-800' :
                        preset.expected === 'HOLD' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {preset.expected}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#787670]">
                      System: {preset.system}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* JSON Payload Inspector */}
            <div className="p-5 rounded-2xl bg-[#181818] text-white shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[#333] pb-2">
                <span className="text-xs font-mono text-[#aaa] flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  ticket_payload.json
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  OAuth2 Signed
                </span>
              </div>
              <pre className="text-[11px] font-mono text-[#ddd] overflow-x-auto leading-relaxed bg-[#111] p-3 rounded-lg border border-[#262626]">
                {JSON.stringify(selectedPreset.payload, null, 2)}
              </pre>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={handleRunSimulation}
                  disabled={isProcessing}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>{isProcessing ? 'Evaluating Gates...' : 'Run Decision Engine'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="p-3 rounded-xl border border-[#444] text-[#ccc] hover:bg-[#252525] transition-colors cursor-pointer"
                  title="Reset simulator"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Engine Execution & Output (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Pipeline Steps Bar */}
            <div className="p-5 rounded-2xl bg-white border border-[#e4e2da] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-[#787670] font-semibold">
                  Triage Pipeline Stages
                </span>
                <span className="text-xs font-mono text-[#888]">
                  Status: {isProcessing ? 'Active Processing' : result ? 'Decision Rendered' : 'Standby'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { step: 1, label: 'OAuth2 Verification', sub: 'Token validation' },
                  { step: 2, label: 'Deterministic Gate', sub: 'Hard safety rules' },
                  { step: 3, label: 'LLM Reasoning', sub: 'Context & intent' },
                  { step: 4, label: 'Action Gate', sub: 'Routing outcome' }
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-3 rounded-xl border transition-all ${
                      processingStage >= s.step
                        ? 'border-emerald-400 bg-emerald-50/50 text-emerald-950'
                        : 'border-[#e4e2da] bg-[#fbfbf9] text-[#787670]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-mono text-[10px] font-bold">
                      {processingStage >= s.step ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-[#bbb] flex items-center justify-center text-[8px]">
                          {s.step}
                        </span>
                      )}
                      <span>Stage 0{s.step}</span>
                    </div>
                    <span className="font-semibold block leading-tight text-[11px]">
                      {s.label}
                    </span>
                    <span className="text-[10px] text-[#777] block mt-0.5">
                      {s.sub}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Outcome Card */}
            {result ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#dedcd4] shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0eee6] pb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-3.5 h-3.5 rounded-full ${
                      result.decision === 'APPROVE' ? 'bg-emerald-500 ring-4 ring-emerald-100' :
                      result.decision === 'HOLD' ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-rose-500 ring-4 ring-rose-100'
                    }`} />
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#787670] block">
                        Engine Decision
                      </span>
                      <h4 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#181818]">
                        [{result.decision === 'APPROVE' ? 'AUTO-APPROVED' : result.decision === 'HOLD' ? 'HELD FOR HUMAN REVIEW' : 'REJECTED'}]
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#787670] block">
                      Confidence Score
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-[#181818]">
                      {result.confidence}%
                    </span>
                  </div>
                </div>

                {/* Reasoning Readout */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#787670] block">
                    Model Reasoning & Safety Audit
                  </span>
                  <p className="text-sm text-[#3d3b37] bg-[#fbfbf9] p-4 rounded-xl border border-[#e8e6de] leading-relaxed">
                    {result.reasoning}
                  </p>
                </div>

                {/* Automated Downstream Action */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#787670] block">
                    Downstream Automated Execution
                  </span>
                  <p className="text-xs font-mono text-[#181818] bg-emerald-50/70 text-emerald-950 p-3 rounded-xl border border-emerald-200/80 leading-relaxed">
                    → {result.action}
                  </p>
                </div>

                {/* Telemetry Footer */}
                <div className="pt-4 border-t border-[#f0eee6] flex items-center justify-between text-[11px] font-mono text-[#787670]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#555]" />
                    Total Latency: {result.latency}ms
                  </span>
                  <span>Execution Logged: {result.timestamp}</span>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-white border border-dashed border-[#dedcd4] flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#f6f5f1] flex items-center justify-center text-[#787670]">
                  <Terminal className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#181818]">
                  Simulator Ready for Evaluation
                </h4>
                <p className="text-xs text-[#787670] max-w-sm leading-relaxed">
                  Click "Run Decision Engine" to trigger OAuth2 validation, deterministic filter policies, and the LLM contextual reasoning layer.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
