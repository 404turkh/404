const SMARTLINK = "https://www.effectivegatecpm.com/mw8g1kgrts?key=40a64cb4f3c60c24be0ad12a5d672125";
const POPUNDER_SRC = "https://pl28561303.effectivegatecpm.com/27/66/ec/2766ece7a0e0304440b31f12e3c950d8.js";

let AD_INTERVAL = 60 * 60 * 1000; // 1 saat

fetch(window.location.href, { method: "HEAD", cache: "no-store" })
  .then((r) => {
    const v = r.headers.get("x-ad-interval");
    if (v) AD_INTERVAL = parseInt(v, 10);
  })
  .catch(() => {});

function loadPopunderOnce() {
  if (window.__POPUNDER_LOADED__) return;
  window.__POPUNDER_LOADED__ = true;

  const s = document.createElement("script");
  s.src = POPUNDER_SRC;
  s.async = true;
  document.head.appendChild(s);
}

function shouldShowAdNow() {
  const now = Date.now();
  const last = Number(localStorage.getItem("lastSkinPageAdTime") || 0);
  return !last || (now - last) > AD_INTERVAL;
}

function markAdShown() {
  localStorage.setItem("lastSkinPageAdTime", String(Date.now()));
}

function triggerAd() {
  loadPopunderOnce();
  window.open(SMARTLINK, "_blank");
  markAdShown();
}

function maybeRunAd() {
  if (shouldShowAdNow()) {
    triggerAd();
  }
}

function getFileNameFromPath(path, fallbackName = "skin") {
  const cleanPath = String(path || "").split("?")[0].split("#")[0];
  const parts = cleanPath.split("/");
  return parts[parts.length - 1] || fallbackName;
}

function startDownload(url, fallbackName = "skin") {
  const link = document.createElement("a");
  link.href = url;
  link.download = getFileNameFromPath(url, fallbackName);
  link.target = "_self";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function handleSkinTap(item) {
  maybeRunAd();
  startDownload(item.image, item.name);
}

const mySkins = [
  { name: "5gokturk", image: "agarskins/5gok.png" },
  { name: "5gokturk", image: "agarskins/5g.png" },
  { name: "5gokturk", image: "agarskins/5g1.png" },

  { name: "5goktur", image: "agarskins/gok1.PNG" },
  { name: "5goktur", image: "agarskins/gok2.PNG" },
  { name: "5goktur", image: "agarskins/gok3.PNG" },
  { name: "5goktur", image: "agarskins/gok4.PNG" },
  { name: "5goktur", image: "agarskins/gok5.PNG" },
  { name: "5goktur", image: "agarskins/gok6.jpg" },
  { name: "5goktur", image: "agarskins/gok7.PNG" },
  { name: "5goktur", image: "agarskins/gok8.jpg" },
  { name: "5goktur", image: "agarskins/gok9.jpg" },
  { name: "5goktur", image: "agarskins/gok10.jpg" },
  { name: "5goktur", image: "agarskins/gok11.jpg" },

  { name: "morfin", image: "agarskins/5g2.png" },
  { name: "lezy", image: "agarskins/IMG_2135.jpeg" },
  { name: "rocky", image: "agarskins/IMG_2070.png" },
  { name: "jery", image: "agarskins/IMG_2134.jpeg" },
  { name: "meowDe", image: "agarskins/IMG_2106.jpeg" },
  { name: "meowDe", image: "agarskins/IMG_2108.jpeg" },
  { name: "janq", image: "agarskins/IMG_2136.jpeg" },

  { name: "getdeadkid", image: "agarskins/0.png" },
  { name: "getdeadkid", image: "agarskins/1.png" },
  { name: "getdeadkid", image: "agarskins/2.png" },
  { name: "getdeadkid", image: "agarskins/3.png" },
  { name: "getdeadkid", image: "agarskins/4.png" },
  { name: "getdeadkid", image: "agarskins/5.png" },
  { name: "getdeadkid", image: "agarskins/6.png" },
  { name: "getdeadkid", image: "agarskins/7.png" },
  { name: "getdeadkid", image: "agarskins/8.png" },
  { name: "getdeadkid", image: "agarskins/9.png" },
  { name: "getdeadkid", image: "agarskins/10.png" },
  { name: "getdeadkid", image: "agarskins/11.png" },
  { name: "getdeadkid", image: "agarskins/12.png" },
  { name: "getdeadkid", image: "agarskins/13.png" },
  { name: "getdeadkid", image: "agarskins/14.png" },
  { name: "getdeadkid", image: "agarskins/15.png" },
  { name: "getdeadkid", image: "agarskins/16.png" },
  { name: "getdeadkid", image: "agarskins/17.png" },
  { name: "getdeadkid", image: "agarskins/18.png" },
  { name: "getdeadkid", image: "agarskins/19.png" },
  { name: "getdeadkid", image: "agarskins/20.png" },
  { name: "getdeadkid", image: "agarskins/21.png" },
  { name: "getdeadkid", image: "agarskins/22.png" },
  { name: "getdeadkid", image: "agarskins/23.png" },
  { name: "getdeadkid", image: "agarskins/24.png" },
  { name: "getdeadkid", image: "agarskins/25.png" },
  { name: "getdeadkid", image: "agarskins/26.png" },
  { name: "getdeadkid", image: "agarskins/27.png" },
  { name: "getdeadkid", image: "agarskins/28.png" },
  { name: "getdeadkid", image: "agarskins/29.png" },
  { name: "getdeadkid", image: "agarskins/30.png" },
  { name: "getdeadkid", image: "agarskins/31.png" }
];

const duoSkins = [
  { name: "deasny", image: "agarskins/IMG_1635.jpeg" },
  { name: "deasny", image: "agarskins/IMG_2077.jpeg" },
  { name: "ece", image: "agarskins/IMG_2086.jpeg" },
  { name: "ece", image: "agarskins/IMG_2087.jpeg" },
  { name: "kng", image: "agarskins/IMG_2084.jpeg" },
  { name: "kng", image: "agarskins/IMG_2085.jpeg" }
];

const mySkinsGrid = document.getElementById("mySkinsGrid");
const duoSkinsGrid = document.getElementById("duoSkinsGrid");
const skinTabs = document.querySelectorAll(".skins-tab");
const skinPanels = document.querySelectorAll(".skins-panel");

function createSkinCard(item) {
  const card = document.createElement("article");
  card.className = "skin-card";

  card.innerHTML = `
    <div class="skin-image-wrap">
      <img src="${item.image}" alt="${item.name}" class="skin-image">
    </div>
    <p class="skin-name">${item.name}</p>
  `;

  card.addEventListener("click", () => {
    handleSkinTap(item);
  });

  return card;
}

function renderSkinList(list, container) {
  if (!container) return;

  container.innerHTML = "";

  list.forEach((item) => {
    if (!item.image) return;
    container.appendChild(createSkinCard(item));
  });
}

function setupTabs() {
  skinTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetPanelId = tab.getAttribute("data-panel");

      skinTabs.forEach((btn) => btn.classList.remove("active"));
      skinPanels.forEach((panel) => panel.classList.remove("active"));

      tab.classList.add("active");

      const targetPanel = document.getElementById(targetPanelId);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });
}

renderSkinList(mySkins, mySkinsGrid);
renderSkinList(duoSkins, duoSkinsGrid);
setupTabs();
