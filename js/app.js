// ====== REKLAM LİNKİN ======
const adLink = "https://hopeful-border.com/bl3.VG0aPG3rpivYbPmoVAJ/ZSD/0c2dNyz/Qj4dMfjhUc5/LgT/Yk3INkD/g/yyNpjiAH";

// ====== ÇİFT TIKLAMA SİSTEMİ ======
let clickCount = {};

function handleAction(url){
  if(url === ""){ openAd(); return; }

  if(!clickCount[url]) clickCount[url] = 0;
  clickCount[url]++;

  if(clickCount[url] == 1){
    window.open(adLink,"_blank");
  } else {
    clickCount[url] = 0;
    window.open(url,"_blank");
  }
}

function openAd(){
  window.open(adLink,"_blank");
}

// ====== DATA ======

const data = {

list1: [

{logo:"snd.png",name:"Dns Profile",desc:"",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1/byharambro.mobileconfig"},
{logo:"snd.png",name:"Dns Profile",desc:"Config",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1/bypassrevokedns.mobileconfig"},
{logo:"ngisk.png",name:"KSign",desc:"Qingdao Rural Commercial Bank Co., Ltd",url:"https://api.khoindvn.eu.org/KXcveB"},
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
{logo:"tw.png",name:"esing",desc:"Certificate",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/ESignCert.zip"},

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
{logo:"raga.png",name:"Agar.io",desc:"Kahraba Mod Requires License",url:"https://github.com/404turkh/404/releases/download/%EA%B3%A1%ED%84%B0%ED%81%AC/26.3.5.kahraba.ipa"}
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
{logo:"ngisk.png",name:"KSign",desc:"Currently under maintenance",url:""},
{logo:"gnise.png",name:"ESign",desc:"Sign and install third-party IPAs 5.0.2",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/ESign.ipa"},
{logo:"sc.png",name:"Scarlet",desc:"Sideload apps without PC 1.0",url:"https://github.com/404turkh/404/releases/download/%E2%80%94%CD%9E%CD%9F%CD%9E%E2%98%85/Scarlet.ipa"}
]

};


// ===== RENDER =====
function showList(list,el){
document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
el.classList.add('active');

let html="";
data[list].forEach((item,index)=>{

// Varsayılan buton yazısı
let buttonText = "INSTALL";

// List3, List4, List5 → DOWNLOAD
if(list === "list3" || list === "list4" || list === "list5"){
  buttonText = "DOWNLOAD";
}

// KSign (list1) → sadece ilk kart DOWNLOAD
if(list === "list1" && index === 0){
  buttonText = "DOWNLOAD";
}

// ESign (list2) → sadece ilk kart DOWNLOAD
if(list === "list2" && index === 0){
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

// ===== HILLTOPADS IN-PAGE PUSH =====
(function(gxe){
var d = document,
    s = d.createElement('script'),
    l = d.scripts[d.scripts.length - 1];
s.settings = gxe || {};
s.src = "//piercing-flower.com/byXpVTs.dAG/lH0EYCW/c_/zeLmj9AuwZNUolgkXPlTEYA3qNFD/ku1lOvTnYltUNOjfcq0lO/TlUa5aNzww";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})();

