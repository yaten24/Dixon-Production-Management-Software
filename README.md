<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Production Management Software — Overview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#14181C;
    --bg-panel:#1B2026;
    --bg-panel-2:#20262d;
    --steel:#2E4057;
    --steel-light:#3d5476;
    --accent:#E8632C;
    --accent-2:#F2B705;
    --text:#EDEFF2;
    --text-dim:#8B95A1;
    --success:#4C9A6A;
    --line: rgba(237,239,242,0.08);
    --radius: 6px;
  }
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  @media (prefers-reduced-motion: reduce){
    html{scroll-behavior:auto;}
    *{animation-duration:0.001s !important; animation-iteration-count:1 !important; transition-duration:0.001s !important;}
  }
  body{
    margin:0;
    background:var(--bg);
    color:var(--text);
    font-family:'Inter',sans-serif;
    line-height:1.6;
  }
  h1,h2,h3,.display{
    font-family:'Oswald',sans-serif;
    text-transform:uppercase;
    letter-spacing:0.02em;
    margin:0;
  }
  code, .mono{ font-family:'JetBrains Mono',monospace; }
  a{ color:var(--accent-2); }
  ::selection{ background:var(--accent); color:#14181C; }

  /* ---------- layout ---------- */
  .shell{ display:flex; min-height:100vh; }

  nav.side{
    position:sticky; top:0; height:100vh; width:230px; flex:0 0 230px;
    background:var(--bg-panel);
    border-right:1px solid var(--line);
    padding:28px 0;
    overflow-y:auto;
  }
  nav.side .brand{
    padding:0 24px 20px 24px;
    border-bottom:1px solid var(--line);
    margin-bottom:16px;
  }
  nav.side .brand .tag{
    font-family:'Oswald',sans-serif;
    color:var(--accent);
    font-size:11px; letter-spacing:0.18em; font-weight:600;
  }
  nav.side .brand .title{
    font-size:16px; margin-top:6px; line-height:1.25;
  }
  nav.side ul{ list-style:none; margin:0; padding:0; }
  nav.side li a{
    display:flex; align-items:center; gap:10px;
    padding:9px 24px;
    color:var(--text-dim);
    text-decoration:none;
    font-size:13.5px;
    font-weight:500;
    border-left:2px solid transparent;
    transition:color .15s ease, border-color .15s ease, background .15s ease;
  }
  nav.side li a .idx{
    font-family:'JetBrains Mono',monospace;
    font-size:10px; color:var(--steel-light);
    width:16px;
  }
  nav.side li a:hover, nav.side li a.active{
    color:var(--text);
    border-left-color:var(--accent);
    background:rgba(232,99,44,0.06);
  }

  main{ flex:1; min-width:0; }

  section{
    padding:88px 64px;
    border-bottom:1px solid var(--line);
    max-width:1040px;
  }
  section .eyebrow{
    color:var(--accent);
    font-family:'Oswald',sans-serif;
    font-size:12px;
    letter-spacing:0.22em;
    font-weight:600;
    margin-bottom:14px;
    display:flex; align-items:center; gap:10px;
  }
  section .eyebrow::before{
    content:''; width:26px; height:2px; background:var(--accent-2);
  }
  section h2{ font-size:34px; margin-bottom:18px; }
  section > p.lede{
    color:var(--text-dim); max-width:680px; font-size:16px; margin-bottom:36px;
  }

  /* ---------- hero ---------- */
  .hero{
    position:relative;
    padding:110px 64px 60px 64px;
    overflow:hidden;
    background:
      radial-gradient(ellipse at top right, rgba(232,99,44,0.10), transparent 55%),
      var(--bg);
    border-bottom:1px solid var(--line);
  }
  .hero .eyebrow{ color:var(--accent-2); }
  .hero h1{
    font-size:clamp(38px,5.4vw,64px);
    line-height:1.02;
    max-width:820px;
  }
  .hero h1 span{ color:var(--accent); }
  .hero p.lede{ margin-top:22px; font-size:17px; max-width:600px; color:var(--text-dim); }
  .hero .cta-row{ display:flex; gap:14px; margin-top:32px; flex-wrap:wrap;}
  .btn{
    font-family:'Oswald',sans-serif; text-transform:uppercase; letter-spacing:0.06em;
    font-size:13px; font-weight:600;
    padding:13px 22px; border-radius:var(--radius);
    text-decoration:none; display:inline-flex; align-items:center; gap:8px;
    transition:transform .15s ease, background .15s ease;
  }
  .btn-primary{ background:var(--accent); color:#181316; }
  .btn-primary:hover{ transform:translateY(-2px); background:#f27343; }
  .btn-ghost{ background:transparent; border:1px solid var(--line); color:var(--text); }
  .btn-ghost:hover{ border-color:var(--accent-2); color:var(--accent-2); }

  /* conveyor / production line signature element */
  .line-rig{
    margin-top:64px;
    position:relative;
    border:1px solid var(--line);
    border-radius:8px;
    background:var(--bg-panel);
    padding:26px 26px 20px 26px;
    overflow:hidden;
  }
  .line-rig .stations{
    display:flex; justify-content:space-between; position:relative; z-index:2;
  }
  .line-rig .station{
    display:flex; flex-direction:column; align-items:center; gap:10px; width:110px;
  }
  .line-rig .station .dot{
    width:38px; height:38px; border-radius:50%;
    background:var(--steel); border:2px solid var(--steel-light);
    display:flex; align-items:center; justify-content:center;
    font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--text-dim);
  }
  .line-rig .station.pass .dot{ border-color:var(--success); color:var(--success); }
  .line-rig .station .lbl{ font-size:11.5px; color:var(--text-dim); text-align:center; text-transform:uppercase; letter-spacing:0.04em; }
  .belt{
    position:relative; height:6px; margin:16px 0 0 0;
    background: repeating-linear-gradient(
      -45deg,
      var(--accent-2) 0 10px,
      #1c1508 10px 20px
    );
    background-size:200% 100%;
    animation: beltmove 2.4s linear infinite;
    border-radius:3px;
    opacity:0.9;
  }
  @keyframes beltmove{ from{ background-position:0 0; } to{ background-position:-56px 0; } }
  .crate{
    position:absolute; top:-30px; width:16px; height:16px; background:var(--accent);
    border-radius:2px;
    animation: travel 4.5s linear infinite;
  }
  .crate:nth-child(2){ animation-delay:1.1s; }
  .crate:nth-child(3){ animation-delay:2.3s; }
  .crate:nth-child(4){ animation-delay:3.4s; }
  @keyframes travel{
    0%{ left:0%; opacity:0; }
    5%{ opacity:1; }
    95%{ opacity:1; }
    100%{ left:calc(100% - 16px); opacity:0; }
  }

  /* ---------- feature / module grids ---------- */
  .grid{
    display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
    gap:16px;
  }
  .card{
    background:var(--bg-panel);
    border:1px solid var(--line);
    border-radius:var(--radius);
    padding:22px;
    transition:border-color .18s ease, transform .18s ease;
  }
  .card:hover{ border-color:var(--accent); transform:translateY(-3px); }
  .card .num{ font-family:'JetBrains Mono',monospace; color:var(--accent-2); font-size:12px; }
  .card h3{ font-size:16px; margin:10px 0 8px 0; text-transform:none; letter-spacing:0; }
  .card p{ font-size:13.5px; color:var(--text-dim); margin:0; }

  /* ---------- tech stack ---------- */
  .stack-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .stack-col{
    background:var(--bg-panel); border:1px solid var(--line); border-radius:var(--radius);
    padding:22px; position:relative;
  }
  .stack-col::before{
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:var(--accent); border-radius:var(--radius) var(--radius) 0 0;
  }
  .stack-col h3{ font-size:14px; letter-spacing:0.08em; margin-bottom:14px; color:var(--accent-2); }
  .stack-col ul{ list-style:none; margin:0; padding:0; }
  .stack-col li{
    font-size:14px; padding:7px 0; border-bottom:1px dashed var(--line); color:var(--text);
  }
  .stack-col li:last-child{ border-bottom:none; }

  /* ---------- structure tree ---------- */
  pre.tree{
    background:var(--bg-panel); border:1px solid var(--line); border-radius:var(--radius);
    padding:22px 26px; overflow-x:auto; font-size:13px; color:var(--text-dim);
    font-family:'JetBrains Mono',monospace; line-height:1.7;
  }
  pre.tree .hi{ color:var(--accent-2); }
  pre.tree .hi2{ color:var(--text); }

  /* ---------- steps (sequential, real order) ---------- */
  .steps{ counter-reset:step; display:flex; flex-direction:column; gap:0; }
  .step{
    counter-increment:step;
    display:grid; grid-template-columns:52px 1fr; gap:18px;
    padding:20px 0; border-bottom:1px solid var(--line);
    position:relative;
  }
  .step:last-child{ border-bottom:none; }
  .step::before{
    content:counter(step,decimal-leading-zero);
    font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--accent);
    border:1px solid var(--steel); border-radius:50%;
    width:40px; height:40px; display:flex; align-items:center; justify-content:center;
  }
  .step .body h4{ margin:0 0 4px 0; font-size:15px; font-family:'Oswald',sans-serif; text-transform:uppercase; letter-spacing:0.03em; }
  .step .body p{ margin:0; color:var(--text-dim); font-size:13.5px; }
  .step .body code.blk{
    display:block; margin-top:8px; background:#0e1114; border:1px solid var(--line);
    border-radius:4px; padding:10px 14px; font-size:13px; color:var(--accent-2); width:fit-content;
  }

  /* ---------- env vars ---------- */
  .env-block{
    background:#0e1114; border:1px solid var(--line); border-radius:var(--radius);
    padding:22px 26px; font-family:'JetBrains Mono',monospace; font-size:13.5px;
  }
  .env-block .k{ color:var(--accent-2); }
  .env-block .v{ color:var(--text-dim); }
  .env-block .comment{ color:#565f68; }

  /* ---------- security ---------- */
  .sec-list{ display:flex; flex-direction:column; gap:2px; }
  .sec-row{
    display:flex; align-items:center; gap:14px;
    padding:14px 18px; background:var(--bg-panel); border:1px solid var(--line);
    border-radius:4px; margin-bottom:8px;
  }
  .sec-row .chip{
    width:8px; height:8px; border-radius:50%; background:var(--success); flex:0 0 auto;
    box-shadow:0 0 0 4px rgba(76,154,106,0.15);
  }
  .sec-row span.t{ font-size:14px; }

  /* ---------- roadmap ---------- */
  .roadmap{ display:flex; flex-direction:column; gap:0; border-left:2px solid var(--steel); margin-left:6px; }
  .rm-item{ position:relative; padding:0 0 30px 26px; }
  .rm-item:last-child{ padding-bottom:0; }
  .rm-item::before{
    content:''; position:absolute; left:-7px; top:2px; width:12px; height:12px;
    border-radius:50%; background:var(--bg); border:2px solid var(--accent-2);
  }
  .rm-item h4{ margin:0 0 4px 0; font-size:15px; font-family:'Oswald',sans-serif; text-transform:uppercase; }
  .rm-item p{ margin:0; color:var(--text-dim); font-size:13.5px; }

  /* ---------- footer ---------- */
  footer{
    padding:60px 64px 80px 64px;
  }
  footer .author-card{
    background:var(--bg-panel); border:1px solid var(--line); border-radius:8px;
    padding:30px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px;
  }
  footer .author-card .initials{
    width:56px; height:56px; border-radius:50%; background:var(--accent);
    display:flex; align-items:center; justify-content:center;
    font-family:'Oswald',sans-serif; font-weight:600; color:#181316; font-size:18px;
  }
  footer .links a{
    display:inline-flex; align-items:center; gap:8px; margin-right:22px;
    color:var(--text); text-decoration:none; font-size:14px; border-bottom:1px solid var(--line);
    padding-bottom:2px; transition:border-color .15s ease, color .15s ease;
  }
  footer .links a:hover{ color:var(--accent-2); border-color:var(--accent-2); }
  footer .fine{ margin-top:40px; color:var(--text-dim); font-size:12.5px; text-align:center; }

  /* reveal on scroll */
  .reveal{ opacity:0; transform:translateY(16px); transition:opacity .6s ease, transform .6s ease; }
  .reveal.in{ opacity:1; transform:translateY(0); }

  @media (max-width: 860px){
    nav.side{ display:none; }
    section, footer{ padding:60px 22px; }
    .stack-row{ grid-template-columns:1fr; }
    .line-rig .stations{ flex-wrap:wrap; gap:18px; }
  }
</style>
</head>
<body>

<div class="shell">
  <nav class="side">
    <div class="brand">
      <div class="tag">PMS · v1.0</div>
      <div class="title">Production<br>Management<br>Software</div>
    </div>
    <ul>
      <li><a href="#overview"><span class="idx">01</span>Overview</a></li>
      <li><a href="#features"><span class="idx">02</span>Features</a></li>
      <li><a href="#stack"><span class="idx">03</span>Tech Stack</a></li>
      <li><a href="#structure"><span class="idx">04</span>Project Structure</a></li>
      <li><a href="#install"><span class="idx">05</span>Installation</a></li>
      <li><a href="#env"><span class="idx">06</span>Environment</a></li>
      <li><a href="#usage"><span class="idx">07</span>Usage Flow</a></li>
      <li><a href="#modules"><span class="idx">08</span>Modules</a></li>
      <li><a href="#security"><span class="idx">09</span>Security</a></li>
      <li><a href="#roadmap"><span class="idx">10</span>Roadmap</a></li>
      <li><a href="#contribute"><span class="idx">11</span>Contributing</a></li>
      <li><a href="#author"><span class="idx">12</span>Author &amp; License</a></li>
    </ul>
  </nav>

  <main>

    <!-- HERO -->
    <section class="hero" id="overview">
      <div class="eyebrow">Manufacturing Operations Platform</div>
      <h1>Run the whole shop floor from <span>one system.</span></h1>
      <p class="lede">
        Production Management Software plans jobs, tracks raw materials, assigns machines and people,
        watches quality at every checkpoint, and turns the results into reports — so nothing on the
        floor depends on a whiteboard or a spreadsheet.
      </p>
      <div class="cta-row">
        <a class="btn btn-primary" href="#install">Get Started →</a>
        <a class="btn btn-ghost" href="https://github.com/yaten24" target="_blank" rel="noopener">View on GitHub</a>
      </div>

      <div class="line-rig">
        <div class="stations">
          <div class="station"><div class="dot">Pl</div><div class="lbl">Plan</div></div>
          <div class="station"><div class="dot">Or</div><div class="lbl">Order</div></div>
          <div class="station"><div class="dot">Mt</div><div class="lbl">Materials</div></div>
          <div class="station"><div class="dot">Mc</div><div class="lbl">Machine</div></div>
          <div class="station pass"><div class="dot">QC</div><div class="lbl">Quality</div></div>
          <div class="station"><div class="dot">Rp</div><div class="lbl">Report</div></div>
        </div>
        <div class="belt">
          <div class="crate"></div>
          <div class="crate"></div>
          <div class="crate"></div>
          <div class="crate"></div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features">
      <div class="eyebrow reveal">What it does</div>
      <h2 class="reveal">Features</h2>
      <p class="lede reveal">
        Each feature maps to a real job on the floor — from the planner scheduling next week's run
        to the operator logging a finished batch.
      </p>
      <div class="grid">
        <div class="card reveal"><div class="num">01</div><h3>Production Planning</h3><p>Schedule jobs against capacity before they hit the floor, so machines and shifts are booked, not guessed at.</p></div>
        <div class="card reveal"><div class="num">02</div><h3>Order Management</h3><p>Every production order carries its own status, quantities, and due date from creation to close.</p></div>
        <div class="card reveal"><div class="num">03</div><h3>Inventory Management</h3><p>Stock levels update as materials move in and finished goods move out — no manual recounts.</p></div>
        <div class="card reveal"><div class="num">04</div><h3>Raw Material Tracking</h3><p>Trace a batch back to the exact materials that went into it, by lot and supplier.</p></div>
        <div class="card reveal"><div class="num">05</div><h3>Work Order Management</h3><p>Break an order into the discrete jobs operators actually execute at each station.</p></div>
        <div class="card reveal"><div class="num">06</div><h3>Employee Management</h3><p>Assign people to shifts and work orders, and track who did what.</p></div>
        <div class="card reveal"><div class="num">07</div><h3>Machine Management</h3><p>Log machine status, uptime, and assignment so scheduling reflects real availability.</p></div>
        <div class="card reveal"><div class="num">08</div><h3>Quality Control</h3><p>Record inspection checkpoints so defects are caught before a batch ships, not after.</p></div>
        <div class="card reveal"><div class="num">09</div><h3>Reports &amp; Analytics</h3><p>Turn floor activity into dashboards leadership can actually act on.</p></div>
        <div class="card reveal"><div class="num">10</div><h3>Auth &amp; Roles</h3><p>Operators, supervisors, and admins each see only what their role needs.</p></div>
      </div>
    </section>

    <!-- TECH STACK -->
    <section id="stack">
      <div class="eyebrow reveal">Built on</div>
      <h2 class="reveal">Tech Stack</h2>
      <p class="lede reveal">A conventional MERN-style split: a browser client, a Node API, and a database that can be either document- or relational-based depending on deployment needs.</p>
      <div class="stack-row">
        <div class="stack-col reveal">
          <h3>Frontend</h3>
          <ul>
            <li>HTML</li>
            <li>CSS</li>
            <li>JavaScript</li>
            <li>React.js <span style="color:var(--text-dim);font-size:12px;">(optional)</span></li>
          </ul>
        </div>
        <div class="stack-col reveal">
          <h3>Backend</h3>
          <ul>
            <li>Node.js</li>
            <li>Express.js</li>
          </ul>
        </div>
        <div class="stack-col reveal">
          <h3>Database</h3>
          <ul>
            <li>MongoDB</li>
            <li>MySQL <span style="color:var(--text-dim);font-size:12px;">(alternative)</span></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- PROJECT STRUCTURE -->
    <section id="structure">
      <div class="eyebrow reveal">How it's organized</div>
      <h2 class="reveal">Project Structure</h2>
      <p class="lede reveal">Client and server live side by side, each with their own dependencies, so the front end and API can be developed and deployed independently.</p>
      <pre class="tree reveal">production-management/
│
├── <span class="hi">client/</span>
│   ├── src/
│   ├── public/
│   └── package.json
│
├── <span class="hi">server/</span>
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── <span class="hi2">.env</span>
├── package.json
└── README.md</pre>
    </section>

    <!-- INSTALLATION -->
    <section id="install">
      <div class="eyebrow reveal">Getting it running</div>
      <h2 class="reveal">Installation</h2>
      <p class="lede reveal">Four commands, run in order, from a clean checkout to a running server.</p>
      <div class="steps reveal">
        <div class="step">
          <div class="body">
            <h4>Clone the repository</h4>
            <p>Pull the source down to your machine.</p>
            <code class="blk">git clone https://github.com/yourusername/production-management.git</code>
          </div>
        </div>
        <div class="step">
          <div class="body">
            <h4>Enter the project</h4>
            <p>Move into the project root before running anything else.</p>
            <code class="blk">cd production-management</code>
          </div>
        </div>
        <div class="step">
          <div class="body">
            <h4>Install dependencies</h4>
            <p>Pulls in everything listed in package.json for both client and server.</p>
            <code class="blk">npm install</code>
          </div>
        </div>
        <div class="step">
          <div class="body">
            <h4>Start the server</h4>
            <p>Boots the API — and the client, if it's wired into the same start script.</p>
            <code class="blk">npm start</code>
          </div>
        </div>
      </div>
    </section>

    <!-- ENV -->
    <section id="env">
      <div class="eyebrow reveal">Configuration</div>
      <h2 class="reveal">Environment Variables</h2>
      <p class="lede reveal">Create a <code>.env</code> file in the project root before starting the server for the first time.</p>
      <div class="env-block reveal">
<span class="comment"># server config</span><br>
<span class="k">PORT</span>=<span class="v">5000</span><br>
<span class="k">DB_URL</span>=<span class="v">your_database_url</span><br>
<span class="k">JWT_SECRET</span>=<span class="v">your_secret_key</span>
      </div>
    </section>

    <!-- USAGE -->
    <section id="usage">
      <div class="eyebrow reveal">Day-to-day</div>
      <h2 class="reveal">Usage Flow</h2>
      <p class="lede reveal">This is the sequence a job actually follows once the system is live — from login to finished report.</p>
      <div class="steps reveal">
        <div class="step"><div class="body"><h4>Log in</h4><p>Access the system under your assigned role.</p></div></div>
        <div class="step"><div class="body"><h4>Create a production order</h4><p>Define what's being made, how much, and by when.</p></div></div>
        <div class="step"><div class="body"><h4>Assign machines and employees</h4><p>Book the resources the order needs to run.</p></div></div>
        <div class="step"><div class="body"><h4>Track inventory</h4><p>Watch raw materials draw down and finished stock build up.</p></div></div>
        <div class="step"><div class="body"><h4>Monitor progress</h4><p>Follow the order through each work order and station.</p></div></div>
        <div class="step"><div class="body"><h4>Generate reports</h4><p>Close the loop with output, quality, and efficiency numbers.</p></div></div>
      </div>
    </section>

    <!-- MODULES -->
    <section id="modules">
      <div class="eyebrow reveal">Inside the app</div>
      <h2 class="reveal">Modules</h2>
      <p class="lede reveal">The screens a user actually navigates between, grouped by what they manage.</p>
      <div class="grid">
        <div class="card reveal"><h3>Dashboard</h3><p>Live snapshot of what's running right now.</p></div>
        <div class="card reveal"><h3>Products</h3><p>The catalog of items the factory produces.</p></div>
        <div class="card reveal"><h3>Production Orders</h3><p>Every order, its status, and its due date.</p></div>
        <div class="card reveal"><h3>Inventory</h3><p>Current stock across raw materials and finished goods.</p></div>
        <div class="card reveal"><h3>Suppliers</h3><p>Who materials are sourced from.</p></div>
        <div class="card reveal"><h3>Employees</h3><p>Roster, roles, and shift assignments.</p></div>
        <div class="card reveal"><h3>Machines</h3><p>Equipment status and assignment.</p></div>
        <div class="card reveal"><h3>Quality Check</h3><p>Inspection records at each checkpoint.</p></div>
        <div class="card reveal"><h3>Reports</h3><p>Exportable output, efficiency, and quality data.</p></div>
        <div class="card reveal"><h3>Settings</h3><p>System configuration and preferences.</p></div>
      </div>
    </section>

    <!-- SECURITY -->
    <section id="security">
      <div class="eyebrow reveal">Protecting the data</div>
      <h2 class="reveal">Security</h2>
      <p class="lede reveal">Standard safeguards for a system that touches operational and personnel data.</p>
      <div class="sec-list reveal">
        <div class="sec-row"><div class="chip"></div><span class="t">JWT authentication for every session</span></div>
        <div class="sec-row"><div class="chip"></div><span class="t">Passwords stored encrypted, never in plain text</span></div>
        <div class="sec-row"><div class="chip"></div><span class="t">Role-based access control per user type</span></div>
        <div class="sec-row"><div class="chip"></div><span class="t">API endpoints secured against unauthorized calls</span></div>
      </div>
    </section>

    <!-- ROADMAP -->
    <section id="roadmap">
      <div class="eyebrow reveal">What's next</div>
      <h2 class="reveal">Future Enhancements</h2>
      <div class="roadmap reveal">
        <div class="rm-item"><h4>Barcode Scanner Integration</h4><p>Scan materials and finished goods in and out of inventory.</p></div>
        <div class="rm-item"><h4>QR Code Support</h4><p>Quick lookup of orders and batches from the floor.</p></div>
        <div class="rm-item"><h4>AI-based Production Prediction</h4><p>Forecast output and bottlenecks from historical run data.</p></div>
        <div class="rm-item"><h4>Mobile Application</h4><p>Check status and log activity from a handheld device.</p></div>
        <div class="rm-item"><h4>Email Notifications</h4><p>Alerts for order status changes and approvals.</p></div>
        <div class="rm-item"><h4>SMS Alerts</h4><p>Time-critical alerts for machine downtime or QC failures.</p></div>
      </div>
    </section>

    <!-- CONTRIBUTING -->
    <section id="contribute">
      <div class="eyebrow reveal">Get involved</div>
      <h2 class="reveal">Contributing</h2>
      <p class="lede reveal">Contributions are welcome — the process is the standard GitHub fork-and-PR flow.</p>
      <div class="steps reveal">
        <div class="step"><div class="body"><h4>Fork the repository</h4><p>Create your own copy to work from.</p></div></div>
        <div class="step"><div class="body"><h4>Create a branch</h4><p>Keep your change isolated from main.</p></div></div>
        <div class="step"><div class="body"><h4>Commit your changes</h4><p>Write clear, scoped commits.</p></div></div>
        <div class="step"><div class="body"><h4>Push the branch</h4><p>Send your branch up to your fork.</p></div></div>
        <div class="step"><div class="body"><h4>Open a Pull Request</h4><p>Describe the change and submit it for review.</p></div></div>
      </div>
    </section>

  </main>
</div>

<footer id="author">
  <div class="eyebrow reveal" style="max-width:1040px;margin-left:64px;">License &amp; Author</div>
  <div style="max-width:1040px; margin-left:64px;">
    <h2 class="reveal" style="margin-bottom:18px;">MIT Licensed. Built by you.</h2>
    <p class="lede reveal" style="margin-bottom:28px;">Free to use, modify, and distribute under the MIT License.</p>
    <div class="author-card reveal">
      <div style="display:flex; align-items:center; gap:18px;">
        <div class="initials">YN</div>
        <div>
          <div style="font-family:'Oswald',sans-serif; font-size:16px; text-transform:uppercase; letter-spacing:0.03em;">Your Name</div>
          <div style="color:var(--text-dim); font-size:13px;">Project Author</div>
        </div>
      </div>
      <div class="links">
        <a href="https://github.com/yaten24" target="_blank" rel="noopener">GitHub ↗</a>
        <a href="mailto:yaten2404@email.com">Email ↗</a>
      </div>
    </div>
  </div>
  <p class="fine">Production Management Software — documentation overview generated from the project README.</p>
</footer>

<script>
  // scroll-reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold:0.12 });
  revealEls.forEach(el=>io.observe(el));

  // active nav link on scroll
  const navLinks = document.querySelectorAll('nav.side a');
  const sections = document.querySelectorAll('main section, footer');
  const navIo = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const id = entry.target.getAttribute('id');
      const link = document.querySelector(`nav.side a[href="#${id}"]`);
      if(!link) return;
      if(entry.isIntersecting){
        navLinks.forEach(l=>l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin:'-40% 0px -50% 0px' });
  sections.forEach(s=>navIo.observe(s));
</script>

</body>
</html>