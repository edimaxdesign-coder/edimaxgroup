window.CMS_SEED_DATA = {
  copyVersion: 4,
  companies: [
    { id: "company-edimax", title: "訊舟科技 Edimax", shortName: "Edimax", summary: "提供 Wi-Fi、網路設備與相關產品線，支援企業採購、通路銷售與長期供貨需求。", tags: ["品牌", "網通設備", "全球通路"], logo: "logo/edimax logo.png", url: "https://www.edimax.com/edimax/global", published: true },
    { id: "company-acelink", title: "Acelink", shortName: "Acelink", summary: "提供 OEM/ODM 製造、供應鏈管理與量產服務，支援客製規格與穩定交付。", tags: ["代工品牌", "供應鏈", "量產交付"], logo: "logo/acelink logo.png", url: "https://www.acelink.com.tw/", published: true },
    { id: "company-comtrend", title: "康全電訊 Comtrend", shortName: "Comtrend", summary: "提供寬頻接取、CPE 與電信設備，支援營運商與服務商的網路建置需求。", tags: ["寬頻", "電信設備", "CPE"], logo: "logo/comtrend logo.png", url: "https://www.comtrend.com/index.htm", published: true },
    { id: "company-abst", title: "歐科電信 ABST", shortName: "ABST", summary: "支援電信與企業專案導入，包含需求確認、系統串接與現場整合服務。", tags: ["電信應用", "專案導入", "場域整合"], logo: "logo/abst logo.png", url: "https://www.abst.com.tw/", published: true },
    { id: "company-smax", title: "訊奇 SMAX", shortName: "SMAX", summary: "提供智慧應用與軟硬體整合，協助場域串接設備、感測資料與管理介面。", tags: ["智慧應用", "系統整合", "IoT"], logo: "logo/smax logo.png", url: "https://www.smax.com.tw/", published: true },
    { id: "company-nimbletech", title: "捷創數位 NimbleTech", shortName: "NimbleTech", summary: "提供數位平台、資料服務與前後台介面，支援設備管理與營運流程數位化。", tags: ["數位平台", "資料服務", "後台系統"], logo: "logo/nimbletech logo.png", url: "https://www.nimbletech.com.tw/", published: true },
    { id: "company-iti", title: "銓智科 ITI", shortName: "ITI", summary: "提供技術支援、方案評估與驗證服務，協助處理特殊規格與跨團隊整合需求。", tags: ["技術單位", "專業支援", "集團資源"], logo: "logo/iti logo.png", url: "", published: true }
  ],
  solutions: [
    { id: "solution-smart-building", title: "智慧建築網路整合", summary: "適用於商辦、住宅與園區，整合網路設備、連線管理與維運服務。", participants: ["Edimax", "Acelink", "SMAX", "NimbleTech"], image: "images/solutions-web/smart-building-network.jpg", accent: "red", published: true },
    { id: "solution-broadband", title: "寬頻通訊設備方案", summary: "提供 CPE、寬頻接取與客製設備選項，支援營運商與通路夥伴導入。", participants: ["Comtrend", "Acelink", "Edimax", "ABST"], image: "images/solutions-web/broadband-communication.jpg", accent: "blue", published: true },
    { id: "solution-aiot", title: "AIoT 場域應用", summary: "整合感測設備、連線、資料管理與應用平台，支援企業場域管理。", participants: ["SMAX", "ITI", "NimbleTech"], image: "images/solutions-web/aiot-field-application.jpg", accent: "green", published: true },
    { id: "solution-enterprise-security", title: "企業網路與資安連接", summary: "支援企業據點、辦公室與分支場域的連線部署、設備管理與後續維運。", participants: ["Edimax", "Comtrend", "ITI"], image: "images/solutions-web/enterprise-security-network.jpg", accent: "dark", published: true }
  ],
  cases: [
    { id: "case-campus-iot", title: "企業園區網路與 IoT 管理平台", type: "智慧場域", summary: "企業園區可整合網路設備、感測資料與管理平台，集中掌握場域狀態。", participants: ["Edimax", "Acelink", "SMAX", "NimbleTech"], displayStatus: "可對外展示", background: "linear-gradient(135deg, #edf4ff, #fff1f2)", featured: true, published: true },
    { id: "case-broadband-custom", title: "寬頻設備客製導入", type: "電信應用", summary: "依營運商需求評估設備規格、韌體設定與在地導入服務。", participants: ["Comtrend", "Acelink", "ABST"], displayStatus: "可對外展示", background: "linear-gradient(135deg, #eef7ff, #ffffff)", featured: false, published: true },
    { id: "case-group-cms", title: "方案資訊與諮詢管理", type: "數位平台", summary: "集中管理方案內容、案例與聯繫資訊，讓訪客更容易找到下一步。", participants: ["NimbleTech", "Edimax"], displayStatus: "規劃中", background: "linear-gradient(135deg, #fff6f6, #ffffff)", featured: false, published: true }
  ]
};
