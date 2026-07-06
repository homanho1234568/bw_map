const fs = require('fs');

const boothsRaw = [
  // 1.1H
  { hall: '1.1H', code: '1A05', name: '多个朋友 / 奶栗兔', cat: 'creator', tag: '文创', desc: '文创周边与可爱打卡点', fb: [{n: '贴纸/照片', t: 'sticker', c: '关注社媒/拍照分享', d: 'easy'}] },
  { hall: '1.1H', code: '1A10', name: '雀巢脆脆鲨', cat: 'bazaar', tag: '零食', desc: '雀巢脆脆鲨联动展台', fb: [{n: '贴纸/试吃装/决策币', t: 'other', c: '参与游戏区互动/发社媒', d: 'medium'}] },
  { hall: '1.1H', code: '1A10-2', name: '万智牌 Magic', cat: 'tabletop', tag: '卡牌', desc: '万智牌体验区', fb: [{n: '主题文件夹及手提袋', t: 'bag', c: '打卡', d: 'easy'}] },
  { hall: '1.1H', code: '1B04', name: 'LASER&MANTA', cat: 'virtual', tag: 'Vup', desc: '虚拟偶像展区', fb: [{n: '快乐旅游袋/明信片', t: 'poster', c: '拍照打卡带话题发社媒投骰子', d: 'medium'}] },
  { hall: '1.1H', code: '1B05', name: '声罗万象工作室', cat: 'creator', tag: '广播剧', desc: '广播剧工作室展台', fb: [{n: '小象明信片', t: 'poster', c: '关注社媒', d: 'easy'}] },
  { hall: '1.1H', code: '1A-Door8', name: '森罗万象', cat: 'tabletop', tag: 'TCG', desc: 'TCG卡牌体验区', fb: [{n: 'TCG补充包/通用纸袋', t: 'card', c: '关注账号/试玩/消费', d: 'medium'}] },
  
  // 2.1H
  { hall: '2.1H', code: '2A07', name: 'VirtuaReal', cat: 'virtual', tag: 'VR', desc: 'VirtuaReal 虚拟艺人', fb: [{n: '随机风车', t: 'other', c: '乐园完成游戏挑战', d: 'medium'}] },
  { hall: '2.1H', code: '2A09', name: '中信出版 墨狸', cat: 'creator', tag: '出版', desc: '漫画出版与周边', fb: [{n: '双面纪念票根/纸头箍/明信片', t: 'poster', c: '拍摄展台带话题发社媒', d: 'easy'}] },
  { hall: '2.1H', code: '2A11', name: 'Aniplex', cat: 'model', tag: '动画', desc: 'Aniplex官方展台', fb: [{n: '光栅徽章/发带/帽子', t: 'badge', c: '完成打卡任务或消费', d: 'medium'}] },
  { hall: '2.1H', code: '2A17', name: '三月兽', cat: 'model', tag: '周边', desc: '正版周边贩售', fb: [{n: '显眼包大纸袋+吧唧盲袋', t: 'bag', c: '现场完成小任务', d: 'easy'}] },
  { hall: '2.1H', code: '2A22', name: 'TAPIOCA塔皮奥卡', cat: 'model', tag: '周边', desc: '二次元周边', fb: [{n: 'PVC透扇/亚克力挂扣', t: 'fan', c: '关注账号/发小红书', d: 'easy'}] },
  { hall: '2.1H', code: '2A24', name: 'animate', cat: 'bazaar', tag: '谷子', desc: 'animate 中国', fb: [{n: '透明贴纸', t: 'sticker', c: '购买商品或带话题发照片', d: 'easy'}] },
  { hall: '2.1H', code: '2A35', name: 'MAPPA等联合展台', cat: 'model', tag: '动画', desc: 'MAPPA、GSC等联合展位', fb: [{n: '扇子', t: 'fan', c: '拍摄照片/视频发小红书', d: 'easy'}] },
  { hall: '2.1H', code: '2A38', name: 'GuGuGuGu', cat: 'game', tag: '独立游戏', desc: '独立游戏体验', fb: [{n: '限定特典', t: 'other', c: '加入Steam心愿单或预购', d: 'easy'}] },
  { hall: '2.1H', code: '2A39', name: '布鲁可', cat: 'model', tag: '积木', desc: '布鲁可积木人', fb: [{n: '盲盒/降温好礼', t: 'other', c: '打卡发社媒', d: 'easy'}] },
  { hall: '2.1H', code: '2A40', name: 'BW2026周边贩售', cat: 'bazaar', tag: '官方', desc: '官方周边贩售区', fb: [{n: '主题明信片', t: 'poster', c: '关注账号并发打卡照片', d: 'easy'}] },
  { hall: '2.1H', code: '2A41', name: '奥飞娱乐 铠甲勇士', cat: 'model', tag: '特摄', desc: '特摄英雄周边', fb: [{n: '吧唧/色纸/立体透卡', t: 'badge', c: '集章抽奖', d: 'medium'}] },

  // 3.1H
  { hall: '3.1H', code: '3A02', name: '蔚蓝档案', cat: 'game', tag: '二次元', desc: '蔚蓝档案官方展台', fb: [{n: '车厢纪念卡/贴纸', t: 'card', c: '进入排队队列领取', d: 'easy'}] },
  { hall: '3.1H', code: '3A14', name: '索尼联合展台', cat: 'tech', tag: '索尼', desc: '索尼互娱与安尼普', fb: [{n: '鬼灭明信片/蜘蛛侠吧唧', t: 'poster', c: '完成训练任务/AI互动', d: 'medium'}] },
  { hall: '3.1H', code: '3A17', name: 'ROG 玩家国度', cat: 'tech', tag: '硬件', desc: 'ROG 顶级电竞硬件', fb: [{n: '扇子/冰凉贴', t: 'fan', c: '前100名关注天选姬', d: 'easy'}] },
  { hall: '3.1H', code: '3A19', name: 'MSI微星科技', cat: 'tech', tag: '硬件', desc: '微星硬件与PUBG、卡拉彼丘联动', fb: [{n: '魔龙姬卡牌/游戏CDK/周边', t: 'card', c: '集章、试玩、签名打卡', d: 'medium'}] },
  { hall: '3.1H', code: '3A23', name: '游卡 / 缔灵爱', cat: 'tabletop', tag: '桌游', desc: '游卡桌游等联合', fb: [{n: '透卡/文件夹/抽奖', t: 'card', c: '关注打卡', d: 'easy'}] },
  { hall: '3.1H', code: '3A24', name: 'AMD', cat: 'tech', tag: '硬件', desc: 'AMD硬件展台', fb: [{n: '限量周边', t: 'other', c: '闯关完成现场任务', d: 'medium'}] },
  { hall: '3.1H', code: '3A25', name: '少女前线2：追放', cat: 'game', tag: '二次元', desc: '少前2官方展台', fb: [{n: '番茄纸袋/打卡棒', t: 'bag', c: '关注账号/拍照打卡', d: 'easy'}] },
  { hall: '3.1H', code: '3A27', name: '威刚科技', cat: 'tech', tag: '存储', desc: '存储硬件大厂', fb: [{n: '周同学大头贴拍照', t: 'other', c: '领打卡册完成集章', d: 'medium'}] },
  { hall: '3.1H', code: '3A28', name: '战双帕弥什', cat: 'game', tag: '动作', desc: '库洛战双官方展台', fb: [{n: '大头包包/纸质杯垫', t: 'bag', c: '集章/拍照打卡', d: 'medium'}] },
  { hall: '3.1H', code: '3A29', name: '望月', cat: 'game', tag: '新游', desc: '望月手游体验', fb: [{n: '显眼包/贴纸/徽章/扇子', t: 'bag', c: '集章/集邮/试玩', d: 'medium'}] },
  { hall: '3.1H', code: '3A30', name: '明日方舟终末地', cat: 'game', tag: '新游', desc: '鹰角终末地试玩', fb: [{n: '主题手提袋', t: 'bag', c: '参与互动/拍照带TAG', d: 'easy'}] },
  { hall: '3.1H', code: '3A33', name: '崩坏：星穹铁道', cat: 'game', tag: '星铁', desc: '星铁官方展台', fb: [{n: '明信片', t: 'poster', c: '参与现场互动打卡', d: 'easy'}] },
  { hall: '3.1H', code: '3A36', name: '死亡搁浅2', cat: 'game', tag: '单机', desc: '小岛工作室', fb: [{n: '转印贴/贴纸/明信片', t: 'sticker', c: '试玩/分享社媒/加心愿单', d: 'medium'}] },

  // 4.1H
  { hall: '4.1H', code: '4A04', name: '潜水员戴夫', cat: 'game', tag: '独立游戏', desc: '休闲捕鱼经营', fb: [{n: '鱿鱼玩偶', t: 'other', c: '到场参与小游戏', d: 'medium'}] },
  { hall: '4.1H', code: '4A08', name: '铭瑄科技', cat: 'tech', tag: '硬件', desc: '板卡厂商', fb: [{n: '伴手礼/抽奖', t: 'other', c: '关注并互动集章', d: 'easy'}] },
  { hall: '4.1H', code: '4A09', name: 'HyperX', cat: 'tech', tag: '外设', desc: '电竞外设', fb: [{n: '限定贴纸/周边', t: 'sticker', c: '关注打卡/通关任务', d: 'medium'}] },
  { hall: '4.1H', code: '4A16', name: '女神异闻录4 Revival', cat: 'game', tag: 'RPG', desc: 'P4R 体验展台', fb: [{n: '徽章/亚克力打卡棒/大痛包', t: 'bag', c: '试玩/加心愿单/集章', d: 'medium'}] },
  { hall: '4.1H', code: '4A19', name: '雷神 机械师', cat: 'tech', tag: '整机', desc: '电竞整机与笔记本', fb: [{n: '零食/限定周边', t: 'other', c: '打卡/闯关互动', d: 'medium'}] },
  { hall: '4.1H', code: '4A24', name: '星塔旅人', cat: 'game', tag: '手游', desc: '手游展位', fb: [{n: '补给礼包/抽奖', t: 'other', c: '扫屏抽奖/Coser巡游', d: 'easy'}] },
  { hall: '4.1H', code: '4A25', name: 'rejet', cat: 'romance', tag: '乙女', desc: '女性向企划', fb: [{n: '珠光卡邮票', t: 'card', c: '消费+关注发送打卡内容', d: 'medium'}] },
  { hall: '4.1H', code: '4A27', name: '幻兽帕鲁', cat: 'game', tag: '沙盒', desc: '人气沙盒生存', fb: [{n: '限量纸袋/抽奖周边', t: 'bag', c: '完成打卡任务', d: 'easy'}] },
  { hall: '4.1H', code: '4A30', name: '蓝色星原：旅谣', cat: 'game', tag: '新游', desc: '二次元新游', fb: [{n: '菜鸡大包/明信片/奇波卡', t: 'bag', c: '预约关注/拍照打卡/小游戏', d: 'medium'}] },
  { hall: '4.1H', code: '4A32', name: '闪耀吧！噜咪', cat: 'game', tag: '手游', desc: '手游互动', fb: [{n: '透扇/徽章', t: 'badge', c: '关注/猜拳/拍照', d: 'easy'}] },
  { hall: '4.1H', code: '4A33', name: 'Visinger', cat: 'game', tag: '音游', desc: '音游区', fb: [{n: '限定无料', t: 'other', c: '舞台游戏/音游试玩', d: 'medium'}] },
  { hall: '4.1H', code: '4A34', name: '粒粒的小人国', cat: 'bazaar', tag: '周边', desc: '创意周边', fb: [{n: '场景卡贴纸/纸袋', t: 'sticker', c: '量身高体验', d: 'easy'}] },
  { hall: '4.1H', code: '4A35', name: '逃离鸭科夫', cat: 'game', tag: '搞怪', desc: '趣味体验', fb: [{n: '鸭鸭贴纸/立牌', t: 'other', c: '健身道具打卡/试玩10分钟', d: 'medium'}] },
  { hall: '4.1H', code: '4A36', name: '三国火凤燎原', cat: 'game', tag: '漫改', desc: '漫改手游', fb: [{n: '燎原火背包/貂蝉透扇/吧唧', t: 'bag', c: '打卡/试玩/填问卷', d: 'medium'}] },
  { hall: '4.1H', code: '4A37', name: '物华弥新/闪耀优俊少女', cat: 'game', tag: '二次元', desc: '热门二次元游戏', fb: [{n: '镭射票/限定绶带/书签', t: 'card', c: '关注/沙盘模拟/答题', d: 'medium'}] },
  { hall: '4.1H', code: '4A38', name: 'Bang Dream', cat: 'game', tag: '音游', desc: '邦邦音游', fb: [{n: '邮票组/票夹/明信片', t: 'card', c: '关注/完成舞台挑战/拍照', d: 'medium'}] },
  { hall: '4.1H', code: '4A39', name: '初音未来：缤纷舞台', cat: 'game', tag: '音游', desc: '啤酒烧烤音游', fb: [{n: '集章卡/夏日透卡', t: 'card', c: '关注/合影打卡', d: 'easy'}] },
  { hall: '4.1H', code: '4A40', name: 'bilibili社区守护者', cat: 'bazaar', tag: '社区', desc: 'B站社区活动', fb: [{n: '定制冰箱贴/妙评吧唧', t: 'badge', c: '分类挑战/写妙评', d: 'easy'}] },
  { hall: '4.1H', code: '4A42', name: '碧蓝航线', cat: 'game', tag: '二次元', desc: '碧蓝官方展区', fb: [{n: '超大斜挎包/指挥官面具', t: 'bag', c: '关注/拍摄气模', d: 'easy'}] },
  { hall: '4.1H', code: '4A43', name: 'FGO', cat: 'game', tag: '卡牌', desc: 'FGO国服展台', fb: [{n: '随机角色卡贴', t: 'card', c: '拍摄打卡发社媒', d: 'easy'}] },
  { hall: '4.1H', code: '4A44', name: 'BILIBILI游戏', cat: 'game', tag: '发行', desc: 'B站游戏区', fb: [{n: '随机镭射票', t: 'card', c: '关注并试玩5分钟', d: 'medium'}] },
  { hall: '4.1H', code: '4A45', name: '三角洲行动', cat: 'game', tag: '射击', desc: 'FPS大作', fb: [{n: '行动手册/作战背包', t: 'bag', c: '领取任务', d: 'easy'}] },
  { hall: '4.1H', code: '4A47', name: '凡应游戏', cat: 'game', tag: '新游', desc: '新游展示', fb: [{n: '超大纸袋/鼠标垫', t: 'bag', c: '打卡/体验5min', d: 'easy'}] },

  // 5.1H
  { hall: '5.1H', code: '5A01', name: '荷美尔', cat: 'bazaar', tag: '食品', desc: '绝区零联名活动', fb: [{n: '联名周边/角色透扇', t: 'fan', c: '现场互动抽奖', d: 'medium'}] },
  { hall: '5.1H', code: '5A03', name: '统一冰红茶', cat: 'bazaar', tag: '饮料', desc: '国漫联名展示', fb: [{n: '无料礼品/饮料', t: 'other', c: '集章游戏', d: 'medium'}] },
  { hall: '5.1H', code: '5A05', name: '魔方工作室', cat: 'game', tag: '腾讯', desc: '火影等腾讯游戏', fb: [{n: '透扇/抽奖福利', t: 'fan', c: '完成地图/关注公众号', d: 'easy'}] },
  { hall: '5.1H', code: '5A06', name: '无限暖暖', cat: 'game', tag: '换装', desc: '叠纸新游', fb: [{n: '施工纸袋/纸夹透卡', t: 'bag', c: '关注社媒/拍摄打卡', d: 'easy'}] },
  { hall: '5.1H', code: '5A11', name: '洛克王国', cat: 'game', tag: '童年', desc: '经典IP复刻', fb: [{n: '超大编织袋/行李牌/镭射票', t: 'bag', c: '扫码关注/集章抽奖', d: 'medium'}] },
  { hall: '5.1H', code: '5A12', name: '永劫无间', cat: 'game', tag: '竞技', desc: '冷兵器吃鸡', fb: [{n: '刮刮卡/金钞兑换券', t: 'card', c: '到场打卡/拾取', d: 'easy'}] },
  { hall: '5.1H', code: '5A13', name: '异环', cat: 'game', tag: '新游', desc: '幻塔工作室新游', fb: [{n: '团扇/角色透卡/周边', t: 'fan', c: '关注/拍照打卡/集章', d: 'medium'}] },
  { hall: '5.1H', code: '5A17', name: '第五人格', cat: 'game', tag: '非对称', desc: '网易第五人格', fb: [{n: '精美无料/抽奖', t: 'other', c: '打卡拍照/集印记', d: 'medium'}] },
  { hall: '5.1H', code: '5A18', name: '绿梦：时空之声', cat: 'game', tag: '新游', desc: '新游试玩', fb: [{n: '扇子/吧唧/收纳袋', t: 'fan', c: '完成行动/大冒险/试玩', d: 'medium'}] },
  { hall: '5.1H', code: '5A19', name: '遗忘之海', cat: 'game', tag: '新游', desc: '新游互动', fb: [{n: '礼品袋/周边抽奖', t: 'bag', c: '领任务卡/集印记', d: 'medium'}] },
  { hall: '5.1H', code: '5A20', name: '时空中的绘旅人', cat: 'romance', tag: '乙女', desc: '网易乙女向游戏', fb: [{n: '限定无料礼包', t: 'bag', c: '完成打卡任务', d: 'easy'}] },
  { hall: '5.1H', code: '5A22', name: 'VProject', cat: 'virtual', tag: '企划', desc: 'VProject 展区', fb: [{n: '纸袋/透扇/小卡', t: 'card', c: '预约/关注/带话题发文', d: 'medium'}] },
  { hall: '5.1H', code: '5A23', name: '麒麟冰结', cat: 'bazaar', tag: '饮料', desc: '果酒饮料展区', fb: [{n: '扭蛋奖励', t: 'other', c: '挑战游戏集章', d: 'medium'}] },
  { hall: '5.1H', code: '5A26', name: 'manli万丽显卡', cat: 'tech', tag: '硬件', desc: '板卡厂商', fb: [{n: '限定吧唧/宝拉周边', t: 'badge', c: '发图文/集章', d: 'medium'}] },
  { hall: '5.1H', code: '5A34', name: '以闪亮之名', cat: 'game', tag: '女性向', desc: '换装游戏', fb: [{n: '高颜值限定无料', t: 'other', c: '现场打卡', d: 'easy'}] },
  { hall: '5.1H', code: '5A37', name: '原神', cat: 'game', tag: '米哈游', desc: '原神官方展区', fb: [{n: '收藏卡/特调饮品', t: 'card', c: '参与打卡/小游戏', d: 'medium'}] },
  { hall: '5.1H', code: '5A38', name: '腾讯游戏/盛世天下', cat: 'game', tag: '大厂', desc: '王者等联合展区', fb: [{n: '专属无料/扇子/支架', t: 'fan', c: '打卡/互动', d: 'easy'}] },

  // 6.1H
  { hall: '6.1H', code: '6A01', name: '万漫社', cat: 'creator', tag: '漫画', desc: '漫画社群与周边', fb: [{n: '明信片/限定周边', t: 'poster', c: '打卡/消费', d: 'medium'}] },
  { hall: '6.1H', code: '6A04', name: '牧神记', cat: 'creator', tag: 'IP', desc: '动画IP展区', fb: [{n: '限定馆藏礼', t: 'other', c: '参与集章', d: 'easy'}] },
  { hall: '6.1H', code: '6A05', name: '天官赐福', cat: 'romance', tag: 'IP', desc: '动画官方展台', fb: [{n: '缘笺/随机周边', t: 'other', c: '关注打卡', d: 'easy'}] },
  { hall: '6.1H', code: '6A13', name: '凡人修仙传', cat: 'creator', tag: 'IP', desc: '国漫IP', fb: [{n: '解锁奖励', t: 'other', c: '参与互动', d: 'easy'}] },
  { hall: '6.1H', code: '6A17', name: '猪猪侠', cat: 'creator', tag: '童年', desc: '经典动画IP', fb: [{n: '对错扇子/徽章/背包', t: 'bag', c: '关注/拍照打卡', d: 'medium'}] },
  { hall: '6.1H', code: '6A22', name: '广博文创', cat: 'bazaar', tag: '文具', desc: '文创商品', fb: [{n: '无料扇子/明信片', t: 'fan', c: '关注/转发', d: 'easy'}] },
  { hall: '6.1H', code: '6A28', name: '第五人格/森罗万象等', cat: 'bazaar', tag: '综合', desc: '综合周边展位', fb: [{n: '手幅/打卡套组', t: 'other', c: '消费打卡', d: 'medium'}] },
  { hall: '6.1H', code: '6A30', name: '罗森 LAWSON', cat: 'bazaar', tag: '便利店', desc: '罗森 BW 联动', fb: [{n: '亿亿酱限定纪念礼', t: 'other', c: '现场打卡', d: 'easy'}] },
  { hall: '6.1H', code: '6A31', name: '玩乐主义', cat: 'model', tag: '盲盒', desc: '潮玩模型', fb: [{n: '随机IP周边', t: 'other', c: '关注加好友', d: 'easy'}] },
  { hall: '6.1H', code: '6A32', name: '航海王', cat: 'model', tag: '海贼王', desc: '航海王主题展区', fb: [{n: '无料周边', t: 'other', c: '拍照打卡', d: 'easy'}] },
  { hall: '6.1H', code: '6A33', name: '另物萌/古剑奇谈', cat: 'creator', tag: 'IP', desc: '联合展区', fb: [{n: '明信片', t: 'poster', c: '关注/出示愿望单', d: 'easy'}] },
  { hall: '6.1H', code: '6A34', name: '名创优品', cat: 'bazaar', tag: '百货', desc: '名创优品展区', fb: [{n: '鸡蛋公仔/编织购物袋', t: 'bag', c: '关注发合照', d: 'medium'}] },
  { hall: '6.1H', code: '6A36', name: '阅文好物', cat: 'bazaar', tag: '小说', desc: '阅文IP周边', fb: [{n: '专属无料/透卡/帆布袋', t: 'bag', c: '互动/发帖', d: 'medium'}] },
  { hall: '6.1H', code: '6A37', name: '小马宝莉', cat: 'bazaar', tag: 'IP', desc: '小马宝莉展区', fb: [{n: '软萌可爱无料', t: 'other', c: '打卡', d: 'easy'}] },
  { hall: '6.1H', code: '6A38', name: '三丽鸥', cat: 'bazaar', tag: '可爱', desc: '三丽鸥展区', fb: [{n: '限定无料', t: 'other', c: '打卡', d: 'easy'}] },
  { hall: '6.1H', code: '6A39', name: '左手上篮', cat: 'creator', tag: '国漫', desc: '国漫IP', fb: [{n: '抽奖机会', t: 'other', c: '集章', d: 'medium'}] },
  { hall: '6.1H', code: '6A41', name: '适乐肤', cat: 'bazaar', tag: '护肤', desc: '联动展区', fb: [{n: '限定周边', t: 'other', c: 'Coser互动打卡', d: 'easy'}] },
  { hall: '6.1H', code: '6A43', name: '玩点无限', cat: 'model', tag: '潮玩', desc: '潮玩周边', fb: [{n: '限定小礼品', t: 'other', c: '打卡', d: 'easy'}] },
  { hall: '6.1H', code: '6A50', name: '大会员签到', cat: 'bazaar', tag: 'B站', desc: 'B站大会员专区', fb: [{n: '纪念袋/探索指南', t: 'bag', c: '出示大会员身份', d: 'easy'}] },
  { hall: '6.1H', code: '6A51', name: 'bilibili漫画', cat: 'creator', tag: '漫画', desc: 'B漫展台', fb: [{n: '亚克力萌粒/谷美框', t: 'other', c: '发话题/核销凭证', d: 'medium'}] },

  // 8.1H
  { hall: '8.1H', code: '8A01', name: '神牛 godox', cat: 'tech', tag: '灯光', desc: '摄影灯光器材', fb: [{n: '神牛刮刮乐', t: 'card', c: '现场互动', d: 'easy'}] },
  { hall: '8.1H', code: '8A02', name: '艾蒙拉 Amaran', cat: 'tech', tag: '灯光', desc: '专业灯光', fb: [{n: '编织袋/抽奖', t: 'bag', c: '关注填问卷/发照片', d: 'medium'}] },
  { hall: '8.1H', code: '8A04', name: '唯卓仕 viltrox', cat: 'tech', tag: '镜头', desc: '相机镜头', fb: [{n: '大编织袋/打卡镜', t: 'bag', c: '关注小红书发帖', d: 'medium'}] },
  { hall: '8.1H', code: '8A05', name: '松下 Panasonic', cat: 'tech', tag: '相机', desc: '松下相机体验', fb: [{n: '抽奖福利', t: 'other', c: '发布现场照片带话题', d: 'medium'}] },
  { hall: '8.1H', code: '8A10', name: '尼康 Nikon', cat: 'tech', tag: '相机', desc: '尼康影像', fb: [{n: '集章扇/显眼包/扭蛋', t: 'other', c: '拍照上传/体验产品/集章', d: 'hard'}] }
];

let generatedBooths = '';

let boothIdCounter = 1;
for (const b of boothsRaw) {
  const mapX = Math.floor(Math.random() * 80) + 10;
  const mapY = Math.floor(Math.random() * 70) + 10;
  
  const fbs = b.fb.map((f, i) => {
    return `      { id: 'f_${boothIdCounter}_${i}', name: '${f.n}', type: '${f.t}', description: 'BW2026 现场领取的无料', condition: '${f.c}', difficulty: '${f.d}' }`;
  }).join(',\n');
  
  generatedBooths += `
  {
    id: 'b_${boothIdCounter}',
    name: '${b.name}',
    code: '${b.code}',
    hall: '${b.hall}',
    category: '${b.cat}',
    description: '${b.desc}',
    tags: ['${b.tag}'],
    mapX: ${mapX}, mapY: ${mapY}, width: 15, height: 10,
    freebies: [
${fbs}
    ]
  },`;
  boothIdCounter++;
}

// Generate the final content for data.ts
const dataContent = `export interface Freebie {
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
  code: string;
  hall: string;
  category: 'game' | 'virtual' | 'model' | 'tabletop' | 'creator' | 'bazaar' | 'romance' | 'tech';
  description: string;
  tags: string[];
  freebies: Freebie[];
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
  { id: '1.1H', name: '1.1H 馆', theme: '梦幻集市 / 一起桌游 / 恋恋心声', color: 'text-pink-500', bgGrad: 'from-pink-500/10 to-purple-500/10', description: '聚集热门女性向游戏、创作者摊位、大型桌游厂牌与广播剧配音专区。' },
  { id: '2.1H', name: '2.1H 馆', theme: '虚拟乐园 / 模玩英雄', color: 'text-emerald-500', bgGrad: 'from-emerald-500/10 to-teal-500/10', description: '虚拟主播、VTuber 交流专区，以及顶尖模型、手办与周边贩售展位。' },
  { id: '3.1H', name: '3.1H 馆', theme: '游戏世界 (冒险前线)', color: 'text-blue-500', bgGrad: 'from-blue-500/10 to-indigo-500/10', description: '云集《崩坏：星穹铁道》、《鸣潮》、《明日方舟》及各大电竞与主机硬体巨头。' },
  { id: '4.1H', name: '4.1H 馆', theme: '游戏世界 (奇幻冒险)', color: 'text-cyan-500', bgGrad: 'from-cyan-500/10 to-blue-500/10', description: '主打《黑神话：悟空》、《Fate/Grand Order》、《Cygames》及各大热门动作、独立游戏。' },
  { id: '5.1H', name: '5.1H 馆', theme: '游戏世界 (不熄幻境)', color: 'text-violet-500', bgGrad: 'from-violet-500/10 to-fuchsia-500/10', description: '涵盖《原神》、《无限暖暖》、《第五人格》、《时空中的绘旅人》等顶级大作与开放世界。' },
  { id: '6.1H', name: '6.1H 馆', theme: '不止动画', color: 'text-red-500', bgGrad: 'from-red-500/10 to-orange-500/10', description: '动漫爱好者的天堂！包含 Bilibili 会员购、各大知名 IP（三丽鸥、名创优品、木棉花、罗森）与大型舞台。' },
  { id: '8.1H', name: '8.1H 馆', theme: 'UP主空间 / 大饱眼福', color: 'text-amber-500', bgGrad: 'from-amber-500/10 to-yellow-500/10', description: '百大 UP 主现场见面会与创作者交流空间，同时配备顶级摄影器材体验区（索尼、佳能、尼康）。' }
];

export const BOOTHS: Booth[] = [${generatedBooths}
];
`;

fs.writeFileSync('./src/data.ts', dataContent, 'utf8');
console.log('Successfully updated src/data.ts with all booths!');
