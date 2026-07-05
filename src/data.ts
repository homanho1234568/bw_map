export interface Freebie {
  id: string;
  name: string;
  type: 'card' | 'bag' | 'badge' | 'sticker' | 'fan' | 'poster' | 'other';
  description: string;
  condition: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Booth {
  id: string;
  name: string;
  code: string; // e.g. "3A33"
  hall: string; // e.g. "1.1H", "2.1H", "3.1H", "4.1H", "5.1H", "6.1H", "8.1H"
  category: 'game' | 'virtual' | 'model' | 'tabletop' | 'creator' | 'bazaar' | 'romance' | 'tech';
  description: string;
  tags: string[];
  freebies: Freebie[];
  // Relative position on the hall map (0-100)
  mapX: number;
  mapY: number;
  width?: number;
  height?: number;
  featured?: boolean;
}

export interface Hall {
  id: string;
  name: string;
  theme: string;
  color: string;
  bgGrad: string;
  description: string;
}

export const HALLS: Hall[] = [
  { id: '1.1H', name: '1.1H 館', theme: '夢幻集市 / 一起桌遊 / 戀戀心聲', color: 'text-pink-500', bgGrad: 'from-pink-500/10 to-purple-500/10', description: '聚集熱門女性向遊戲、創作者攤位、大型桌遊廠牌與廣播劇配音專區。' },
  { id: '2.1H', name: '2.1H 館', theme: '虛擬樂園 / 模玩英雄', color: 'text-emerald-500', bgGrad: 'from-emerald-500/10 to-teal-500/10', description: '虛擬主播、VTuber 交流專區，以及頂尖模型、手辦與周邊販售展位。' },
  { id: '3.1H', name: '3.1H 館', theme: '遊戲世界 (冒險前線)', color: 'text-blue-500', bgGrad: 'from-blue-500/10 to-indigo-500/10', description: '雲集《崩壞：星穹鐵道》、《鳴潮》、《明日方舟》及各大電競與主機硬體巨頭。' },
  { id: '4.1H', name: '4.1H 館', theme: '遊戲世界 (奇幻冒險)', color: 'text-cyan-500', bgGrad: 'from-cyan-500/10 to-blue-500/10', description: '主打《黑神話：悟空》、《Fate/Grand Order》、《Cygames》及各大熱門動作、獨立遊戲。' },
  { id: '5.1H', name: '5.1H 館', theme: '遊戲世界 (不熄幻境)', color: 'text-violet-500', bgGrad: 'from-violet-500/10 to-fuchsia-500/10', description: '涵蓋《原神》、《無限暖暖》、《第五人格》、《時空中的繪旅人》等頂級大作與開放世界。' },
  { id: '6.1H', name: '6.1H 館', theme: '不止動畫', color: 'text-red-500', bgGrad: 'from-red-500/10 to-orange-500/10', description: '動漫愛好者的天堂！包含 Bilibili 會員購、各大知名 IP（三麗鷗、名創優品、木棉花、羅森）與大型舞台。' },
  { id: '8.1H', name: '8.1H 館', theme: 'UP主空間 / 大飽眼福', color: 'text-amber-500', bgGrad: 'from-amber-500/10 to-yellow-500/10', description: '百大 UP 主現場見面會與創作者交流空間，同時配備頂級攝影器材體驗區（索尼、佳能、尼康）。' }
];

export const BOOTHS: Booth[] = [
  // === 1.1H ===
  {
    id: '1-genshin-creators',
    name: '原神主題創作者專區',
    code: '1A01',
    hall: '1.1H',
    category: 'bazaar',
    description: '原神官方授權的同人創作者集市，販售精美二創周邊。',
    tags: ['原神', '同人', '集市'],
    mapX: 20, mapY: 20, width: 25, height: 12,
    featured: true,
    freebies: [
      { id: 'g-cre-1', name: '創作者聯名明信片', type: 'poster', description: '由人氣畫師繪製的限定明信片。', condition: '追蹤原神同人社區並出示畫面', difficulty: 'easy' },
      { id: 'g-cre-2', name: '原神派蒙貼紙', type: 'sticker', description: '超可愛的旅行者貼紙。', condition: '現場打卡分享至動態', difficulty: 'easy' }
    ]
  },
  {
    id: '1-hsr-creators',
    name: '崩壞：星穹鐵道主題創作者專區',
    code: '1A02',
    hall: '1.1H',
    category: 'bazaar',
    description: '星穹鐵道創作者同人專區，列載列車組在展會中的各種精美周邊。',
    tags: ['星穹鐵道', '同人', '周邊'],
    mapX: 48, mapY: 20, width: 25, height: 12,
    featured: true,
    freebies: [
      { id: 'hsr-cre-1', name: '垃圾桶主題限定便籤紙', type: 'other', description: '星鐵特色垃圾桶造型便籤。', condition: '現場大喊「幫幫我，神策將軍！」或回答星鐵小知識', difficulty: 'medium' }
    ]
  },
  {
    id: '1-ba-creators',
    name: '蔚藍檔案主題專區',
    code: '1A03',
    hall: '1.1H',
    category: 'bazaar',
    description: '奇普托斯學生們的線下同人攤位聚落。',
    tags: ['蔚藍檔案', '同人', '沙勒'],
    mapX: 20, mapY: 35, width: 25, height: 12,
    freebies: [
      { id: 'ba-cre-1', name: 'Q版彩奈紙摺扇', type: 'fan', description: '藍白色調，夏天逛展必備解暑扇。', condition: '追蹤沙勒官方B站帳號', difficulty: 'easy' }
    ]
  },
  {
    id: '1-wuthering-creators',
    name: '鳴潮主題專區',
    code: '1A04',
    hall: '1.1H',
    category: 'bazaar',
    description: '鳴潮同人創作街區，展示和發售漂泊者的冒險作品。',
    tags: ['鳴潮', '同人', '漂泊者'],
    mapX: 48, mapY: 35, width: 25, height: 12,
    freebies: [
      { id: 'wu-cre-1', name: '秧秧/忌炎限定書籤', type: 'card', description: '金屬質感壓紋精緻書籤。', condition: '預約鳴潮或出示登入介面', difficulty: 'easy' }
    ]
  },
  {
    id: '1-asmodee',
    name: 'Asmodee 艾斯魔代桌遊',
    code: '1T01',
    hall: '1.1H',
    category: 'tabletop',
    description: '全球領先的桌遊出版商，現場提供熱門桌遊試玩，如《卡卡頌》、《鐵路環遊》等。',
    tags: ['桌遊', '試玩', '卡卡頌'],
    mapX: 15, mapY: 60, width: 18, height: 14,
    freebies: [
      { id: 'as-1', name: '桌遊體驗限定徽章', type: 'badge', description: '印有經典桌遊角色的限量金屬徽章。', condition: '現場排隊試玩任意一款桌遊達10分鐘', difficulty: 'medium' }
    ]
  },
  {
    id: '1-mtg',
    name: '萬智牌 Magic: The Gathering',
    code: '1T02',
    hall: '1.1H',
    category: 'tabletop',
    description: '經典集換式卡牌，現場設有新手教學區與現場對決區。',
    tags: ['萬智牌', '卡牌', 'TCG'],
    mapX: 36, mapY: 60, width: 18, height: 14,
    featured: true,
    freebies: [
      { id: 'mtg-1', name: '新手歡迎卡牌包 + 限量卡套', type: 'card', description: '包含 30 張基礎卡牌，並贈送 10 個精美卡套。', condition: '參與新手引導教學（約 15 分鐘）', difficulty: 'medium' }
    ]
  },
  {
    id: '1-yugioh',
    name: '遊戲王 OCG',
    code: '1T03',
    hall: '1.1H',
    category: 'tabletop',
    description: 'KONAMI 官方展位，舉辦「決鬥者交流會」，提供正版卡牌試玩。',
    tags: ['遊戲王', '卡牌', '決鬥'],
    mapX: 57, mapY: 60, width: 18, height: 14,
    freebies: [
      { id: 'yg-1', name: '青眼白龍主題貼紙 / 限量硬紙提袋', type: 'bag', description: '霸氣十足的青眼白龍提袋與炫彩貼紙。', condition: '與工作人員對戰或完成現場問卷', difficulty: 'medium' }
    ]
  },
  {
    id: '1-matsuerfm',
    name: '貓耳 FM 廣播劇專區',
    code: '1V01',
    hall: '1.1H',
    category: 'romance',
    description: '知名女性向、耽美、言情廣播劇聲優見面會與線下錄音棚體驗。',
    tags: ['配音', '廣播劇', '聲優'],
    mapX: 80, mapY: 70, width: 15, height: 18,
    freebies: [
      { id: 'me-1', name: '熱門廣播劇鐳射聲音卡', type: 'card', description: '掃碼可收聽主角專屬問候語音。', condition: '關注貓耳FM並轉發最新動態', difficulty: 'easy' }
    ]
  },

  // === 2.1H ===
  {
    id: '2-hololive',
    name: 'hololive production',
    code: '2V01',
    hall: '2.1H',
    category: 'virtual',
    description: '知名 VTuber 經紀公司，現場舉辦成員連線 live 與粉絲見面會。',
    tags: ['VTuber', 'Hololive', '直播'],
    mapX: 12, mapY: 20, width: 24, height: 18,
    featured: true,
    freebies: [
      { id: 'holo-1', name: 'Hololive 紀念明信片套裝', type: 'poster', description: '包含三位熱門成員的 BW 限定繪製插畫明信片。', condition: '1. 追蹤官方B站帳號；2. 拍攝現場展台發布動態', difficulty: 'medium' },
      { id: 'holo-2', name: '吉祥物應援氣球', type: 'other', description: '超好玩的充氣應援棒。', condition: '在展台特定時段參與互動呼喊口號', difficulty: 'easy' }
    ]
  },
  {
    id: '2-virtuareal',
    name: 'VirtuaReal 虛擬藝人專區',
    code: '2V02',
    hall: '2.1H',
    category: 'virtual',
    description: 'Bilibili 旗下的虛擬藝人企劃，包含多位知名國V的現場互動。',
    tags: ['VirtuaReal', '國V', '互動'],
    mapX: 12, mapY: 42, width: 24, height: 15,
    freebies: [
      { id: 'vr-1', name: '七海 Nana7mi 限定閃卡', type: 'card', description: '精美的折光閃卡，極具收藏價值。', condition: '關注 VirtuaReal 官方B站帳號', difficulty: 'easy' }
    ]
  },
  {
    id: '2-sega',
    name: 'SEGA 世嘉 / TAITO 太鼓',
    code: '2M01',
    hall: '2.1H',
    category: 'model',
    description: '世嘉及太鼓限定手辦展出，並提供超高人氣景品與盲盒販售。',
    tags: ['手辦', '景品', '盲盒'],
    mapX: 45, mapY: 18, width: 22, height: 12,
    freebies: [
      { id: 'se-1', name: 'SEGA 藍色音速小子徽章', type: 'badge', description: '刺蝟索尼克金屬烤漆徽章。', condition: '加入官方粉絲社群', difficulty: 'easy' }
    ]
  },
  {
    id: '2-bandai',
    name: 'BANDAI NAMCO 萬代南夢宮',
    code: '2M02',
    hall: '2.1H',
    category: 'model',
    description: '高達模型（Gunpla）、魂 WEB 限定手辦、一番賞及豐富扭蛋現場販賣。',
    tags: ['高達', '鋼普拉', '一番賞'],
    mapX: 45, mapY: 65, width: 25, height: 18,
    featured: true,
    freebies: [
      { id: 'ban-1', name: '高達環保手提袋 (大型)', type: 'bag', description: '質量超好，足以裝下多盒高達模型的大容量手提袋。', condition: '完成高達拼裝教室體驗（約 10 分鐘，免費參加）', difficulty: 'medium' },
      { id: 'ban-2', name: '萬代限定鋼彈貼紙包', type: 'sticker', description: '包含元祖高達、風靈高達等精美貼紙。', condition: '排隊打卡並填寫官方滿意度問卷', difficulty: 'easy' }
    ]
  },
  {
    id: '2-gsc',
    name: 'GOOD SMILE CHINA 良笑中國',
    code: '2M03',
    hall: '2.1H',
    category: 'model',
    description: '粘土人、比例模型大廠。現場設有「粘土人展示牆」，極為壯觀。',
    tags: ['粘土人', '良笑', '手辦'],
    mapX: 72, mapY: 65, width: 22, height: 15,
    freebies: [
      { id: 'gsc-1', name: '粘土人十週年紀念紙扇', type: 'fan', description: '印有多位人氣粘土人角色的大圓扇。', condition: '追蹤 GoodSmile 官方自媒體帳號', difficulty: 'easy' }
    ]
  },
  {
    id: '2-kotobukiya',
    name: 'KOTOBUKIYA 壽屋',
    code: '2M04',
    hall: '2.1H',
    category: 'model',
    description: '拼裝模型（美少女機娘、機戰系列）與比例手辦展示販售。',
    tags: ['壽屋', '機娘', '拼裝'],
    mapX: 72, mapY: 48, width: 22, height: 12,
    freebies: [
      { id: 'koto-1', name: 'Frame Arms Girl 限定機娘貼紙', type: 'sticker', description: '壽屋經典機娘防水貼紙。', condition: '拍攝展位任意機娘模型並上傳至社交平台', difficulty: 'easy' }
    ]
  },

  // === 3.1H ===
  {
    id: '3-hsr',
    name: '崩壞：星穹鐵道 (官方)',
    code: '3A33',
    hall: '3.1H',
    category: 'game',
    description: '「匹諾康尼」或最新星際航線主題展台，巨型實景還原，現場有 Coser 互動與高燃舞台。',
    tags: ['米哈遊', '星鐵', '冒險'],
    mapX: 52, mapY: 55, width: 24, height: 16,
    featured: true,
    freebies: [
      { id: 'hsr-1', name: '星軌車票 + 角色鐳射紀念卡', type: 'card', description: '做工極致的透卡與實體列車車票，極具收藏價值。', condition: '1. 關注官方B站帳號; 2. 出示遊戲UID證明; 3. 與任意 Coser 合照', difficulty: 'medium' },
      { id: 'hsr-2', name: '開拓者特製雙面無紡布提袋', type: 'bag', description: '大型精美手提袋，印有開拓者與三月七。', condition: '完成現場小遊戲挑戰「解密夢境」', difficulty: 'medium' }
    ]
  },
  {
    id: '3-wuthering',
    name: '鳴潮 (官方)',
    code: '3A32',
    hall: '3.1H',
    category: 'game',
    description: '庫洛遊戲全新力作，巨型「聲骸」實景，提供高難度副本挑戰賽與全新版本試玩。',
    tags: ['鳴潮', '庫洛', '動作'],
    mapX: 25, mapY: 55, width: 24, height: 16,
    featured: true,
    freebies: [
      { id: 'wu-1', name: '漂泊者限定摺疊折扇', type: 'fan', description: '黑金炫酷古風摺扇，十分帥氣。', condition: '關注《鳴潮》官方社群並預約/登入遊戲', difficulty: 'easy' },
      { id: 'wu-2', name: '全角色合影海報 + 聲骸主題徽章', type: 'badge', description: '高解析度精美大海報，附隨機聲骸烤漆徽章。', condition: '在試玩區通關特定挑戰 boss（難度較高）', difficulty: 'hard' }
    ]
  },
  {
    id: '3-arknights',
    name: '明日方舟 (官方)',
    code: '3A34',
    hall: '3.1H',
    category: 'game',
    description: '鷹角網絡展台，羅德島陸上艦實景，設有幹員尋訪機，體驗線下單抽樂趣！',
    tags: ['明日方舟', '鷹角', '塔防'],
    mapX: 25, mapY: 74, width: 24, height: 16,
    featured: true,
    freebies: [
      { id: 'ark-1', name: '羅德島限定幹員檔案袋', type: 'bag', description: '牛皮紙復古風格，內含幹員明信片、特製貼紙、限定杯墊。', condition: '現場排隊體驗「線下單抽」小遊戲並轉發置頂微博/動態', difficulty: 'medium' }
    ]
  },
  {
    id: '3-endfield',
    name: '明日方舟：終末地',
    code: '3A30',
    hall: '3.1H',
    category: 'game',
    description: '鷹角全新3D即時策略 RPG，现场提供高規格 PC 與主機端超前試玩體驗。',
    tags: ['終末地', '鷹角', '3D'],
    mapX: 52, mapY: 74, width: 24, height: 16,
    freebies: [
      { id: 'end-1', name: '集成工業大容量帆布袋', type: 'bag', description: '極簡科幻風格，白色厚實帆布，逛展收納神器。', condition: '完成現場試玩（預期排隊 30 分鐘以上）', difficulty: 'hard' }
    ]
  },
  {
    id: '3-reverse1999',
    name: '重返未來：1999',
    code: '3A01',
    hall: '3.1H',
    category: 'game',
    description: '深藍互動英倫神秘學風格展位，全歐式奢華復古沙龍裝修，現場配備頂配英配聲優打卡。',
    tags: ['重返未來', '二次元', '神祕學'],
    mapX: 12, mapY: 15, width: 10, height: 10,
    freebies: [
      { id: 'rev-1', name: '神秘學家經典報紙手冊 + 明信片', type: 'poster', description: '仿舊英文報紙風格，拍照打卡極佳。', condition: '關注官方B站並發布帶展台照動態', difficulty: 'easy' }
    ]
  },
  {
    id: '3-bluearchive',
    name: '蔚藍檔案 (官方)',
    code: '3A02',
    hall: '3.1H',
    category: 'game',
    description: '悠星網絡發行，熱春風情「沙勒」辦公室與巨型佩洛洛氣球。',
    tags: ['蔚藍檔案', '青春', '悠星'],
    mapX: 24, mapY: 15, width: 10, height: 10,
    freebies: [
      { id: 'ba-1', name: '佩洛洛大氣球 / 沙勒工作證', type: 'other', description: '超可愛的可手提佩洛洛充氣玩偶。', condition: '出示遊戲玩家等級（高於50級）或現場拍照打卡', difficulty: 'easy' }
    ]
  },
  {
    id: '3-rog',
    name: 'ROG 玩家國度',
    code: '3A17',
    hall: '3.1H',
    category: 'tech',
    description: '頂級電競硬體，現場展示高達聯名主機、RTX4090猛禽顯卡與多款掌機。',
    tags: ['ROG', '硬體', '電競'],
    mapX: 12, mapY: 38, width: 10, height: 10,
    freebies: [
      { id: 'rog-1', name: '玩家國度 ROG 信仰貼紙 + 鼠標墊', type: 'sticker', description: '帥氣敗家之眼貼紙與定制鎖邊布質鼠標墊。', condition: '在體驗區使用 ROG 掌機遊玩指定格鬥遊戲並獲勝', difficulty: 'medium' }
    ]
  },
  {
    id: '3-nikke',
    name: '勝利女神：妮姬',
    code: '3A07',
    hall: '3.1H',
    category: 'game',
    description: '騰訊 Level Infinite 發行，真實還原「前哨基地」，並有知名 Coser 現場演繹熱門妮姬。',
    tags: ['妮姬', '射擊', 'Coser'],
    mapX: 72, mapY: 15, width: 10, height: 10,
    freebies: [
      { id: 'nik-1', name: '妮姬隨機鐳射票 (含毒蛇、紅蓮)', type: 'card', description: '鐳射工藝，不同角度呈現炫彩光芒。', condition: '追蹤妮姬官方繁中或簡中社群並在展位拍照打卡', difficulty: 'easy' }
    ]
  },

  // === 4.1H ===
  {
    id: '4-wukong',
    name: '黑神話：悟空 (官方)',
    code: '4A46',
    hall: '4.1H',
    category: 'game',
    description: '遊戲科學主舞台，中式佛教美學與浮雕石壁實景，現場可試玩高難度 Boss 挑戰賽。',
    tags: ['黑神話', '動作', '西遊'],
    mapX: 55, mapY: 82, width: 15, height: 12,
    featured: true,
    freebies: [
      { id: 'wu-k-1', name: '「直面天命」燙金絹絲手巾', type: 'other', description: '印有金箍棒與黑神話Logo的手巾，極具質感。', condition: '1. 拍攝展位巨幅海報發朋友圈/動態; 2. 挑戰現場「虎先鋒」或「毒敵大王」並堅持3分鐘以上', difficulty: 'medium' },
      { id: 'wu-k-2', name: '天命人限定卷軸海報', type: 'poster', description: '水墨風大畫幅卷軸，收藏價值極高。', condition: '在現場小擂台賽中成功擊敗「二郎神」或任意關卡 Boss（限時限量）', difficulty: 'hard' }
    ]
  },
  {
    id: '4-fgo',
    name: 'Fate/Grand Order',
    code: '4A43',
    hall: '4.1H',
    category: 'game',
    description: '嗶哩嗶哩獨家代理，聖晶石巨型發光雕塑、英靈召唤陣線下體驗。',
    tags: ['FGO', '命運', '卡牌'],
    mapX: 36, mapY: 65, width: 22, height: 14,
    featured: true,
    freebies: [
      { id: 'fgo-1', name: '十週年紀念亞克力御主掛件', type: 'other', description: '精緻的亞克力掛飾。', condition: '出示登入天數超過1000天的FGO國服/日服界面', difficulty: 'medium' },
      { id: 'fgo-2', name: '芙芙主題解壓紙扇 + 徽章', type: 'fan', description: '粉白可愛的芙芙扇子。', condition: '追蹤官方B站帳號並發布九宮格展位照片', difficulty: 'easy' }
    ]
  },
  {
    id: '4-cygames',
    name: 'Cygames',
    code: '4A05',
    hall: '4.1H',
    category: 'game',
    description: 'Cy 大廠專區，主打《賽馬娘 Pretty Derby》、《碧藍幻想 ReLink》等，超大扭蛋機現場抽獎。',
    tags: ['Cygames', '賽馬娘', 'GBF'],
    mapX: 52, mapY: 15, width: 12, height: 10,
    freebies: [
      { id: 'cy-1', name: '黃金船/特別週Q版鑰匙圈', type: 'other', description: '軟膠鑰匙扣，極度可愛。', condition: '關注賽馬娘簡中/繁中官方動態，並參與投球小遊戲', difficulty: 'medium' }
    ]
  },
  {
    id: '4-palworld',
    name: '幻獸帕魯 Palworld',
    code: '4A27',
    hall: '4.1H',
    category: 'game',
    description: 'Pocketpair 展台，多隻一比一還原的「搗蛋貓」與「疾風隼」巨型公仔，拍照超吸睛。',
    tags: ['帕魯', '沙盒', '生存'],
    mapX: 25, mapY: 42, width: 10, height: 10,
    freebies: [
      { id: 'pal-1', name: '「不願做奴隸的帕魯」限定貼紙包', type: 'sticker', description: '印有帕魯打工、流淚表情的搞笑表情包貼紙。', condition: '現場拍照打卡並附帶「#我是合格的帕魯大師」發布社交媒體', difficulty: 'easy' }
    ]
  },
  {
    id: '4-jdesports',
    name: 'JD Esports 京東電競',
    code: '4A48',
    hall: '4.1H',
    category: 'tech',
    description: '京東電競體驗館，現場有頂級職業戰隊（JDG）隊員見面簽名會。',
    tags: ['JDG', '電競', '職業隊'],
    mapX: 72, mapY: 82, width: 12, height: 12,
    freebies: [
      { id: 'jd-1', name: 'JDG 戰隊限定應援手幅 + 手提袋', type: 'bag', description: '紅藍拼色不織布手提袋，極為厚實。', condition: '在京東APP內搜索指定關鍵字並關注店鋪', difficulty: 'easy' }
    ]
  },

  // === 5.1H ===
  {
    id: '5-genshin',
    name: '原神 (官方)',
    code: '5A38',
    hall: '5.1H',
    category: 'game',
    description: '「納塔」或全新火之國主題大展台，極度震撼的龍形巨獸雕塑，每天固定時段有大合唱與嘉賓互動。',
    tags: ['米哈遊', '原神', '納塔'],
    mapX: 35, mapY: 65, width: 25, height: 18,
    featured: true,
    freebies: [
      { id: 'gen-1', name: '納塔主題限定手提紙袋 + 角色透卡', type: 'bag', description: '極致奢華的大手提袋，正反面為不同的納塔新角色。', condition: '1. 關注原神B站官方帳號; 2. 現場打卡並發送帶圖動態', difficulty: 'medium' },
      { id: 'gen-2', name: '原神派蒙充氣頭飾', type: 'other', description: '可以戴在頭上的派蒙充氣頭冠，全場最亮眼！', condition: '參與現場「火之試煉」趣味問答，連續答對三題', difficulty: 'medium' }
    ]
  },
  {
    id: '5-nikki',
    name: '無限暖暖 (Infinity Nikki)',
    code: '5A06',
    hall: '5.1H',
    category: 'game',
    description: '疊紙網絡研發的開放世界換裝冒險遊戲，唯美粉色森林實景，設有「大喵甜品屋」與精緻搭配區。',
    tags: ['疊紙', '換裝', '暖暖'],
    mapX: 15, mapY: 15, width: 20, height: 14,
    featured: true,
    freebies: [
      { id: 'nikk-1', name: '大喵毛絨束口袋 + 精美貼紙包', type: 'bag', description: '超柔軟的毛絨抽繩袋，印有大喵傲嬌的臉。', condition: '下載/預約無限暖暖，並在現場夢幻大樹前打卡拍照上傳', difficulty: 'medium' }
    ]
  },
  {
    id: '5-identityv',
    name: '第五人格 (Identity V)',
    code: '5A17',
    hall: '5.1H',
    category: 'game',
    description: '網易非對稱競技大作，莊園實景重現。現場有「狂歡之椅」打卡點，刺激又好玩。',
    tags: ['網易', '第五人格', '莊園'],
    mapX: 60, mapY: 15, width: 20, height: 14,
    freebies: [
      { id: 'id5-1', name: '求生者/監管者限定透卡（隨機發送）', type: 'card', description: '透明磨砂卡片，包含人氣角色「園丁」、「傑克」。', condition: '現場排隊體驗一局「莊園大逃殺」對決（不論輸贏）', difficulty: 'medium' }
    ]
  },
  {
    id: '5-lightandnight',
    name: '光與夜之戀',
    code: '5A24',
    hall: '5.1H',
    category: 'game',
    description: '騰訊極光計劃旗下高沉浸女性向戀愛手遊，極致浪漫的主題玫瑰莊園，五位男主等身立牌與專屬電話亭。',
    tags: ['騰訊', '光夜', '女性向'],
    mapX: 52, mapY: 35, width: 20, height: 14,
    featured: true,
    freebies: [
      { id: 'ln-1', name: '男主專屬語音鐳射信封（五選一）', type: 'card', description: '拆開信封有精美鐳射卡，並附有專屬配音台詞二維碼。', condition: '出示遊戲內特定卡牌證明，或在展位「真愛留言牆」留下手寫祝福', difficulty: 'medium' }
    ]
  },

  // === 6.1H ===
  {
    id: '6-bilibilishopping',
    name: 'Bilibili 會員購 & 嗶哩嗶哩大會員',
    code: '6A01',
    hall: '6.1H',
    category: 'bazaar',
    description: 'B站官方周邊販售與大會員福利中心，提供獨家限定周邊與抽獎活動。',
    tags: ['Bilibili', '大會員', '會員購'],
    mapX: 12, mapY: 15, width: 22, height: 15,
    featured: true,
    freebies: [
      { id: 'bi-1', name: '嗶哩嗶哩經典小電視帆布手提袋', type: 'bag', description: '藍白雙面印花，質量卓越，全場最實用的購物袋。', condition: '大會員用戶可直接免費領取（每日限量），非大會員需關注會員購並分享置頂動態', difficulty: 'easy' },
      { id: 'bi-2', name: 'BW2026限定小電視金屬胸針', type: 'badge', description: '戴著警長帽的炫彩金屬胸針，僅限BW會場獲得。', condition: '在會員購消費滿 99 元即可附贈（或參與大會員幸運大轉盤）', difficulty: 'medium' }
    ]
  },
  {
    id: '6-lawson',
    name: '羅森 LAWSON',
    code: '6A30',
    hall: '6.1H',
    category: 'bazaar',
    description: '羅森便利店 BW 聯名主题店，現場售賣特製小電視便當、甜點及動漫限定商品。',
    tags: ['羅森', '便利店', '限定'],
    mapX: 38, mapY: 45, width: 14, height: 10,
    freebies: [
      { id: 'law-1', name: '羅森x小電視聯名保冷袋 / 貼紙', type: 'bag', description: '藍色羅森條紋印有小電視，保溫實用。', condition: '現場購買任意兩款 Bilibili 聯名飯糰或飲料', difficulty: 'easy' }
    ]
  },
  {
    id: '6-sanrio',
    name: 'Sanrio 三麗鷗',
    code: '6A38',
    hall: '6.1H',
    category: 'bazaar',
    description: 'Hello Kitty、庫洛米、大耳狗聯名周邊展示與發售，設有超大網美拍照打卡區。',
    tags: ['三麗鷗', '庫洛米', '可愛'],
    mapX: 55, mapY: 45, width: 14, height: 10,
    freebies: [
      { id: 'san-1', name: '庫洛米主題大圓扇 + 隨身鏡', type: 'fan', description: '黑紫色調酷洛米大圓扇與隨身小化妝鏡。', condition: '追蹤官方三麗鷗旗艦店並轉發活動貼文', difficulty: 'easy' }
    ]
  },
  {
    id: '6-deepspace',
    name: '戀與深空 (官方)',
    code: '6A46',
    hall: '6.1H',
    category: 'romance',
    description: '疊紙網絡超人氣3D戀愛手遊，極致奢華科技感的巨型心動空間，設有臨空市獵人體驗區與沈星迴、祁煜、黎深、秦徹等身3D投影。',
    tags: ['戀與深空', '深空', '3D乙女'],
    mapX: 35, mapY: 65, width: 45, height: 22,
    featured: true,
    freebies: [
      { id: 'ds-1', name: '臨空獵人特製手提袋 + 心動拍立得小卡', type: 'bag', description: '深色高質感不織布手提袋，配有一張精美男主拍立得風簽名卡。', condition: '出示遊戲獵人等級（高於30級）並在現場留言板留下對他的告白', difficulty: 'medium' }
    ]
  },

  // === 8.1H ===
  {
    id: '8-upspace',
    name: 'Bilibili 百大 UP 主交流區 (UP主空間)',
    code: '8A01',
    hall: '8.1H',
    category: 'creator',
    description: '與您最喜愛的知名 UP 主（如 12Dora、阿飛、王老吉等）面對面的簽名、互動與合照專區。',
    tags: ['UP主', '網紅', '簽名會'],
    mapX: 15, mapY: 20, width: 50, height: 35,
    featured: true,
    freebies: [
      { id: 'up-1', name: 'UP主簽名應援手帳本', type: 'other', description: '高品質筆記本，內含多位知名UP主印簽與插畫。', condition: '在UP主空間參與任意三位UP主的現場簽名或互動集點', difficulty: 'hard' },
      { id: 'up-2', name: '小電視經典應援發光頭箍', type: 'other', description: '在暗處會閃爍藍色光芒的小電視頭箍。', condition: '在UP主舞台大聲為現場UP主應援歡呼並拍照打卡', difficulty: 'easy' }
    ]
  },
  {
    id: '8-sony-camera',
    name: 'SONY 索尼 α 影像體驗館',
    code: '8T01',
    hall: '8.1H',
    category: 'tech',
    description: '提供索尼最新微單相機（如 A7M4、A7R5、ZV-E10）現場試用，設有專業 Coser 人像拍攝區與免費相機清潔服務。',
    tags: ['索尼', '相機', '攝影'],
    mapX: 72, mapY: 30, width: 18, height: 12,
    freebies: [
      { id: 'son-c-1', name: '索尼 G 大師鏡頭造型金屬徽章', type: 'badge', description: '精緻的 24-70 GM 鏡頭造型金屬烤漆徽章，攝影愛好者神物。', condition: '使用展台試用相機拍攝現場 Coser 並將照片導入手機分享朋友圈', difficulty: 'medium' }
    ]
  },
  {
    id: '8-canon-camera',
    name: 'Canon 佳能影像體驗區',
    code: '8T02',
    hall: '8.1H',
    category: 'tech',
    description: '佳能 EOS 系統全系體驗，提供免費相機清潔、人像光影體驗與實體照片免費列印服務。',
    tags: ['佳能', '相機', '列印'],
    mapX: 72, mapY: 50, width: 18, height: 12,
    freebies: [
      { id: 'can-c-1', name: '佳能紅圈信仰限定相機肩帶 / 實體精美打印相片', type: 'other', description: '紅圈設計的防滑減壓相機肩帶，或者您自己拍的照片的高清打印版。', condition: '現場體驗任意兩款佳能 R 系列相機，並使用佳能打印機免費列印一張照片', difficulty: 'medium' }
    ]
  },
  {
    id: '8-nikon-camera',
    name: 'Nikon 尼康創作者沙龍',
    code: '8T03',
    hall: '8.1H',
    category: 'tech',
    description: '尼康 Z 系列微單（如 Zf 復古相機、Z8）體驗，主打復古人像與街頭紀實體驗。',
    tags: ['尼康', '復古', '相機'],
    mapX: 72, mapY: 70, width: 18, height: 12,
    freebies: [
      { id: 'nik-c-1', name: '尼康黃色信仰編織帆布包', type: 'bag', description: '亮黃色運動風格帆布袋，大氣時尚。', condition: '關注尼康官方B站與小紅書，填寫一份攝影愛好者問卷', difficulty: 'easy' }
    ]
  }
];
