// src/server/ui.ts
// Phase 3: Server UI Template - HTML template for web interface

export function getUITemplate(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CTDD UI</title>
  <style>
    :root { color-scheme: light dark; --ok:#2ecc71; --fail:#e74c3c; --muted:#888;}
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 0; }
    header { padding: 12px 16px; background: #111; color: #fff; }
    header h1 { margin: 0; font-size: 18px; }
    header .commit { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; opacity: 0.9; }
    main { padding: 16px; display: grid; gap: 16px; grid-template-columns: 1fr; max-width: 1100px; margin: 0 auto; }
    section { border: 1px solid #3335; border-radius: 8px; padding: 12px; }
    h2 { margin: 0 0 8px; font-size: 16px; }
    ul { margin: 8px 0; padding-left: 18px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
    .pass { background: color-mix(in oklab, var(--ok) 20%, transparent); color: var(--ok); border: 1px solid var(--ok); }
    .fail { background: color-mix(in oklab, var(--fail) 20%, transparent); color: var(--fail); border: 1px solid var(--fail); }
    .grid2 { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
    pre { background: #0002; padding: 8px; border-radius: 6px; overflow:auto; }
    .muted { color: var(--muted); }
    .row { display:flex; align-items:center; gap:10px; flex-wrap: wrap; }
    button { padding:6px 10px; border-radius:6px; border:1px solid #555; background:#222; color:#fff; cursor:pointer; }
    a { color: #4ea1ff; text-decoration: none; }
  </style>
</head>
<body>
  <header>
    <h1>CTDD UI <span class="commit" id="commit"></span></h1>
  </header>
  <main>
    <section id="focus">
      <div class="row">
        <h2>Focus Card</h2>
        <button id="refresh">Refresh</button>
        <a href="/pre-prompt" target="_blank">Pre Prompt</a>
        <a href="/brief" target="_blank">Brief (MD)</a>
        <a href="/brief.json" target="_blank">Brief (JSON)</a>
      </div>
      <div id="goal"></div>
      <div class="grid2">
        <div>
          <h3>Deliverables</h3>
          <ul id="deliverables"></ul>
        </div>
        <div>
          <h3>Constraints</h3>
          <ul id="constraints"></ul>
        </div>
        <div>
          <h3>Non-goals</h3>
          <ul id="non_goals"></ul>
        </div>
        <div>
          <h3>Sources of truth</h3>
          <ul id="sources"></ul>
        </div>
      </div>
    </section>
    <section id="spec">
      <h2>Spec</h2>
      <div class="grid2">
        <div>
          <h3>Invariants</h3>
          <ul id="invariants"></ul>
        </div>
        <div>
          <h3>CUTs</h3>
          <ul id="cuts"></ul>
        </div>
      </div>
    </section>
    <section id="checks">
      <h2>Plugin Checks</h2>
      <div id="checkList" class="grid2"></div>
      <div class="muted">Checks run on demand when submitting Post-Test via server; this page triggers them via GET /checks.</div>
    </section>
    <section id="examples">
      <h2>Examples</h2>
      <div class="grid2">
        <div>
          <h3>Pre Response Example</h3>
          <pre id="preEx"></pre>
        </div>
        <div>
          <h3>Post Response Example</h3>
          <pre id="postEx"></pre>
        </div>
      </div>
    </section>
  </main>
  <script>
    const $ = (id) => document.getElementById(id);
    const li = (t) => { const el = document.createElement('li'); el.textContent = t; return el; };
    const escape = (s) => s.replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    async function fetchJSON(url) {
      const r = await fetch(url);
      if (!r.ok) throw new Error(url + ' -> ' + r.status);
      return r.json();
    }
    async function load() {
      const brief = await fetchJSON('/brief.json');
      const checks = await fetchJSON('/checks');
      $('commit').textContent = brief.commit_id;
      $('goal').textContent = brief.focus_card.goal;
      $('deliverables').innerHTML = '';
      for (const d of brief.focus_card.deliverables || []) $('deliverables').appendChild(li(d));
      $('constraints').innerHTML = '';
      for (const c of brief.focus_card.constraints || []) $('constraints').appendChild(li(c));
      $('non_goals').innerHTML = '';
      for (const n of brief.focus_card.non_goals || []) $('non_goals').appendChild(li(n));
      $('sources').innerHTML = '';
      for (const s of brief.focus_card.sources_of_truth || []) $('sources').appendChild(li(s));
      $('invariants').innerHTML = '';
      for (const i of brief.invariants) $('invariants').appendChild(li(i.id + ': ' + i.text));
      $('cuts').innerHTML = '';
      for (const c of brief.cuts) $('cuts').appendChild(li(c.id + ': ' + c.text));
      const chk = $('checkList');
      chk.innerHTML = '';
      for (const r of (checks.checks || [])) {
        const div = document.createElement('div');
        const ok = r.status === 'PASS';
        div.innerHTML = '<div><span class="badge ' + (ok ? 'pass' : 'fail') + '">' + r.status + '</span> ' + escape(r.id) + ' — ' + escape(r.title || '') + '</div>'
          + (r.evidence ? '<div class="muted">evidence: ' + escape(r.evidence) + '</div>' : '');
        div.style.border = '1px solid #3335';
        div.style.borderRadius = '8px';
        div.style.padding = '8px';
        chk.appendChild(div);
      }
      $('preEx').textContent = JSON.stringify(brief.shapes.pre_response_example, null, 2);
      $('postEx').textContent = JSON.stringify(brief.shapes.post_response_example, null, 2);
    }
    $('refresh').addEventListener('click', () => load().catch(console.error));
    load().catch((e) => console.error('Failed to load UI:', e));
  </script>
</body>
</html>`;
}