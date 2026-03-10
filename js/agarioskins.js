const mySkins = [
  {
    name: "5gokturk",
    image: "agarskıns/5gok.png"
  },
  {
    name: "5gokturk",
    image: "agarskıns/5g.png"
  },
  {
    name: "5gokturk",
    image: "agarskıns/5g1.png"
  },
  {
    name: "morfin",
    image: "agarskıns/5g2.png"
  },
  {
    name: "lezy",
    image: "images/skin5.png"
  },
  {
    name: "rocky",
    image: "agarskıns/IMG_2070.png"
  },
  {
    name: "jery",
    image: "agarskıns/IMG_2106.jpeg"
  },
  {
    name: "meowDe",
    image: "agarskıns/IMG_2106.jpeg"
  },
  {
    name:"meowDe",,
    image: "agarskıns/IMG_2108.jpeg"
  },
  {
    name: "janq",
    image: ""

  }
];

const duoSkins = [
  {
    name: "deasny",
    image: "agarskıns/IMG_1635.jpeg"
  },
  {
    name: "deasny",
    image: "agarskıns/IMG_2077.jpeg"
  },
  {
    name: "ece",
    image: "agarskıns/IMG_2086.jpeg"
  },
  {
    name: "ece",
    image: "agarskıns/IMG_2087.jpeg"
  },
  {
    name: "kng",
    image: "agarskıns/IMG_2084.jpeg"
  },
  {
    name: "kng",
    image: "agarskıns/IMG_2085.jpeg"
  }
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

  return card;
}

function renderSkinList(list, container) {
  container.innerHTML = "";

  list.forEach((item) => {
    const card = createSkinCard(item);
    container.appendChild(card);
  });
}

function setupTabs() {
  skinTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const targetPanelId = tab.getAttribute("data-panel");

      skinTabs.forEach((btn) => btn.classList.remove("active"));
      skinPanels.forEach((panel) => panel.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(targetPanelId).classList.add("active");
    });
  });
}

renderSkinList(mySkins, mySkinsGrid);
renderSkinList(duoSkins, duoSkinsGrid);
setupTabs();
