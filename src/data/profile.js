export const assetUrl = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, "")}`;

export const navItems = [
  { label: "关于", href: "#about" },
  { label: "项目", href: "#projects" },
  { label: "服务", href: "#services" }
];

export const profile = {
  brand: "LULU AI STUDIO",
  name: "王朝阳",
  phone: "18600932393",
  role: "AI时代传播增长顾问｜影视产业专家",
  headline: ["AI时代传播", "增长顾问"],
  englishRole: "AI FILM & GROWTH ADVISOR",
  subline: "用电影级传播方法论，重构 AI 时代的内容生产、品牌破圈与商业增长。",
  intro:
    "电影行业是天然的注意力经济与爆款逻辑孵化器。我的核心能力，是把电影宣发中的故事包装、战役级营销与大众情绪引爆能力，迁移到 AI 时代的企业传播与商业增长。",
  identity: "老舍文艺基金会 AI影视发展专项基金 主任",
  metrics: [
    { value: "15年", label: "影视发行营销经验" },
    { value: "70+", label: "院线电影操盘" },
    { value: "80亿+", label: "累计票房验证" },
    { value: "AI × FILM", label: "跨界增长方法" }
  ]
};

export const capabilities = [
  {
    index: "01",
    title: "内容生产",
    text: "搭建 AI 内容生产体系，提高短视频、品牌内容与项目传播的稳定产能。"
  },
  {
    index: "02",
    title: "传播战役",
    text: "以 Campaign 思维规划故事、节奏、渠道、预算与情绪触点，形成可引爆的传播战役。"
  },
  {
    index: "03",
    title: "商业增长",
    text: "把内容影响力转化为品牌认知、获客效率、项目势能与商业机会。"
  }
];

export const filmProjects = [
  {
    id: "fanghua",
    title: "芳华",
    year: "2017",
    result: "14.23亿",
    category: "国产文艺电影商业化标杆",
    image: assetUrl("images/filmography/poster_cn_14_fang_hua.jpg"),
    summary: "以时代记忆与大众情绪建立传播共鸣，证明非强商业类型内容的破圈能力。"
  },
  {
    id: "dangal",
    title: "摔跤吧！爸爸",
    year: "2017",
    result: "12.99亿",
    category: "进口片本土化运营经典案例",
    image: assetUrl("images/filmography/poster_import_06_dangal.jpg"),
    summary: "完成跨文化内容的情绪翻译与口碑扩散，让圈层作品进入大众市场。"
  },
  {
    id: "ex-files",
    title: "前任攻略系列",
    year: "2014-2017",
    result: "23.21亿",
    category: "现象级爱情 IP 持续运营",
    image: assetUrl("images/filmography/poster_cn_11_qian_ren_3.jpg"),
    summary: "围绕都市关系情绪持续经营内容资产，形成可延展、可累积的系列 IP。"
  },
  {
    id: "mr-six",
    title: "老炮儿",
    year: "2015",
    result: "9.02亿",
    category: "社会文化议题传播范本",
    image: assetUrl("images/filmography/poster_cn_03_lao_pao_er.jpg"),
    summary: "以人物精神和社会议题驱动讨论，完成话题破圈与口碑转化。"
  },
  {
    id: "wasted-times",
    title: "罗曼蒂克消亡史",
    year: "2016",
    result: "重点项目",
    category: "作者电影市场传播",
    image: assetUrl("images/filmography/poster_cn_02_luo_man_di_ke_xiao_wang_shi.jpg"),
    summary: "在电影美学与大众传播之间寻找准确表达，建立作品的独特市场识别。"
  },
  {
    id: "detective-dee",
    title: "狄仁杰之神都龙王",
    year: "2013",
    result: "重点项目",
    category: "类型大片发行",
    image: assetUrl("images/filmography/poster_cn_08_di_ren_jie_shen_du_long_wang.jpg"),
    summary: "围绕类型卖点、档期节奏与渠道协同，支撑头部商业项目全国落地。"
  }
];

export const posterArchive = [
  ["八佰", "poster_cn_01_ba_bai.jpg"],
  ["罗曼蒂克消亡史", "poster_cn_02_luo_man_di_ke_xiao_wang_shi.jpg"],
  ["老炮儿", "poster_cn_03_lao_pao_er.jpg"],
  ["微爱", "poster_cn_04_wei_ai.jpg"],
  ["撒娇女人最好命", "poster_cn_05_sa_jiao_nv_ren_zui_hao_ming.jpg"],
  ["人间·小团圆", "poster_cn_06_ren_jian_xiao_tuan_yuan.jpg"],
  ["私人订制", "poster_cn_07_si_ren_ding_zhi.jpg"],
  ["狄仁杰之神都龙王", "poster_cn_08_di_ren_jie_shen_du_long_wang.jpg"],
  ["十二生肖", "poster_cn_09_shi_er_sheng_xiao.jpg"],
  ["西游·降魔篇", "poster_cn_10_xi_you_xiang_mo_pian.jpg"],
  ["前任3：再见前任", "poster_cn_11_qian_ren_3.jpg"],
  ["前任2：备胎反击战", "poster_cn_12_qian_ren_2.jpg"],
  ["前任攻略", "poster_cn_13_qian_ren_gong_lue.jpg"],
  ["芳华", "poster_cn_14_fang_hua.jpg"],
  ["工作细胞", "poster_import_01_cells_at_work.jpg"],
  ["普罗米亚", "poster_import_02_promare.jpg"],
  ["星际特工：千星之城", "poster_import_03_valerian.jpg"],
  ["狂怒", "poster_import_04_fury.jpg"],
  ["大明猩", "poster_import_05_mr_go.jpg"],
  ["摔跤吧！爸爸", "poster_import_06_dangal.jpg"]
].map(([title, file]) => ({ title, image: assetUrl(`images/filmography/${file}`) }));

export const services = [
  {
    title: "企业 AI 内容体系",
    text: "从内容母题、脚本、分镜到 AI 视频生产与分发，建立稳定、可复用的内容工作流。"
  },
  {
    title: "品牌传播与增长",
    text: "围绕品牌升级、产品上市与年度传播，设计叙事主轴、传播节点和增长抓手。"
  },
  {
    title: "创始人 IP 与培训",
    text: "把专业能力转化为可持续表达，并帮助团队掌握 AI 时代的组织传播能力。"
  },
  {
    title: "影视 / 文旅项目顾问",
    text: "提供内容判断、发行策略、项目包装、资源协同和市场传播的实战支持。"
  }
];

export const career = [
  {
    company: "老舍文艺基金会",
    role: "AI影视发展专项基金 主任",
    detail: "推动 AI 技术与影视产业融合，主导 AI 影视项目、企业培训与内容增长方法论建设。"
  },
  {
    company: "中视浩洋文化传媒有限公司",
    role: "总经理",
    detail: "负责公司战略规划、业务运营、影视项目开发、传媒业务拓展及外部合作。"
  },
  {
    company: "保利影业",
    role: "全国发行总监",
    detail: "统筹全国院线发行策略、渠道资源与重点影片市场落地。"
  },
  {
    company: "华谊兄弟电影",
    role: "发行大区总监",
    detail: "管理区域发行团队，协调院线、媒体及品牌合作，推动重点影片发行目标达成。"
  }
];
