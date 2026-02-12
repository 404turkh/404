// ====== REKLAM LİNKİN ======
const adLink = "https://www.effectivegatecpm.com/mw8g1kgrts?key=40a64cb4f3c60c24be0ad12a5d672125";

// ====== ÇİFT TIKLAMA SİSTEMİ ======
const AD_INTERVAL = 60 * 60 * 1000; // 1 saat

const BOT_SCRIPT_URL = "https://raw.githubusercontent.com/404turkh/404/refs/heads/main/js/hrm.user.js";
const IG_URL = "https://instagram.com/5harambro";
const YT_URL = "https://www.youtube.com/@5harambro";
const TG_URL = "https://t.me/xharambro";

function handleAction(url) {
  if (!url) return;

  if (url === BOT_SCRIPT_URL) {
    openVerifyModal(url);
    return;
  }

  const now = Date.now();
  const lastAdTime = localStorage.getItem("lastAdTime");

  if (!lastAdTime || (now - lastAdTime) > AD_INTERVAL) {
    window.open(adLink, "_blank");
    localStorage.setItem("lastAdTime", now);
    return;
  }

  startDownload(url);
}

function startDownload(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function openVerifyModal(targetUrl) {
  if (document.getElementById("__verify_gate__")) return;

  // --- state (tıklayınca değil, geri dönünce completed) ---
  const state = { ig: false, yt: false, tg: false, pending: null };

  // --- overlay ---
  const overlay = document.createElement("div");
  overlay.id = "__verify_gate__";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "999999";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.background = "rgba(0,0,0,0.6)";
  overlay.style.backdropFilter = "blur(8px)";

  // --- style (Sadece verify modal için) ---
  const style = document.createElement("style");
  style.id = "__verify_gate_style__";
  style.textContent = `
    #__verify_gate__ .vg-box{
      position: relative;
      overflow: hidden;
      width: min(520px, calc(100vw - 36px));
      border-radius: 22px;
      background: rgba(18,18,22,0.92);
      border: 1px solid rgba(255,255,255,0.10);
      box-shadow: 0 22px 70px rgba(0,0,0,0.55);
      padding: 18px;
      color: #fff;
      font: 600 14px -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial;
      transform: translateY(10px) scale(.985);
      animation: vgPop .18s ease-out forwards;
    }
    #__verify_gate__ .vg-glow{
      position:absolute; inset:-2px;
      background:
        radial-gradient(600px 240px at 18% 0%, rgba(34,197,94,.18), transparent 60%),
        radial-gradient(520px 220px at 100% 22%, rgba(34,211,238,.14), transparent 55%),
        radial-gradient(420px 220px at 0% 100%, rgba(225,48,108,.12), transparent 55%);
      pointer-events:none;
      filter: blur(0px);
    }
    #__verify_gate__ .vg-head{
      display:flex; align-items:center; gap:12px;
      margin-bottom: 10px;
      position: relative;
      z-index: 1;
    }
    #__verify_gate__ .vg-lock{
      width:40px; height:40px; border-radius:14px;
      display:grid; place-items:center;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.10);
    }
    #__verify_gate__ .vg-title{ font-size:18px; font-weight:900; margin:0; }
    #__verify_gate__ .vg-sub{ opacity:.82; margin:0; font-weight:650; line-height:1.35; }
    #__verify_gate__ .vg-progressWrap{ margin: 12px 0 12px 0; position:relative; z-index:1; }
    #__verify_gate__ .vg-progressTop{
      display:flex; align-items:center; justify-content:space-between;
      font-weight:800; opacity:.9; margin-bottom:8px;
    }
    #__verify_gate__ .vg-bar{
      height:10px; border-radius:999px;
      background: rgba(255,255,255,0.10);
      border: 1px solid rgba(255,255,255,0.10);
      overflow:hidden;
    }
    #__verify_gate__ .vg-bar > div{
      height:100%;
      width:0%;
      border-radius:999px;
      background: linear-gradient(90deg, rgba(34,197,94,0.9), rgba(34,211,238,0.7));
      transition: width .22s ease;
    }
    #__verify_gate__ .vg-steps{
      display:flex; gap:10px; margin-top:10px;
      opacity:.95; font-weight:800;
    }
    #__verify_gate__ .vg-dot{
      width:10px; height:10px; border-radius:50%;
      background: rgba(255,255,255,0.22);
      border: 1px solid rgba(255,255,255,0.12);
    }
    #__verify_gate__ .vg-dot.done{
      background: rgba(34,197,94,0.85);
      border-color: rgba(34,197,94,0.55);
      box-shadow: 0 0 0 4px rgba(34,197,94,0.10);
    }
    #__verify_gate__ .vg-btn{
      width:100%;
      display:flex; align-items:center; justify-content:space-between;
      gap:10px;
      padding: 12px 12px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.08);
      color:#fff;
      font-weight:900;
      cursor:pointer;
      user-select:none;
      transition: transform .08s ease, background .16s ease, border-color .16s ease;
      position: relative;
      z-index: 1;
      margin-bottom: 10px;
    }
    #__verify_gate__ .vg-btn:active{ transform: scale(.99); }
    #__verify_gate__ .vg-left{
      display:flex; align-items:center; gap:10px;
    }
    #__verify_gate__ .vg-ico{
      width:34px; height:34px; border-radius:12px;
      display:grid; place-items:center;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.07);
    }
    #__verify_gate__ .vg-badge{
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.08);
      font-weight:900;
      opacity:.92;
      white-space:nowrap;
    }
    #__verify_gate__ .vg-btn.ig{ background: rgba(225,48,108,0.14); border-color: rgba(225,48,108,0.22); }
    #__verify_gate__ .vg-btn.yt{ background: rgba(255,0,0,0.12); border-color: rgba(255,0,0,0.22); }
    #__verify_gate__ .vg-btn.tg{ background: rgba(34,158,217,0.14); border-color: rgba(34,158,217,0.22); }

    #__verify_gate__ .vg-btn.done{
      background: rgba(34,197,94,0.16) !important;
      border-color: rgba(34,197,94,0.30) !important;
    }
    #__verify_gate__ .vg-btn.done .vg-badge{
      border-color: rgba(34,197,94,0.35);
      background: rgba(34,197,94,0.14);
    }
    #__verify_gate__ .vg-status{
      margin: 2px 0 12px 0;
      font-weight:850;
      opacity:.9;
      position: relative;
      z-index: 1;
    }
    #__verify_gate__ .vg-actions{
      display:flex; gap:10px;
      position: relative;
      z-index: 1;
      margin-top: 6px;
    }
    #__verify_gate__ .vg-cancel, #__verify_gate__ .vg-unlock{
      flex:1;
      padding: 11px 12px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.12);
      font-weight: 950;
      cursor:pointer;
      user-select:none;
      transition: transform .08s ease, opacity .16s ease;
    }
    #__verify_gate__ .vg-cancel{
      background: rgba(255,255,255,0.08);
      color:#fff;
    }
    #__verify_gate__ .vg-unlock{
      background: linear-gradient(90deg, rgba(34,197,94,0.95), rgba(34,211,238,0.80));
      color:#07120a;
      border-color: rgba(255,255,255,0.14);
    }
    #__verify_gate__ .vg-unlock:disabled{
      opacity:.45;
      cursor:not-allowed;
      filter: grayscale(.15);
    }
    #__verify_gate__ .vg-cancel:active, #__verify_gate__ .vg-unlock:active{ transform: scale(.99); }
    @keyframes vgPop{
      to { transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);

  // --- box ---
  const box = document.createElement("div");
  box.className = "vg-box";

  box.innerHTML = `
    <div class="vg-glow"></div>

    <div class="vg-head">
      <div class="vg-lock" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="white" stroke-opacity=".9" stroke-width="2" stroke-linecap="round"/>
          <path d="M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke="white" stroke-opacity=".9" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div>
        <p class="vg-title">Content Locked</p>
        <p class="vg-sub">Complete all 3 steps to unlock the download.</p>
      </div>
    </div>

    <div class="vg-progressWrap">
      <div class="vg-progressTop">
        <span id="vgStepText">Step 0/3</span>
        <span style="opacity:.75;font-weight:900;">Verification</span>
      </div>
      <div class="vg-bar"><div id="vgBarFill"></div></div>
      <div class="vg-steps" aria-hidden="true">
        <span id="vgDot1" class="vg-dot"></span>
        <span id="vgDot2" class="vg-dot"></span>
        <span id="vgDot3" class="vg-dot"></span>
      </div>
    </div>

    <button id="igBtn" type="button" class="vg-btn ig">
      <span class="vg-left">
        <span class="vg-ico" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" stroke="white" stroke-opacity=".9" stroke-width="2"/>
            <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" stroke="white" stroke-opacity=".9" stroke-width="2"/>
            <path d="M17.5 6.5h.01" stroke="white" stroke-opacity=".9" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </span>
        <span>Follow on Instagram</span>
      </span>
      <span class="vg-badge" id="igBadge">Open</span>
    </button>

    <button id="ytBtn" type="button" class="vg-btn yt">
      <span class="vg-left">
        <span class="vg-ico" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21.5 8.5a3 3 0 0 0-2.1-2.1C17.8 6 12 6 12 6s-5.8 0-7.4.4A3 3 0 0 0 2.5 8.5 31 31 0 0 0 2.5 12a31 31 0 0 0 0 3.5 3 3 0 0 0 2.1 2.1C6.2 18 12 18 12 18s5.8 0 7.4-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 21.5 12a31 31 0 0 0 0-3.5Z" stroke="white" stroke-opacity=".9" stroke-width="2"/>
            <path d="M10.5 9.75 15 12l-4.5 2.25V9.75Z" fill="white" fill-opacity=".9"/>
          </svg>
        </span>
        <span>Subscribe on YouTube</span>
      </span>
      <span class="vg-badge" id="ytBadge">Open</span>
    </button>

    <button id="tgBtn" type="button" class="vg-btn tg">
      <span class="vg-left">
        <span class="vg-ico" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 4 2.8 11.6c-.9.35-.88 1.64.04 1.96l4.7 1.65 1.78 5.67c.27.86 1.38 1.06 1.93.35l2.72-3.49 4.78 3.44c.76.55 1.82.14 2.01-.79L22 4Z" stroke="white" stroke-opacity=".9" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </span>
        <span>Join Telegram</span>
      </span>
      <span class="vg-badge" id="tgBadge">Open</span>
    </button>

    <div id="statusText" class="vg-status">Complete the steps to unlock.</div>

    <div class="vg-actions">
      <button id="cancelBtn" type="button" class="vg-cancel">Cancel</button>
      <button id="unlockBtn" type="button" class="vg-unlock" disabled>Unlock & Download</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // --- elements ---
  const igBtn = document.getElementById("igBtn");
  const ytBtn = document.getElementById("ytBtn");
  const tgBtn = document.getElementById("tgBtn");
  const unlockBtn = document.getElementById("unlockBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const statusText = document.getElementById("statusText");

  const igBadge = document.getElementById("igBadge");
  const ytBadge = document.getElementById("ytBadge");
  const tgBadge = document.getElementById("tgBadge");

  const vgStepText = document.getElementById("vgStepText");
  const vgBarFill = document.getElementById("vgBarFill");
  const vgDot1 = document.getElementById("vgDot1");
  const vgDot2 = document.getElementById("vgDot2");
  const vgDot3 = document.getElementById("vgDot3");

  function setStatus(msg) {
    statusText.textContent = msg;
  }

  function completedCount() {
    return (state.ig ? 1 : 0) + (state.yt ? 1 : 0) + (state.tg ? 1 : 0);
  }

  function updateProgress() {
    const c = completedCount();
    vgStepText.textContent = `Step ${c}/3`;
    vgBarFill.style.width = `${(c / 3) * 100}%`;

    vgDot1.classList.toggle("done", state.ig);
    vgDot2.classList.toggle("done", state.yt);
    vgDot3.classList.toggle("done", state.tg);

    if (state.ig && state.yt && state.tg) {
      unlockBtn.disabled = false;
      setStatus("All steps completed. You can unlock now.");
    }
  }

  function markDone(btn, badgeEl) {
    btn.classList.add("done");
    badgeEl.textContent = "✓ Completed";
  }

  // --- kullanıcı geri dönünce pending step completed ---
  function handleReturn() {
    if (!state.pending) return;

    const step = state.pending;
    state.pending = null;

    if (step === "ig" && !state.ig) {
      state.ig = true;
      markDone(igBtn, igBadge);
    } else if (step === "yt" && !state.yt) {
      state.yt = true;
      markDone(ytBtn, ytBadge);
    } else if (step === "tg" && !state.tg) {
      state.tg = true;
      markDone(tgBtn, tgBadge);
    }

    updateProgress();

    if (!(state.ig && state.yt && state.tg)) {
      setStatus("Step completed. Please finish the remaining steps.");
    }
  }

  // --- cleanup close ---
  function closeGate() {
    overlay.remove();
    const st = document.getElementById("__verify_gate_style__");
    if (st) st.remove();
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVis);
  }

  const onFocus = () => handleReturn();
  const onVis = () => { if (!document.hidden) handleReturn(); };

  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVis);

  // --- button actions (tık = open, completed = geri dönünce) ---
  igBtn.onclick = () => {
    window.open(IG_URL, "_blank");
    state.pending = "ig";
    setStatus("Go to Instagram tab and come back to complete this step.");
  };

  ytBtn.onclick = () => {
    window.open(YT_URL, "_blank");
    state.pending = "yt";
    setStatus("Go to YouTube tab and come back to complete this step.");
  };

  tgBtn.onclick = () => {
    window.open(TG_URL, "_blank");
    state.pending = "tg";
    setStatus("Go to Telegram tab and come back to complete this step.");
  };

  unlockBtn.onclick = () => {
    closeGate();
    startDownload(targetUrl);
  };

  cancelBtn.onclick = () => closeGate();
  overlay.onclick = (e) => { if (e.target === overlay) closeGate(); };

  // initial
  updateProgress();
}

// ====== DATA ======

const data = {

list1: [
{logo:"snd.png",name:"Dns Profile",desc:"",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1/byharambro.mobileconfig"},
{logo:"snd.png",name:"Dns Profile",desc:"Config",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1/bypassrevokedns.mobileconfig"},

{logo:"ngisk.png",name:"KSign✅",desc:"Forevermark Marketing (Shanghai) Limited",url:"https://api.khoindvn.io.vn/YRBC4f"},
{logo:"ngisk.png",name:"KSign",desc:"PowerChina International Group Limited",url:"https://api.khoindvn.io.vn/03zH0o"},
{logo:"ngisk.png",name:"KSign PowerChina",desc:"PowerChina International Group Limited",url:"https://api.khoindvn.io.vn/03zH0o"},
{logo:"ngisk.png",name:"KSign PowerChina 1",desc:"PowerChina International Group Limited",url:"https://api.khoindvn.io.vn/QdVVh3"},
{logo:"ngisk.png",name:"KSign PowerChina 2",desc:"PowerChina International Group Limited",url:"https://api.khoindvn.io.vn/t1UK1D"},
{logo:"ngisk.png",name:"KSign PowerChina 3",desc:"PowerChina International Group Limited",url:"https://api.khoindvn.io.vn/NU8PP6"},
{logo:"ngisk.png",name:"KSign",desc:"Qingdao Rural Commercial Bank Co., Ltd",url:"https://api.khoindvn.eu.org/XSCvQT"},
{logo:"ngisk.png",name:"KSign",desc:"Commission on Elections",url:"https://api.khoindvn.io.vn/g65UJy"},
{logo:"ngisk.png",name:"KSign Com V1",desc:"Commission on Elections",url:"https://api.khoindvn.io.vn/ZsgCVX"},
{logo:"ngisk.png",name:"KSign Com V2",desc:"Commission on Elections",url:"https://api.khoindvn.io.vn/VNNlkL"},
{logo:"ngisk.png",name:"KSign",desc:"Wasu Media & Network Co",url:"https://api.khoindvn.io.vn/9VDZ4Y"},
{logo:"ngisk.png",name:"KSign",desc:"Luoyang Postal Administration",url:"https://api.khoindvn.io.vn/h5YrG1"},
{logo:"ngisk.png",name:"KSign",desc:"Etisalat - Emirates Telecommunications Corporation",url:"https://api.khoindvn.io.vn/TsTFIu"},
{logo:"ngisk.png",name:"KSign",desc:"China National Heavy Duty Truck Group Co., Ltd",url:"https://api.khoindvn.io.vn/IUurbX"},
{logo:"ngisk.png",name:"KSign",desc:"Guangzhou Huahan Educational & Technology Co., Ltd.",url:"https://api.khoindvn.io.vn/03zH0o"},
{logo:"ngisk.png",name:"KSign",desc:"China Telecommunications Corporation",url:"https://api.khoindvn.io.vn/5PBonm"},
{logo:"ngisk.png",name:"KSign",desc:"Tianjin University of Commerce",url:"https://api.khoindvn.io.vn/1H9iee"},
{logo:"ngisk.png",name:"KSign",desc:"VIETTEL GROUP",url:"https://api.khoindvn.io.vn/qYiNnB"},
{logo:"ngisk.png",name:"KSign",desc:"CHIBA INSTITUTE OF TECHNOLOGY",url:"https://api.khoindvn.io.vn/xwgru5"},
{logo:"ngisk.png",name:"KSign ChiBa V1",desc:"CHIBA INSTITUTE OF TECHNOLOGY",url:"https://api.khoindvn.io.vn/KYD1nK"},
{logo:"ngisk.png",name:"KSign ChiBa V2",desc:"CHIBA INSTITUTE OF TECHNOLOGY",url:"https://api.khoindvn.io.vn/EIpxft"},
{logo:"ngisk.png",name:"KSign ChiBa V3",desc:"CHIBA INSTITUTE OF TECHNOLOGY",url:"https://api.khoindvn.io.vn/ZNciX8"},
{logo:"ngisk.png",name:"KSign ChiBa V4",desc:"CHIBA INSTITUTE OF TECHNOLOGY",url:"https://api.khoindvn.io.vn/nBQF8h"},
{logo:"ngisk.png",name:"KSign",desc:"VIETNAM JOINT STOCK COMMERCIAL BANK FOR INDUSTRY AND TRADE",url:"https://api.khoindvn.io.vn/5dujHz"},
{logo:"ngisk.png",name:"KSign VN V1",desc:"VIETNAM JOINT STOCK COMMERCIAL BANK FOR INDUSTRY AND TRADE",url:"https://api.khoindvn.io.vn/hZ8MlI"},
{logo:"ngisk.png",name:"KSign VN V2",desc:"VIETNAM JOINT STOCK COMMERCIAL BANK FOR INDUSTRY AND TRADE",url:"https://api.khoindvn.io.vn/Fdty3X"},
{logo:"ngisk.png",name:"KSign VN V3",desc:"VIETNAM JOINT STOCK COMMERCIAL BANK FOR INDUSTRY AND TRADE",url:"https://api.khoindvn.io.vn/AK7usE"},
{logo:"ngisk.png",name:"KSign VN V4",desc:"VIETNAM JOINT STOCK COMMERCIAL BANK FOR INDUSTRY AND TRADE",url:"https://api.khoindvn.io.vn/oIV0oN"},
{logo:"ngisk.png",name:"KSign",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/6DNLtD"},
{logo:"ngisk.png",name:"KSign GLOBAL V1",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/j7XAya"},
{logo:"ngisk.png",name:"KSign GLOBAL V2",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/qNkRtG"},
{logo:"ngisk.png",name:"KSign GLOBAL V3",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/mTt9ip"},
{logo:"ngisk.png",name:"KSign GLOBAL V4",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/RX7IAf"},
{logo:"ngisk.png",name:"KSign GLOBAL V5",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/tGeKc0"},
{logo:"ngisk.png",name:"KSign GLOBAL V6",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/Deq7RD"},
{logo:"ngisk.png",name:"KSign GLOBAL V7",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/kcvpWe"}
],

list2: [
{logo:"tw.png",name:"esing",desc:"Certificate",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1/ESignCert.zip "},

{logo:"gnise.png",name:"ESign✅",desc:"Forevermark Marketing (Shanghai) Limited",url:"https://api.khoindvn.io.vn/aAqGZk"},
{logo:"gnise.png",name:"ESign",desc:"PowerChina International Group Limited",url:"https://api.khoindvn.io.vn/IDcW4P"},
{logo:"gnise.png",name:"ESign PowerChina",desc:"PowerChina International Group Limited",url:"https://api.khoindvn.io.vn/NvH0ZF"},
{logo:"gnise.png",name:"ESign PowerChina 1",desc:"PowerChina International Group Limited",url:"https://api.khoindvn.io.vn/GKJa03"},
{logo:"gnise.png",name:"ESign PowerChina 2",desc:"PowerChina International Group Limited",url:"https://api.khoindvn.io.vn/lYSU81"},
{logo:"gnise.png",name:"ESign PowerChina 3",desc:"PowerChina International Group Limited",url:"https://api.khoindvn.io.vn/bzAdnw"},
{logo:"gnise.png",name:"ESign",desc:"Qingdao Rural Commercial Bank Co., Ltd",url:"https://api.khoindvn.eu.org/KXcveB"},
{logo:"gnise.png",name:"ESign",desc:"Commission on Elections",url:"https://api.khoindvn.io.vn/jAbzrt"},
{logo:"gnise.png",name:"ESign Com V1",desc:"Commission on Elections",url:"https://api.khoindvn.io.vn/RzkRFk"},
{logo:"gnise.png",name:"ESign Com V2",desc:"Commission on Elections",url:"https://api.khoindvn.io.vn/oC0s5H"},
{logo:"gnise.png",name:"ESign",desc:"Luoyang Postal Administration",url:"https://api.khoindvn.io.vn/ST2vo0"},
{logo:"gnise.png",name:"ESign",desc:"Wasu Media & Network Co., Ltd",url:"https://api.khoindvn.io.vn/CbhJOR"},
{logo:"gnise.png",name:"ESign",desc:"Etisalat - Emirates Telecommunications Corporation",url:"https://api.khoindvn.io.vn/Zxycmb"},
{logo:"gnise.png",name:"ESign",desc:"China National Heavy Duty Truck Group Co., Ltd.",url:"https://api.khoindvn.io.vn/11jtJ7"},
{logo:"gnise.png",name:"ESign",desc:"Guangzhou Huahan Educational & Technology Co., Ltd",url:"https://api.khoindvn.io.vn/11jtJ7"},
{logo:"gnise.png",name:"ESign",desc:"China Telecommunications Corporation",url:"https://api.khoindvn.io.vn/JJW6Nj"},
{logo:"gnise.png",name:"ESign",desc:"Tianjin University of Commerce",url:"https://api.khoindvn.io.vn/6xAzUM"},
{logo:"gnise.png",name:"ESign",desc:"VIETTEL GROUP",url:"https://api.khoindvn.io.vn/Sco2A2"},
{logo:"gnise.png",name:"ESign",desc:"CHIBA INSTITUTE OF TECHNOLOGY",url:"https://api.khoindvn.io.vn/Q9sxJb"},
{logo:"gnise.png",name:"ESign ChiBa V1",desc:"CHIBA INSTITUTE OF TECHNOLOGY",url:"https://api.khoindvn.io.vn/Bhqw0c"},
{logo:"gnise.png",name:"ESign ChiBa V2",desc:"CHIBA INSTITUTE OF TECHNOLOGY",url:"https://api.khoindvn.io.vn/9UqTrd"},
{logo:"gnise.png",name:"ESign ChiBa V3",desc:"CHIBA INSTITUTE OF TECHNOLOGY",url:"https://api.khoindvn.io.vn/BcUSW0"},
{logo:"gnise.png",name:"ESign ChiBa V4",desc:"CHIBA INSTITUTE OF TECHNOLOGY",url:"https://api.khoindvn.io.vn/4jftNL"},
{logo:"gnise.png",name:"ESign",desc:"VIETNAM JOINT STOCK COMMERCIAL BANK FOR INDUSTRY AND TRADE",url:"https://api.khoindvn.io.vn/z4nsG3"},
{logo:"gnise.png",name:"ESign VN V1",desc:"VIETNAM JOINT STOCK COMMERCIAL BANK FOR INDUSTRY AND TRADE",url:"https://api.khoindvn.io.vn/hMU3PR"},
{logo:"gnise.png",name:"ESign VN V2",desc:"VIETNAM JOINT STOCK COMMERCIAL BANK FOR INDUSTRY AND TRADE",url:"https://api.khoindvn.io.vn/OBr8Zi"},
{logo:"gnise.png",name:"ESign VN V3",desc:"VIETNAM JOINT STOCK COMMERCIAL BANK FOR INDUSTRY AND TRADE",url:"https://api.khoindvn.io.vn/gegf9d"},
{logo:"gnise.png",name:"ESign VN V4",desc:"VIETNAM JOINT STOCK COMMERCIAL BANK FOR INDUSTRY AND TRADE",url:"https://api.khoindvn.io.vn/a1Gr0d"},
{logo:"gnise.png",name:"ESign",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/2nf4UO"},
{logo:"gnise.png",name:"ESign GLOBAL V1",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/j6HQG8"},
{logo:"gnise.png",name:"ESign GLOBAL V2",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/hvcTb2"},
{logo:"gnise.png",name:"ESign GLOBAL V3",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/bJV2fn"},
{logo:"gnise.png",name:"ESign GLOBAL V4",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/QQYC0K"},
{logo:"gnise.png",name:"ESign GLOBAL V5",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/ylpuYQ"},
{logo:"gnise.png",name:"ESign GLOBAL V6",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/vnAa35"},
{logo:"gnise.png",name:"ESign GLOBAL V7",desc:"GLOBAL TAKEOFF, INC",url:"https://api.khoindvn.io.vn/qYW0nK"}
],

list3: [
{logo:"raga.png",name:"Agar.io",desc:"Raw mod 26.3.5",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1%ED%84%B0%ED%81%AC/26.3.5.raw.ipa"},
{logo:"raga.png",name:"Agar.io",desc:"Shark mod 26.3.5",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1%ED%84%B0%ED%81%AC/26.3.5.shark.ipa"},
{logo:"raga.png",name:"Agar.io",desc:"Anarky mod 26.3.5",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1%ED%84%B0%ED%81%AC/26.3.5.anarky.ipa"},
{logo:"raga.png",name:"Agar.io",desc:"Memedit mod 26.3.5",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1%ED%84%B0%ED%81%AC/26.3.5.memedit.ipa"},
{logo:"raga.png",name:"Agar.io",desc:"Coinskinfree mod 26.3.5",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1%ED%84%B0%ED%81%AC/Agario-coinskinfree-26.3.5.ipa"},
{logo:"raga.png",name:"Agar.io",desc:"Anarky + Shark mod 26.3.5",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1%ED%84%B0%ED%81%AC/anarky+shark.26.3.5.ipa"},
{logo:"raga.png",name:"Agar.io",desc:"Biteskin mod 26.3.5",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1%ED%84%B0%ED%81%AC/biteskin.26.3.5.ipa"},
{logo:"raga.png",name:"Agar.io",desc:"Kahraba Mod Requires License",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1%ED%84%B0%ED%81%AC/26.3.5.kahraba.ipa"},
{logo:"scrt.PNG",name:"Bot Script",desc:"Free bot script that works together with Web Delta Agario.",url:"https://raw.githubusercontent.com/404turkh/404/refs/heads/main/js/hrm.user.js"}
],

list4: [
{logo:"mn.png",name:"Minecraft",desc:"Build, explore, and survive in a fully open world. Gather resources, craft tools, and create anything you imagine",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/Minecraft.ipa"},
{logo:"go.png",name:"Geometry",desc:"Jump and fly your way through danger in this rhythm-based action platformer",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/Geometry.ipa"}
],

list5: [
{logo:"trol.png",name:"TrollInstallerX",desc:"Universal TrollStore installer. Extremely reliable and fast 1.0.3",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/TrollInstallerX.ipa"},
{logo:"ins.png",name:"Instagram",desc:"Regram B23 Cracked 369.0.0",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/Instagram.ipa"},
{logo:"ytb.png",name:"YouTube",desc:"YTLite + Youpip + YouQuality Premium free 20.12.4",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/YouTube.ipa"},
{logo:"ytm.png",name:"YouTubeMusic",desc:"YouTube Music Premium free 8.31.2",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/YouTubeMusic.ipa"},
{logo:"sp.png",name:"Spotify",desc:"EeveeSpotify Premium features free 9.0.66",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/EeveeSpotify.ipa"},
{logo:"hd.png",name:"HD Flix",desc:"Netflix+, AppleTV+, Disney+, HBO All in one 2.0",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/HDFlix.ipa"},
{logo:"tk.png",name:"Tiktok",desc:"ACTikTok Tweak 41.0.0",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/TikTok.ipa"},
{logo:"fl.png",name:"Filza",desc:"File Manager for iOS (TrollStore only)",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/Filza.ipa"},
{logo:"dp.png",name:"Dopamine",desc:"Jailbreak for iOS 15–16.6.1 (TrollStore only)",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/Dopamine.ipa"},
{logo:"ngisk.png",name:"KSign",desc:"Sign and install",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/Ksign.ipa"},
{logo:"gnise.png",name:"ESign",desc:"Sign and install third-party IPAs 5.0.2",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/ESign.ipa"},
{logo:"sc.png",name:"Scarlet",desc:"Sideload apps without PC 1.0",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/Scarlet.ipa"}
]

};

// ===== RENDER =====
function showList(list, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  let html = "";
  data[list].forEach((item, index) => {
    let buttonText = "INSTALL";

    if (list === "list3" || list === "list4" || list === "list5") {
      buttonText = "DOWNLOAD";
    }

    if (list === "list1" && index === 0) {
      buttonText = "DOWNLOAD";
    }

    if (list === "list2" && index === 0) {
      buttonText = "DOWNLOAD";
    }

    html += `
      <div class="card" onclick="handleAction('${item.url}')">
        <img class="logo" src="images/${item.logo}">
        <div class="text">
          <h4>${item.name}</h4>
          <p>${item.desc}</p>
        </div>
        <button class="btn">${buttonText}</button>
      </div>
    `;
  });

  document.getElementById("lists").innerHTML = html;
}

showList('list1', document.querySelector('.tab'));
