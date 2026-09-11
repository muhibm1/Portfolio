const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\alqai\\.gemini\\antigravity\\brain\\10bf30e7-df78-43d6-bf59-e13d743da57f';
const img1Path = path.join(brainDir, 'fde_portfolio_mm_logo_1789086221882.jpg');
const img2Path = path.join(brainDir, 'fde_case_study_detail_1789085166810.jpg');

const img1Base64 = fs.readFileSync(img1Path).toString('base64');
const img2Base64 = fs.readFileSync(img2Path).toString('base64');

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
</head>
<body class="bg-transparent text-[var(--foreground)] antialiased p-3 font-sans">
  <div class="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl p-4 shadow-sm max-w-4xl mx-auto space-y-4">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between border-b border-[var(--border)] pb-3 gap-2">
      <div>
        <span class="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] block">UI Visual Mockup // Architectural MM Logo & Warm Palette</span>
        <h3 class="text-base font-bold text-[var(--foreground)]">Muhammad Muhibullah — FDE Portfolio Mockup</h3>
      </div>
      <div class="flex items-center gap-1.5 bg-[var(--background)] p-1 rounded-xl border border-[var(--border)]">
        <button id="btn1" onclick="switchView(1)" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--card)] text-[var(--foreground)] shadow-xs transition-all cursor-pointer">
          01. Hero & Architectural MM Mark
        </button>
        <button id="btn2" onclick="switchView(2)" class="px-3 py-1.5 text-xs font-medium rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer">
          02. Dedicated Case Study Page
        </button>
      </div>
    </div>

    <!-- View 1: Homepage Mockup -->
    <div id="view1" class="space-y-2">
      <div class="rounded-xl overflow-hidden border border-[var(--border)] bg-[#f6f5f1] shadow-inner">
        <img src="data:image/jpeg;base64,${img1Base64}" alt="Muhammad Muhibullah - Portfolio Homepage Mockup" class="w-full h-auto object-cover rounded-lg" />
      </div>
      <div class="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)] text-xs text-[var(--muted-foreground)] flex flex-wrap items-center justify-between gap-2">
        <span><strong>Design Characteristics:</strong> Warm parchment canvas (#f6f5f1), bespoke architectural interlocking 'MM' monogram with amber/magenta/cyan gradient, Space Grotesk typography, 350+ tickets/day live telemetry counter.</span>
        <span class="font-mono text-[10px] text-emerald-600 font-bold">● Bespoke MM Mark</span>
      </div>
    </div>

    <!-- View 2: Case Study Mockup -->
    <div id="view2" class="space-y-2 hidden">
      <div class="rounded-xl overflow-hidden border border-[var(--border)] bg-[#f6f5f1] shadow-inner">
        <img src="data:image/jpeg;base64,${img2Base64}" alt="Muhammad Muhibullah - Dedicated Case Studies Page" class="w-full h-auto object-cover rounded-lg" />
      </div>
      <div class="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)] text-xs text-[var(--muted-foreground)] flex flex-wrap items-center justify-between gap-2">
        <span><strong>Design Characteristics:</strong> Dedicated enterprise case study breakdown (Varick Agents inspired), architectural decision flow diagram, 11x throughput metric callouts, and auditable human review queues.</span>
        <span class="font-mono text-[10px] text-emerald-600 font-bold">● Enterprise AI Teardown</span>
      </div>
    </div>
  </div>

  <script>
    function switchView(view) {
      const v1 = document.getElementById("view1");
      const v2 = document.getElementById("view2");
      const b1 = document.getElementById("btn1");
      const b2 = document.getElementById("btn2");

      if (view === 1) {
        v1.classList.remove("hidden");
        v2.classList.add("hidden");
        b1.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--card)] text-[var(--foreground)] shadow-xs transition-all cursor-pointer";
        b2.className = "px-3 py-1.5 text-xs font-medium rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer";
      } else {
        v1.classList.add("hidden");
        v2.classList.remove("hidden");
        b2.className = "px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--card)] text-[var(--foreground)] shadow-xs transition-all cursor-pointer";
        b1.className = "px-3 py-1.5 text-xs font-medium rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all cursor-pointer";
      }
    }
  </script>
</body>
</html>`;

const outPath = path.join(brainDir, 'mockup_viewer.html');
fs.writeFileSync(outPath, htmlContent);
console.log('Successfully written:', outPath);
