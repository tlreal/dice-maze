// ─── 《骰运迷城》三幕全量剧情 ───────────────────────────────────────
// 暗线：fragment=英雄残章 granny=炉火婆婆 banjo=骷髅诗人 side=支线 main=主线锚点
// 文本标记：**金色高亮**，#开头的段落（不进入正文）暂不使用。
import type { EndingDef, SceneNode } from '../game/types'

export const SCENES: Record<string, SceneNode> = {
  // ══════════════════════ 第一幕：烬痕镇与迷城之门 ══════════════════════
  a1_open: {
    id: 'a1_open', act: 1, thread: 'main', fixed: true, title: '炉火与骰子酒馆', bg: 'tavern',
    text: [
      '乌云压在**烬痕镇**的钟楼上，像一顶不肯摘下的丧帽。今天，是百年一度的「醒城日」。',
      '推开「炉火与骰子」酒馆的门，暖风裹着麦酒味扑面而来。壁炉后面挂着一张褪色的画像：一个持剑的男人，笑得没心没肺。画像下有一行小字——**「百年前下去的那个人」**。',
      '炉火婆婆头也不抬，把一册厚厚的登记簿推到你面前。「名字。」她说，「签了字，明早之前你还有反悔的机会。哦，反悔的都活到了现在。」',
    ],
    choices: [
      {
        id: 'ask', text: '「婆婆，画像上的人是谁？」',
        outcome: {
          text: '婆婆拨火的手停了半拍。「**我爹。**」她把拨火棍搁回架上，「百年前他下去封了那东西，没回来。画像是我画的——我记不清他的脸了，就照着我自己的下巴画的。」她自嘲地笑笑，转回身，「签不签？」',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'granny_asked' }],
          goto: { to: 'a1_sign' },
        },
      },
      {
        id: 'sign', text: '沉默地签下名字',
        outcome: {
          text: '你签了字。婆婆合上登记簿，掂了掂它的厚度。「今年到你是**第七个**。」她说，「前六个的名字，我明天就得描黑。」',
          goto: { to: 'a1_sign' },
        },
      },
      {
        id: 'listen', text: '竖起耳朵听酒馆里的传闻（察觉检定）',
        check: { skill: 'perception', dc: 11 },
        success: {
          text: '你捕捉到邻桌老人的低语：「……下去的人要交一段记忆当门票。**前年那个骑士，忘了自己女儿的长相，上来之后抱着马哭了三天。**」你默默记下：迷城会拿走你珍视的东西。',
          effects: [{ t: 'flag', id: 'knows_price' }],
          goto: { to: 'a1_sign' },
        },
        failure: {
          text: '你只听见醉汉在争论猪肘子的咸淡。有个词反复飘过来——「门票」。什么门票？',
          goto: { to: 'a1_sign' },
        },
      },
    ],
  },
  a1_sign: {
    id: 'a1_sign', act: 1, thread: 'main', fixed: true, title: '百年契约', bg: 'tavern',
    text: [
      '后半夜，酒馆只剩你们这些签了字的人。婆婆端来一只黑铁碗，碗里是**不冒烟的火**。',
      '「规矩说给你们听。」她的声音很平，「迷城只收一种门票：**一段你最舍不得的记忆**。它烧掉什么，我说了不算，你说了算——伸手，心里想着那段，别松手。」',
      '火光映着每个人的脸。轮到你了。',
    ],
    choices: [
      {
        id: 'snow', text: '想起童年初雪——那年有人牵着你走了一路',
        grantsInspiration: true,
        outcome: {
          text: '雪花落在掌心的凉意、呼出的白气、那只包着你小手的粗糙手掌……火焰「啵」地一声吞掉了它们。你现在**知道**下过雪，却再也想不起那天为什么笑得那么开心。',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'mem_snow' }, { t: 'inspiration' }],
          goto: { to: 'a1_memory_done' },
        },
      },
      {
        id: 'win', text: '想起第一场胜利——众人欢呼着喊出你的名字',
        grantsInspiration: true,
        outcome: {
          text: '竞技场的沙尘、举起的手臂、潮水一样的欢呼……火焰卷走它们时，你听见自己的名字在记忆里**被抹成了空白**。奇怪，你现在甚至记不清自己为什么开始冒险。',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'mem_win' }, { t: 'inspiration' }],
          goto: { to: 'a1_memory_done' },
        },
      },
      {
        id: 'face', text: '想起某个人的侧脸——你不打算告诉任何人是谁',
        grantsInspiration: true,
        outcome: {
          text: '黄昏的光斜切过那张脸，睫毛、唇角、欲言又止的神情……火舌卷过，**五官先模糊，然后是轮廓，最后连「重要」这个感觉都变得像别人的事**。你攥紧了拳头，指甲掐进肉里才没出声。',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'mem_face' }, { t: 'inspiration' }],
          goto: { to: 'a1_memory_done' },
        },
      },
    ],
  },
  a1_memory_done: {
    id: 'a1_memory_done', act: 1, thread: 'main', fixed: true, title: '启程', bg: 'tavern',
    text: [
      '天没亮，婆婆在门口挨个塞给每人一小袋干粮。「记住三件事，」她竖起三根手指，「**烬疫吃记忆，火光骗人，别信任何说认识你的人。**」',
      '她看着你们下山的背影，最后那句嘱咐轻得像自言自语——「要是……要是你们见到一个下巴像我的人……」',
      '晨雾里，迷城之门在镇子尽头张开，像一道竖着的伤口。',
    ],
    choices: [
      { id: 'go', text: '出发', outcome: { text: '你踏进了晨雾。', goto: { to: 'POOL' } } },
    ],
  },
  // ── 第一幕随机池 ──
  a1_banjo_intro: {
    id: 'a1_banjo_intro', act: 1, thread: 'banjo', fixed: false, title: '跑调的骨头', bg: 'tavern',
    text: [
      '街角，一只骷髅抱着断了一根弦的鲁特琴，正被酒馆伙计往外推：「镇上死人不许卖艺！这是规矩！」',
      '骷髅不恼，还鞠了个躬，下颌骨差点掉下来。「**先生女士们，这可是歧视。**」他冲围观的人挤了挤空空的眼窝，「来点赏钱吧，我唱的歌啊，比这座镇子岁数都大。」',
      '有人认出他：「这是**班卓**，镇上的老疯子，说什么自己『下来过』……」',
    ],
    choices: [
      {
        id: 'help', text: '替他付了「卖艺税」，顺便点一首歌',
        cost: { gold: 5 },
        grantsInspiration: true,
        outcome: {
          text: '班卓的琴声意外地好。他唱的是一支老歌谣：*「火焰记得每个名字，名字记得回家的路……」*唱到一半他忽然停了，凑近你，压低声音：「骨头记得的事，比心多。**你若在下面见到一个下巴很硬的男人，替我带句话——歌还没唱完。**」',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'banjo_met' }, { t: 'flag', id: 'banjo_friendly' }, { t: 'inspiration' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      {
        id: 'sleight', text: '趁乱翻翻他琴箱里夹着什么（巧手检定）',
        check: { skill: 'sleight', dc: 12 },
        success: {
          text: '你摸到一页折得极旧的纸——**百年前冒险小队的合影拓印**。五个人，最左边那个抱着琴的骷髅……和班卓一模一样。最中间的男人，下巴很硬。你把纸塞回去，班卓似乎没察觉，但琴声轻了一下。',
          effects: [{ t: 'flag', id: 'banjo_met' }, { t: 'flag', id: 'banjo_photo_seen' }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '你的手指刚碰到琴箱，一根弦「铮」地断了。班卓头也不回：「**偷艺人的东西，会被歌谣诅咒哦。**」你讪讪收手。周围人哄笑起来。',
          effects: [{ t: 'flag', id: 'banjo_met' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      { id: 'ignore', text: '径直走开', outcome: { text: '身后琴声又响起来，跑调，但固执。', effects: [{ t: 'flag', id: 'banjo_met' }], goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a1_well: {
    id: 'a1_well', act: 1, thread: 'side', fixed: false, title: '会说话的井', bg: 'gate',
    text: [
      '镇口的古井咕嘟咕嘟冒着热水。你路过时，井里的声音叫住了你——用的居然是**你母亲哄你睡觉的语调**。',
      '「下来呀，」井水轻轻拍着井壁，「下面暖和。下面什么都不用记得。」',
    ],
    choices: [
      {
        id: 'perception', text: '趴在井沿，分辨声音的真伪（察觉检定）',
        check: { skill: 'perception', dc: 12 },
        success: {
          text: '你听出来了：那声音在**模仿**。它把你白天说过的话、路人的咳嗽、婆婆拨火的节奏全都揉在一起，织成一个「熟得吓人」的嗓音。烬疫的触手已经伸进镇子了。你向镇卫兵举报，顺手捞了点谢礼。',
          effects: [{ t: 'gold', v: 10 }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '那语调熟悉得让你眼眶发热，你俯身再看——井水里的倒影**冲你笑了一下**。你踉跄后退，后脑勺磕在井沿上，眼前发黑。',
          effects: [{ t: 'hp', v: -2 }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      { id: 'leave', text: '捂住耳朵快步离开', outcome: { text: '那声音在你背后渐渐扭曲，最后变成婴儿的啼哭。你走得更急了。', goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a1_beggar: {
    id: 'a1_beggar', act: 1, thread: 'side', fixed: false, title: '六指的乞丐', bg: 'gate',
    text: [
      '一个乞丐拦住你，碗里的硬币码得整整齐齐。「勇士大人，赏一点吧，我孙子在等饭吃。」他的袖口露出**六根手指**。',
      '醒城日的镇子，遍地都是「需要帮助」的人。可六指不是人该有的。',
    ],
    choices: [
      {
        id: 'insight', text: '盯着他的眼睛，看穿把戏（洞悉检定）',
        check: { skill: 'insight', dc: 11 },
        success: {
          text: '他眼神飘向巷口——那里有个同伙正数着今天的「收成」。你一把攥住他第六根手指：**冰凉的，是蜡**。扒开外衣，他腰间挂着三只不同的钱包。小偷认栽，赔了你「赃款分成」。',
          effects: [{ t: 'gold', v: 15 }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '他哭得涕泪横流，孙子说得有鼻子有眼。你摸出两枚金币，他千恩万谢地走了——走出十步，**腰板忽然挺直了**，闪进巷子没影了。周围传来憋不住的窃笑。',
          effects: [{ t: 'gold', v: -8 }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      {
        id: 'intimidate', text: '把剑拍在他碗旁边',
        check: { skill: 'intimidation', dc: 10 },
        success: {
          text: '「铜板、银币、还有那根蜡手指，」你轻声说，「留下，滚。」乞丐的脸以肉眼可见的速度垮下去，掏空了碗底的家当。镇口安静得能听见钟楼滴答。',
          effects: [{ t: 'gold', v: 12 }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '他嚎得比你还大声：「打人啦——勇士欺负残废啦——！」半个镇子的人探出头来。你只能塞钱消灾，落荒而逃。',
          effects: [{ t: 'gold', v: -5 }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      { id: 'give', text: '给点钱，不多问', cost: { gold: 3 }, outcome: { text: '他接钱的手很稳，稳得不像乞丐。算了，醒城日，大家都难。', effects: [{ t: 'gold', v: -3 }], goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a1_shrine: {
    id: 'a1_shrine', act: 1, thread: 'side', fixed: false, title: '路边神龛', bg: 'shrine',
    text: [
      '出镇的路边有座巴掌大的石龛，供着一位**没有脸的神像**——脸的位置被百年烟火熏得只剩一片温润的模糊。',
      '龛前的签筒里插着一支竹签，签文被风掀起来：「**下去的人，回来的路靠自己记。**」',
    ],
    choices: [
      {
        id: 'pray', text: '虔诚祈祷（宗教检定）',
        check: { skill: 'religion', dc: 11 },
        success: {
          text: '你在无脸神像前静坐片刻，忽然明白：这不是神像，是**一块被摸了百年的界碑**——每个下去的人都摸过它。无数掌心的温度里，你借到了一点笃定。',
          effects: [{ t: 'inspiration' }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '你祷词念到一半忘了词。神像沉默着。风吹过签筒，那支竹签转了个圈——签文背面还有半句：「**……忘了词也没关系。**」你笑了笑，起身赶路。',
          goto: { to: 'NEXT_POOL' },
        },
      },
      { id: 'coin', text: '投一枚金币', cost: { gold: 1 }, outcome: { text: '金币落进功德箱，叮的一声。你总觉得那声「叮」……回音长了点，像是从地底传上来的应答。', effects: [{ t: 'gold', v: -1 }], goto: { to: 'NEXT_POOL' } } },
      { id: 'pass', text: '不停留', outcome: { text: '你路过神龛。无脸的神目送你，用一片模糊。', goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a1_lostcart: {
    id: 'a1_lostcart', act: 1, thread: 'side', fixed: false, title: '商队残骸', bg: 'gate',
    text: [
      '半山腰，一辆商车翻在沟里，货物撒了一地。车夫俯卧在车辕边——已经没气了，可他**手里还死死攥着一支拨浪鼓**。',
      '乌鸦在头顶盘旋，等着你们让开位置。',
    ],
    choices: [
      {
        id: 'bury', text: '把车夫安葬，拨浪鼓放在坟头',
        grantsInspiration: true,
        outcome: {
          text: '你用剑和手，在冻土上挖出一个像样的墓穴。放下拨浪鼓的时候，你听见山谷的风声温柔了一瞬。**有些事不产生收益，但你记得自己做过。**（乌鸦不满地飞走了）',
          fx: 'heal',
          effects: [{ t: 'inspiration' }, { t: 'item', id: 'luckydie' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      {
        id: 'loot', text: '搜刮货物（生存检定：判断哪些还能用）',
        check: { skill: 'survival', dc: 11 },
        success: {
          text: '你分辨出受潮的和完好的：两瓶治疗药水、一小袋银币，都在腐坏前救了回来。死人不介意，你想。',
          effects: [{ t: 'item', id: 'potion', count: 2 }, { t: 'gold', v: 15 }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '你抱着一只木箱用力一拽——**整辆车轰然侧翻**，你被车辕扫中肩膀，货物大多摔进了泥水。只在泥里摸出几枚还能看清面额的铜板。',
          fx: 'hurt',
          effects: [{ t: 'hp', v: -3 }, { t: 'gold', v: 5 }],
          goto: { to: 'NEXT_POOL' },
        },
      },
    ],
  },
  a1_ghost_child: {
    id: 'a1_ghost_child', act: 1, thread: 'granny', fixed: false, title: '带路的孩子', bg: 'corridor',
    text: [
      '迷城外围的甬道里，一个五六岁的小孩坐在石头上踢着腿，看见你，眼睛亮了：「**哥哥/姐姐也是来找爸爸的吗？**」',
      '近了你看清：他的脚没有沾地，衣角在**没有风的地方**飘着。',
    ],
    choices: [
      {
        id: 'religion', text: '为他诵一段安魂经（宗教检定）',
        check: { skill: 'religion', dc: 12 },
        success: {
          text: '经文念完，孩子的轮廓透出暖光。他忽然想起什么似的，认真地说：「**火炉边的婆婆在等她爸爸。她把围裙都洗好了。**你要是见到她爸爸……不对，他认不出围裙了呀。」他皱着眉想不通，最后化成一片安静的光屑。你记住了这句话——婆婆的围裙。',
          fx: 'heal',
          effects: [{ t: 'flag', id: 'granny_apron' }, { t: 'inspiration' }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '你的经文磕磕绊绊。孩子听完，歪着头：「你也不记得回家的路了吗？」然后他指着深处，自己慢慢淡掉了，最后只剩一个指路的方向。**深处。**',
          goto: { to: 'NEXT_POOL' },
        },
      },
      {
        id: 'medicine', text: '检查他身上的旧伤（医药检定）',
        check: { skill: 'medicine', dc: 12 },
        success: {
          text: '你懂伤口。你看出他是「睡着」之后才被放进这里的——致命伤在后脑，很旧，是百年前的兵刃。你把这个判断轻声告诉他，他松了口气：「那就不是我的错了。」他化作光屑前，塞给你一枚他攥了百年的**幸运骰**。',
          fx: 'heal',
          effects: [{ t: 'item', id: 'luckydie' }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '你翻检半天也看不真切——幽灵的伤口像隔着毛玻璃。孩子等你等得困了，打了个哈欠，散成雾。',
          goto: { to: 'NEXT_POOL' },
        },
      },
      { id: 'run', text: '不敢多留，快步通过', outcome: { text: '你绕开他。走出很远，还听见背后小小的声音：「路上小心呀——」', goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a1_gamblers: {
    id: 'a1_gamblers', act: 1, thread: 'side', fixed: false, title: '地精赌档', bg: 'corridor',
    text: [
      '一盏昏灯，一块木板，三只地精围坐着骰盅吆五喝六。看见你，最大的那只地精咧嘴一笑：「**勇士也来一把？迷城的运气，上来先试试才踏实。**」',
      '骰盅里的骰子碰得哗哗响。你注意到其中一只地精的袖口，鼓鼓囊囊。',
    ],
    choices: [
      {
        id: 'insight', text: '看穿他们的老千（洞悉检定）',
        check: { skill: 'insight', dc: 13 },
        success: {
          text: '换骰的手法快，但逃不过你的眼睛——你一伸手掐住那只袖口，**三枚灌了铅的骰子**哗啦啦掉在木板上。地精们面面相觑，为首的把钱袋整个推给你：「勇士眼力好，我们服。」',
          fx: 'gold',
          effects: [{ t: 'gold', v: 30 }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '你押了十枚金币，开盅——**一、一、二**。地精们爆发出夸张的欢呼。再押再开——**三只一**。你终于明白那袖口鼓囊的原因时，钱袋已经瘪了下去。为首的地精拍拍你：「迷城不喜欢贪心的客人。」',
          effects: [{ t: 'gold', v: -12 }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      { id: 'decline', text: '微笑摇头', outcome: { text: '地精们耸耸肩继续摇盅。走出十几步，身后又是一阵假得离谱的欢呼。', goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a1_frag1: {
    id: 'a1_frag1', act: 1, thread: 'fragment', fixed: false, title: '残章·一', bg: 'shrine',
    text: [
      '甬道尽头有一座塌了半边的旧神龛，龛底压着一块烧焦的羊皮。你抽出它——边缘焦黑，字迹是百年前的花体字。',
      '**「……誓约既立，灾厄入腹。吾以下坠为壁，以百年为锁。若你读到这里，说明锁快锈完了……」**',
      '落款处只有一个被反复描深的字，像签名，又像不甘：**「将」**。',
    ],
    choices: [
      {
        id: 'arcana', text: '辨读残缺的段落（奥秘检定）',
        check: { skill: 'arcana', dc: 12 },
        success: {
          text: '你比对出被烧毁的几处关键词：「吞下」「独自」「**别让上面的人来**」。写下它的人不希望有后继者——他在试图用文字劝退所有读到这里的人。为什么？你把残章叠好收进怀里。它的重量不像羊皮，像一句遗言。',
          fx: 'fragment',
          effects: [{ t: 'fragment' }, { t: 'flag', id: 'frag1_read' }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '焦脆的羊皮在你指尖碎成了三瓣，关键的句子随烟散去。你只抢救出一个词：「**……对不起……**」。写给谁的？',
          effects: [{ t: 'flag', id: 'frag1_read' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      {
        id: 'keep', text: '小心收起，等有识之人再辨',
        outcome: {
          text: '你用油布把残章包好贴身收着。写它的人字迹用力得几乎划破羊皮——有什么话，他非常、非常想让人知道。',
          fx: 'fragment',
          effects: [{ t: 'fragment' }, { t: 'flag', id: 'frag1_read' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
    ],
  },
  // ── 第一幕固定锚点 ──
  a1_forge: {
    id: 'a1_forge', act: 1, thread: 'main', fixed: true, title: '最后的炉火', bg: 'tavern',
    text: [
      '迷城之门前的最后一个铺面，是铁匠铺。独臂铁匠正把打好的兵器一件件挂上墙，动作利落得让人忘记他少一条胳膊。',
      '「百年一批的生意，」他头也不回，「**银器克幽魂，钝器碎骸骨**——老规矩了。要什么趁早，过了那扇门，钱就是废金属。」',
    ],
    choices: [
      { id: 'shop', text: '挑挑货', outcome: { text: '铁匠让开半个身位，炉火照亮整面墙的兵器。', goto: { shop: 'shop_smith' } } },
      { id: 'ask_arm', text: '「你的胳膊……也是迷城给的？」', outcome: { text: '铁匠盯了炉火半晌。「我爹下去的时候，我这胳膊还在娘胎里长着呢。」他把一块铁坯拍上砧子，「后来婆婆把它绣在画像边上。就这么个故事。」', goto: { to: 'a1_gate' } } },
      { id: 'leave', text: '直接去城门', outcome: { text: '你朝迷城之门走去。', goto: { to: 'a1_gate' } } },
    ],
  },
  a1_gate: {
    id: 'a1_gate', act: 1, thread: 'main', fixed: true, title: '迷城之门', bg: 'gate',
    text: [
      '两扇高过城墙的黑石门虚掩着，门缝里渗出**温热的、带着灰烬味的气息**。门楣上的石像鬼半睁着眼。',
      '你踏上最后一级台阶时，它开口了。声音像两块墓碑互相摩擦：',
      '「**第一问：你为何而来？**」',
    ],
    choices: [
      {
        id: 'truth', text: '「为了封印烬疫。为了上面的人。」',
        outcome: {
          text: '石像鬼凝视你三秒。「**诚实。**」门缝里的热风缓了缓。「诚实的人，路会窄，但每一步都踩得实。」石门无声地开了一条仅容一人的缝。',
          effects: [{ t: 'flag', id: 'gate_honest' }],
          goto: { to: 'a1_goblin_ambush' },
        },
      },
      {
        id: 'lie', text: '「路过，进去看看风景。」（谎言）',
        check: { skill: 'persuasion', dc: 13 },
        success: {
          text: '你脸不红心不跳。石像鬼的砂砾嗓子里滚出一声近似笑的动静：「**滑头。**」门开了，和诚实者一样宽。「滑头的路宽，宽得容易迷路。」',
          effects: [{ t: 'flag', id: 'gate_slick' }],
          goto: { to: 'a1_goblin_ambush' },
        },
        failure: {
          text: '石像鬼的眼睛**骤然全睁**——「**欺诳者，先付学费！**」它从门楣扑击而下！',
          goto: { combat: 'gargoyle', onWin: 'a1_goblin_ambush', onLose: 'ending:death' },
        },
      },
      {
        id: 'force', text: '一言不发，按住剑柄',
        outcome: {
          text: '石像鬼读懂了你的姿态。「**暴力。最诚实的语言。**」门开了。「暴力者的路最短——也最疼。」',
          effects: [{ t: 'flag', id: 'gate_force' }],
          goto: { to: 'a1_goblin_ambush' },
        },
      },
    ],
  },
  a1_goblin_ambush: {
    id: 'a1_goblin_ambush', act: 1, thread: 'main', fixed: true, title: '门后伏兵', bg: 'corridor',
    text: [
      '门在你身后合拢的瞬间，黑暗里响起一声唿哨——',
      '岩石后蹿出绿影，锈钉长矛直指你的咽喉！这是每位冒险者的**第一堂课**：迷城不欢迎来客。',
    ],
    choices: [
      { id: 'fight', text: '拔武器迎击！', outcome: { text: '武器出鞘的寒光划破黑暗。', goto: { combat: 'goblin', onWin: 'a1_after_goblin', onLose: 'ending:death' } } },
    ],
  },
  a1_after_goblin: {
    id: 'a1_after_goblin', act: 1, thread: 'main', fixed: true, title: '第一课', bg: 'corridor',
    text: [
      '哥布林的尸体化作一小撮灰，被穿堂风卷走。它的长矛「哐当」落地——矛杆上密密麻麻刻着**正字**，每五个一组，一共刻了七组半。',
      '它在这扇门后守了多少个「百年之日」，数到第三十八个冒失鬼？你深吸一口气，往深处走。',
    ],
    choices: [
      { id: 'go', text: '继续深入', outcome: { text: '黑暗温柔地接住了你。', goto: { to: 'POOL' } } },
    ],
  },
  a1_camp1: {
    id: 'a1_camp1', act: 1, thread: 'granny', fixed: true, title: '第一处篝火', bg: 'camp',
    text: [
      '甬道在这里豁然开阔，前人垒起过一座石灶。你生起火，火焰跳动间——灶对面的石头上，**坐着一个人影**。',
      '炉火婆婆的眉眼。不是真人，是火焰借着热浪画出来的。她拨了拨并不存在的火堆，开口的声音带着柴木爆裂的噼啪：',
      '「第一晚最难熬。歇歇吧，听个故事——**从前有个姑娘，她爹是全镇最厉害的剑客，也是最不着家的爹。**」',
    ],
    choices: [
      {
        id: 'listen', text: '添一根柴，听她讲完',
        outcome: {
          text: '「她十二岁那年，镇子下的东西醒了。她爹说：姑娘，看好炉子，爹去去就回。」火影婆婆笑了笑，「**这一回，就是一百年。**姑娘守着炉子长大、变老。她后来才想明白——爹那句『去去就回』，说的不是回来吃饭，是回来**认路**。他把自己变成了路标，钉在那东西身上。」火光颤了颤，像是咳嗽。',
          effects: [{ t: 'flag', id: 'granny_story_1' }, { t: 'short_rest' }, { t: 'heal_pct', v: 0.6 }, { t: 'inspiration' }],
          goto: { to: 'POOL' },
        },
      },
      {
        id: 'ask', text: '「那个剑客……叫什么名字？」（需要听说过画像）',
        requireFlag: 'granny_asked',
        outcome: {
          text: '火影静了很久，久到你以为她散了。「**他有名字的。叫什么来着……**」她的声音第一次显出老态，「姑娘我啊，也开始忘了。你看，这就是那东西最坏的地方——它不用爬上来，它让上面的东西自己烂。」她抬头看你，「所以啊，孩子，要是你见到了一个想不起自己名字的人——**拜托你，帮他记一瞬。**」',
          effects: [{ t: 'flag', id: 'granny_story_1' }, { t: 'flag', id: 'granny_promise' }, { t: 'short_rest' }, { t: 'heal_pct', v: 0.6 }, { t: 'inspiration' }],
          goto: { to: 'POOL' },
        },
      },
      {
        id: 'rest_only', text: '道声叨扰，闭目养神',
        outcome: {
          text: '火影婆婆不恼，哼起一支不成调的摇篮曲。你在歌声里浅浅睡了一觉，伤口愈合了些。',
          effects: [{ t: 'short_rest' }, { t: 'heal_pct', v: 0.6 }],
          goto: { to: 'POOL' },
        },
      },
    ],
  },
  a1_spider_lair: {
    id: 'a1_spider_lair', act: 1, thread: 'main', fixed: true, title: '第一层的主人', bg: 'cavern',
    text: [
      '通往第二层的旋梯口，结着一面**比城门还大的蛛网**。网中央悬着一只茧——茧的形状，是个人。',
      '你数到第三声滴水时，整个洞穴的阴影开始移动。第一层真正的主人，等这顿「百年饭」等了很久了。',
    ],
    choices: [
      {
        id: 'free', text: '先冲去割开吊茧（运动检定）',
        check: { skill: 'athletics', dc: 12 },
        success: {
          text: '你冲进蛛网、一把撕开吊茧——里面是个昏迷的行商，还有他的货担！你把人拖到角落，转身面对垂落的巨影。货担里顺手抄了两瓶药水。',
          effects: [{ t: 'item', id: 'potion', count: 2 }, { t: 'flag', id: 'saved_merchant' }],
          goto: { combat: 'giant_spider', onWin: 'a1_end', onLose: 'ending:death' },
        },
        failure: {
          text: '蛛网黏得超乎想象，你越挣越紧——巨蛛已经到了头顶。行商对不起了，先保自己！',
          effects: [{ t: 'hp', v: -2 }],
          goto: { combat: 'giant_spider', onWin: 'a1_end', onLose: 'ending:death' },
        },
      },
      { id: 'fight', text: '不管茧，正面迎敌', outcome: { text: '茧里的人轻声呻吟了一下——还活着。但你得先活下来才救得了他。', goto: { combat: 'giant_spider', onWin: 'a1_end', onLose: 'ending:death' } } },
    ],
  },
  a1_end: {
    id: 'a1_end', act: 1, thread: 'main', fixed: true, title: '下行的电梯', bg: 'cavern',
    text: [
      '巨蛛瘫成一小堆灰。你割开吊茧——行商呛咳着醒过来，语无伦次地道谢，掏空了钱袋塞给你，然后连滚带爬地逃向地面。',
      '（若你救了他，他会记得你的好。）',
      '蛛网深处，是一座**古老的升降机**。黄铜铭牌上的字迹斑驳：「第二层·幽暗深处——百年检修，恕不暂停。」',
      '你跨进吊笼。铁链呻吟着，载你坠向更深的黑暗。',
    ],
    choices: [
      { id: 'descend', text: '长休：在吊笼里合眼片刻，等待到达', outcome: { text: '下坠的风声里，你握紧了武器。第二层，幽暗深处。', effects: [{ t: 'heal_full' }, { t: 'short_rest' }], goto: { act: 'next' } } },
    ],
  },

  // ══════════════════════ 第二幕：幽暗深处 ══════════════════════
  a2_descend: {
    id: 'a2_descend', act: 2, thread: 'main', fixed: true, title: '刻在墙上的话', bg: 'corridor',
    text: [
      '第二层的岩壁沁着水光。走出百步，你看见墙上刻着一行大字，笔画潦草，刻痕很深，像是用剑尖仓促划下的：',
      '**「别唤醒他。他已经很累了。」**',
      '字迹下面还有更小的一行，几乎被水汽蚀尽：「*他认得每一个下来的人。他只是……装作不认得。*」',
    ],
    choices: [
      {
        id: 'investigate', text: '研究刻痕的年代与来历（调查检定）',
        check: { skill: 'investigation', dc: 12 },
        success: {
          text: '刻痕的氧化程度：**约五十年前**。也就是说——在「烬王被封印」之后的某一天，有活人下到了这里，刻下这句警告，然后……上去了？还是没上去？你记下这条线索：**封印之后的五十年，迷城里发生过别的事。**',
          effects: [{ t: 'flag', id: 'wall_note_dated' }, { t: 'inspiration' }],
          goto: { to: 'POOL' },
        },
        failure: {
          text: '水汽蚀掉了太多细节。你只确定一件事：刻字的人手在抖——刻到「累」字时，剑尖滑了很长一道。',
          goto: { to: 'POOL' },
        },
      },
      { id: 'note', text: '用炭拓下这段话', outcome: { text: '你把拓片折好收进怀里。「别唤醒他。」——他，指谁？', effects: [{ t: 'flag', id: 'wall_note' }], goto: { to: 'POOL' } } },
    ],
  },
  a2_banjo_truth: {
    id: 'a2_banjo_truth', act: 2, thread: 'banjo', fixed: false, title: '琴声引路', bg: 'cavern',
    text: [
      '黑暗深处飘来断断续续的琴声——是那支歌谣：*火焰记得每个名字……*',
      '拐过石柱，**班卓**坐在一块蘑菇状的岩石上，腿骨晃着，鲁特琴只剩一根弦了。「哟，」他头也不抬，「猜你会来。骨头记得的事，比心多嘛。」',
      '他终于抬「眼」看你，空空的眼窝里燃着两点蓝火：「聊聊？还是——**跟我走一段？**」',
    ],
    choices: [
      {
        id: 'recruit', text: '「缺个会唱歌的。」（招募同伴）',
        requireFlag: 'banjo_friendly',
        outcome: {
          text: '班卓的下颌骨张了张，发出一串干燥的笑声。「**一百年了，头一回有人类邀请骷髅入队。**」他抱起单弦琴跳下岩石，「说好，工钱没有，掌声管够。还有——」他凑近，蓝火眼窝亮得吓人，「**我下去过一次。有些路，我认得。**」',
          fx: 'ember',
          effects: [{ t: 'companion' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      {
        id: 'truth', text: '「你到底是谁？你说过你『下来过』。」',
        outcome: {
          text: '琴声停了。「百年前那支小队，」班卓声音低下去，「五个人。领头的剑客、我、还有三个没能变成传说的人。**剑客封印那东西的时候，把我们仨的命垫在了阵眼里。**」他拨了一下唯一的琴弦，「我不怪他。那时候……不垫,全镇都得死。」「但你说怪不怪——他把我忘在了阵外，我这把骨头,就自己爬起来,一直走到了镇上。」他忽然又轻快起来，「所以你问我认不认识烬王？**认识。他下巴很硬，唱歌总跑调。**」',
          fx: 'fragment',
          effects: [{ t: 'flag', id: 'banjo_truth' }, { t: 'inspiration' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      { id: 'pass', text: '点头致意，各自赶路', outcome: { text: '班卓拨弦送你：「下面见,活的。」', goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a2_market: {
    id: 'a2_market', act: 2, thread: 'main', fixed: true, title: '无光集市', bg: 'market',
    text: [
      '谁能想到。第二层的溶洞里居然有一个**集市**——十几盏鬼火灯笼，照着摊位上明晃晃的兵器和药水。兜帽的商人、灰扑扑的矿鬼、还有一只戴着八角帽的地精在卖烤蘑菇。',
      '兜帽商人朝你扬扬下巴：「活人，稀客。金币在这儿不问来路。」',
    ],
    choices: [
      { id: 'shop', text: '逛逛', outcome: { text: '货架在鬼火下泛着幽光。', goto: { shop: 'shop_market' } } },
      { id: 'ask', text: '「你们就不怕烬疫？」', outcome: { text: '商人嗤笑：「**烬疫吃的是记忆。我们这些人,早就没什么可吃的了。**」他顿了顿,补了一句，「倒是你们,一脑子名字、脸、和舍不得——跟揣着肉走过狼群似的。」', effects: [{ t: 'flag', id: 'market_hint' }], goto: { to: 'a2_broken_bridge' } } },
      { id: 'leave', text: '不逗留，赶路', outcome: { text: '你穿过集市,身后的叫卖声渐渐远了。', goto: { to: 'a2_broken_bridge' } } },
    ],
  },
  a2_broken_bridge: {
    id: 'a2_broken_bridge', act: 2, thread: 'main', fixed: true, title: '断桥', bg: 'cavern',
    text: [
      '深渊裂谷上一座石桥,**断掉了中间三丈**。对面就是通往迷宫之心的甬道。裂谷底下,黑得听不见回声。',
      '桥墩上留着前人凿的把手坑——有人反复通过这里。班卓若在,他会知道路数。',
    ],
    choices: [
      {
        id: 'banjo', text: '让班卓带路（同伴协助·优势）',
        requireCompanion: true,
        advantage: true,
        check: { skill: 'athletics', dc: 12 },
        success: {
          text: '班卓在前面跳:「左边第三个把手是松的,跳过去——对,像我这样,骨头轻……」有他带路,你像走过自家后院。中间他还回头补了一句:「当年我们队里那个重甲圣武士,卡在这,是剑客**把盾拆了搭板**才过去的。那人啊,嘴上嫌麻烦,手比谁都快。」',
          effects: [{ t: 'flag', id: 'bridge_memory' }],
          goto: { to: 'POOL' },
        },
        failure: {
          text: '班卓记得的「松的把手」在百年风化后又松了一大截——你半途踩空,靠指尖挂着岩壁荡了过去,虎口全麻了。',
          effects: [{ t: 'hp', v: -4 }],
          goto: { to: 'POOL' },
        },
      },
      {
        id: 'jump', text: '攀着把手坑硬闯（运动检定）',
        check: { skill: 'athletics', dc: 13 },
        success: {
          text: '指尖、脚尖、呼吸——三样都对上了。你贴着崖壁荡过最后一丈,落地时膝弯吃了一记,但站住了。裂谷底的黑,没能留住你。',
          goto: { to: 'POOL' },
        },
        failure: {
          text: '第二个把手坑崩了!你向下滑坠,慌乱中抓住了半截古藤——藤上全是倒刺,你被划得满手血,狼狈地爬上了对岸。',
          fx: 'hurt',
          effects: [{ t: 'hp', v: -6 }],
          goto: { to: 'POOL' },
        },
      },
      {
        id: 'fix', text: '用工兵思路修复残桥（调查检定）',
        check: { skill: 'investigation', dc: 12 },
        success: {
          text: '你研究了断口的受力,用断桥残板和绳索搭出一段「将就」的通道——稳稳当当过了谷。顺手在桥头刻了个记号,给后来的人。',
          effects: [{ t: 'inspiration' }],
          goto: { to: 'POOL' },
        },
        failure: {
          text: '残板的承重算错了,踩上去第一块就「咔嚓」——你当机立断放弃方案,硬跳了最后两丈,肩膀撞在崖沿上。',
          effects: [{ t: 'hp', v: -3 }],
          goto: { to: 'POOL' },
        },
      },
    ],
  },
  a2_fountain: {
    id: 'a2_fountain', act: 2, thread: 'side', fixed: false, title: '血泉', bg: 'shrine',
    text: [
      '岩腔中央涌着一汪泉,泉水是**温热的暗红色**,表面却平静得像镜子。泉边石碑刻着两个古字,你辨认出是:「**饮我**」。',
      '泉水映出你的脸——比出发时憔悴,但眼睛还亮着。',
    ],
    choices: [
      {
        id: 'drink', text: '俯身饮下泉水（体质考验）',
        check: { skill: 'survival', dc: 12 },
        success: {
          text: '腥、烫、然后是一股从胃里烧开的暖——伤口以肉眼可见的速度收拢结痂。血泉「咕嘟」一声,像是打了个饱嗝。它喝你的血气,你喝它的——**各取所需**。',
          fx: 'heal',
          effects: [{ t: 'heal_full' }, { t: 'hp', v: 4 }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '泉水入喉的瞬间你眼前发黑——它喝得**比你多**。你跪在泉边干呕,半刻钟后才缓过来,伤口没好,人更虚了。石碑上的「饮我」二字,此刻看着像一句冷笑。',
          fx: 'hurt',
          effects: [{ t: 'hp', v: -5 }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      {
        id: 'fill', text: '不喝,灌一瓶带走（医药检定）',
        check: { skill: 'medicine', dc: 11 },
        success: {
          text: '你按野外急救的老法子处理了泉水——沉淀、煮沸、再兑一滴自己的血「引路」。一瓶**勉强可信**的治疗药水,成了。',
          effects: [{ t: 'item', id: 'potion' }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '灌瓶的手一抖,泉水洒了大半——剩下的那点,颜色越看越不对。你倒掉了它。石碑沉默地看你浪费了一顿饭。',
          goto: { to: 'NEXT_POOL' },
        },
      },
      { id: 'skip', text: '绕开。有些便宜不占', outcome: { text: '你贴着岩壁绕过血泉。走出老远,泉水的镜面还在背后安安静静地照着你。', goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a2_library: {
    id: 'a2_library', act: 2, thread: 'side', fixed: false, title: '焚烧的图书馆', bg: 'library',
    text: [
      '整座洞窟是一座图书馆——或者说,曾是。千疮百孔的书架间,书本**无火自燃**,烧成灰的字句在半空盘旋,像一群倦鸟。',
      '一小片灰烬飘到你眼前,上面烧剩半行字:「*烬疫不是病,是**食欲***」',
    ],
    choices: [
      {
        id: 'read', text: '追着燃烧的字句阅读（奥秘检定）',
        check: { skill: 'arcana', dc: 12 },
        success: {
          text: '你在灰烬的鸟群里读到了惊人的段落:烬疫并非天灾——它是迷城心脏的**代谢物**。迷城靠「记忆」为食,每逢百年饱餐,食量与日俱增;当年封印者做的,不是杀死它,而是**把自己变成了一道消化不良的堵头**。书页的最后一句烧得最快:「*堵头在烂。*」',
          effects: [{ t: 'flag', id: 'knows_metabolism' }, { t: 'xp', v: 2 }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '字句烧得太快,你只追到几个孤立的词:「**堵头**」「在烂」「快了」。连不成句,像一道看不清题面的谜语。',
          goto: { to: 'NEXT_POOL' },
        },
      },
      {
        id: 'save_book', text: '从火里抢一本书（牺牲小我）',
        outcome: {
          text: '你护着一本《第一层图志》滚出火场,头发燎焦了一绺。书页间夹着一张书签——是根**鸟的尾羽**。迷城里,哪来的鸟?你收好了它。',
          fx: 'hurt',
          effects: [{ t: 'hp', v: -2 }, { t: 'flag', id: 'feather_bookmark' }, { t: 'inspiration' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      { id: 'leave', text: '打扰了,告辞', outcome: { text: '你退出图书馆。身后的字句继续烧着,一代一代地,烧给无人看。', goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a2_mimic: {
    id: 'a2_mimic', act: 2, thread: 'side', fixed: false, title: '过分的宝箱', bg: 'cavern',
    text: [
      '石笋丛后,一只**宝箱**端端正正摆在路中央。橡木包黄铜,锁扣擦得锃亮,箱盖上还贴心地搭着一块红绒布。',
      '在此时此地此地此景——这也太客气了。',
    ],
    choices: [
      {
        id: 'investigate', text: '绕箱三圈,先看再说（调查检定）',
        check: { skill: 'investigation', dc: 12 },
        success: {
          text: '红绒布下没有灰——**每天有人擦**。木纹的走向不对,那是「肌肉」的纹理。你退后三步,抄起一块石头丢过去——箱子一口咬碎了它,还嚼了嚼。好险。你远远地用火油瓶招呼了它,从残骸里捡出一窝亮闪闪的「它以前的收藏」。',
          fx: 'gold',
          effects: [{ t: 'gold', v: 35 }, { t: 'xp', v: 1 }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '你没看出破绽。指尖刚碰锁扣——箱盖「咔」地咧成满口獠牙!宝箱怪!',
          goto: { combat: 'mimic', onWin: 'NEXT_POOL', onLose: 'ending:death' },
        },
      },
      { id: 'open', text: '开!富贵险中求', outcome: { text: '你的手比脑子快——箱盖咬合的瞬间你甚至还没明白发生了什么。', goto: { combat: 'mimic', onWin: 'NEXT_POOL', onLose: 'ending:death' } } },
      { id: 'pass', text: '路中央的宝箱 = 坟墓的请柬', outcome: { text: '你目不斜视地走过。身后传来极轻的、咬牙切齿的「咔哒」声。', goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a2_shadows: {
    id: 'a2_shadows', act: 2, thread: 'side', fixed: false, title: '无影之地', bg: 'corridor',
    text: [
      '这段甬道里,火把的光**照不出你的影子**。温度骤降,你呼出的白气凝在空中,迟迟不散。',
      '墙壁上,几团人形的黑暗缓缓立起。其中一团开口,用的是**你的声音**:「把名字……留下……」',
      '暗影——从记忆的裂缝里漏出来的东西。**凡铁伤不了它们,银与魔法可以。**',
    ],
    choices: [
      { id: 'fight', text: '武器出鞘', outcome: { text: '你压下脊椎里的寒意。', goto: { combat: 'shadow', onWin: 'NEXT_POOL', onLose: 'ending:death' } } },
      {
        id: 'name', text: '「我的名字,凭什么给你?」(反客为主)',
        check: { skill: 'intimidation', dc: 13 },
        success: {
          text: '你盯着那团用你声音说话的黑暗,一字一句:「**想拿名字,先问过我的剑。**」暗影们骚动了片刻,竟缓缓沉回墙里——欺软怕硬,是裂缝里的东西的通性。你走出甬道时,影子回到了你的脚跟。',
          effects: [{ t: 'inspiration' }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '暗影们对视一眼——如果说它们有「眼」的话——然后一齐扑了上来。威吓失败,只好动武!',
          goto: { combat: 'shadow', onWin: 'NEXT_POOL', onLose: 'ending:death' },
        },
      },
    ],
  },
  a2_skeleton_rubble: {
    id: 'a2_skeleton_rubble', act: 2, thread: 'side', fixed: false, title: '瓦砾下的前辈', bg: 'corridor',
    text: [
      '塌方处,一只**骷髅兵**正从瓦砾里往外爬。它的锈剑上系着褪色的平安结——镇上手艺,和你在酒馆门帘上见过的一模一样。',
      '它爬出来一半,忽然停了。空洞的眼眶望着你,喉咙里挤出风化的声音:「**……回家……让我……回家……**」',
    ],
    choices: [
      {
        id: 'blunt', text: '「我送你回家。」（钝器，让它安息）',
        check: { skill: 'religion', dc: 10 },
        success: {
          text: '你念着婆婆教的送行词,一锤落下。骷髅散成安安静静的一堆白骨,平安结完好无损地落在最上面。你把它收好——**替他带回镇上**。骨骼深处,你听见一声很轻的「谢」。它的行囊里还有没来得及用的药水。',
          fx: 'heal',
          effects: [{ t: 'item', id: 'potion' }, { t: 'flag', id: 'knot_kept' }, { t: 'inspiration' }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '送行词念岔了一句,骷髅的眼眶里红光骤亮——它不想听解释,它只想「回家」!(钝击对骸骨有奇效)',
          goto: { combat: 'skeleton', onWin: 'NEXT_POOL', onLose: 'ending:death' },
        },
      },
      { id: 'fight', text: '拔剑,先下手为强', outcome: { text: '锈剑迎着晨光——不,是火光。开打。', goto: { combat: 'skeleton', onWin: 'NEXT_POOL', onLose: 'ending:death' } } },
    ],
  },
  a2_ghoul_ambush: {
    id: 'a2_ghoul_ambush', act: 2, thread: 'side', fixed: false, title: '尸潮暗巷', bg: 'corridor',
    text: [
      '气味先到——腐肉混着旧伤口的甜腥。然后你看见它们:**三只食尸鬼**贴着墙皮爬行,指甲抠进石缝,速度比野狗还快。',
      '它们饿了一百年,而你是热的。',
    ],
    choices: [
      { id: 'fight', text: '迎击', outcome: { text: '你背靠岩壁,不让它们绕后。', goto: { combat: 'ghoul', onWin: 'NEXT_POOL', onLose: 'ending:death' } } },
      {
        id: 'fire', text: '点火把驱赶（生存检定）',
        check: { skill: 'survival', dc: 12 },
        success: {
          text: '食腐的东西畏火。你把火把舞成一圈火墙,逼得它们嘶嘶后退,最后悻悻钻回黑暗。一只跑得慢的撞进火圈——那就别走了。',
          goto: { combat: 'ghoul', onWin: 'NEXT_POOL', onLose: 'ending:death' },
        },
        failure: {
          text: '火把脱手飞出,反把它们激怒了!',
          goto: { combat: 'ghoul', onWin: 'NEXT_POOL', onLose: 'ending:death' },
        },
      },
    ],
  },
  a2_orc_camp: {
    id: 'a2_orc_camp', act: 2, thread: 'side', fixed: false, title: '佣兵的营地', bg: 'cavern',
    text: [
      '溶洞里居然有一座营盘:兽皮帐篷、烤架上的不明肉块、一面画着**倒置酒杯**的旗——兽人佣兵「醉杯团」的旗号。',
      '为首的兽人督军盘坐在火堆旁,像一座会呼吸的铁塔。他看见你,咧嘴一笑,拍了拍身边的位置:「**来,坐。**下手之前,先喝一杯——这是规矩。」',
    ],
    choices: [
      {
        id: 'drink', text: '坐下喝这杯（威吓检定:气场上压过他）',
        check: { skill: 'intimidation', dc: 13 },
        success: {
          text: '你仰头灌下那杯「酒」——度数高得像刀,你面不改色,把空杯倒扣在桌上:「**续杯。**」兽人督军盯了你三秒,爆发出雷鸣般的大笑:「一百年了,总算来了个像样的!」他扔给你一袋酒钱:「打不过你,这买卖不做也罢。**往下走小心点,那位……最近心情不好。**」',
          fx: 'gold',
          effects: [{ t: 'gold', v: 25 }, { t: 'flag', id: 'orc_respect' }, { t: 'inspiration' }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '你被那杯「酒」呛得眼泪横流。督军笑容不变,巨斧已经摸到了手里:「没酒量,就没得谈。」',
          goto: { combat: 'orc', onWin: 'NEXT_POOL', onLose: 'ending:death' },
        },
      },
      { id: 'fight', text: '「我赶时间。」', outcome: { text: '督军耸耸肩:「那就都省了。」他站起来的瞬间,整个营地的火把都晃了晃。', goto: { combat: 'orc', onWin: 'NEXT_POOL', onLose: 'ending:death' } } },
      {
        id: 'stealth', text: '绕开营地（隐匿检定）',
        check: { skill: 'stealth', dc: 12 },
        success: {
          text: '你贴着溶洞阴影,从营地侧翼的石笋林里穿了过去。兽人们的鼾声和酒令在身后渐渐远去。营地边缘,你顺走了一桶没人看管的军需。',
          effects: [{ t: 'item', id: 'potion', count: 2 }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '你踩翻了一只酒桶——「**哐当!**」整座营地的兽人同时转头。督军眯起眼,拎起了巨斧。',
          goto: { combat: 'orc', onWin: 'NEXT_POOL', onLose: 'ending:death' },
        },
      },
    ],
  },
  a2_frag2: {
    id: 'a2_frag2', act: 2, thread: 'fragment', fixed: false, title: '残章·二', bg: 'library',
    text: [
      '在图书馆最深处,有一间**烧不掉的石室**。石桌上摊着一本没有烧的书——不,是有人给它做了「不烧的结界」,一滴一滴用什么东西喂着。',
      '书页翻开,是日记。字迹你认得——和第一幕神龛下的残章同源:**「将」**。',
      '「……第七十三年。今天又忘了她的名字。我把它刻在甲胄内侧,每天读一遍。**刻名字的刀痕已经比甲还厚了。**」',
    ],
    choices: [
      {
        id: 'read', text: '读下去（奥秘检定:维持结界不崩）',
        check: { skill: 'arcana', dc: 13 },
        success: {
          text: '你屏息读完最关键的一页:「……**灾厄没有死,它只是换了个吃法。以前它吃镇子,现在它吃我。等我被吃干净,它就再吃一百年。**……有人下来的话,别救我。杀了我,或者——」后面的字被指甲反复刮过,刮痕里全是干涸的暗色。你合上日记,手指在抖。这就是第二枚残章。',
          fx: 'fragment',
          effects: [{ t: 'fragment' }, { t: 'flag', id: 'frag2_read' }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '你翻页太急,维持结界的「喂食」断了——日记在你手中轰然自燃!你只抢下焦黑的一角,上面剩下半句:「**……或者,把我的记忆还给我。**」',
          fx: 'fragment',
          effects: [{ t: 'fragment' }, { t: 'flag', id: 'frag2_read' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      {
        id: 'necromancer', text: '石室门口,有人鼓掌',
        outcome: {
          text: '「一百年了,终于有人读到这一页。」死灵法师从阴影里走出,指尖缠着幽紫的雾,「我是这里的图书管理员——**前任冒险者,第九个**。日记是我护着的。」他忽然笑了,笑容里全是疲惫,「不过规矩是规矩:书给想读的人看,命……得凭本事留下。」',
          goto: { combat: 'necromancer', onWin: 'a2_frag2_win', onLose: 'ending:death' },
        },
      },
    ],
  },
  a2_frag2_win: {
    id: 'a2_frag2_win', act: 2, thread: 'fragment', fixed: false, title: '图书管理员的遗愿', bg: 'library',
    text: [
      '死灵法师跪坐在书堆间,身体的边缘正在化灰。「打得好……」他喘着气笑,「我撑了一百年,就是不想让**那一位的日记**烧在别人手里……」',
      '他把日记残页推给你:「拿着……对了,告诉你个秘密——**王座后面有条缝,他藏『没寄出的信』的地方**……我可没用过,舍不得……」',
      '灰烬温柔地散了。石室里只剩你,和一本重得像誓言的书。',
    ],
    choices: [
      { id: 'take', text: '收好日记', outcome: { text: '第二枚残章,入手。它的重量又沉了一分。', fx: 'fragment', effects: [{ t: 'fragment' }, { t: 'flag', id: 'frag2_read' }, { t: 'flag', id: 'knows_secret_gap' }], goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a2_camp2: {
    id: 'a2_camp2', act: 2, thread: 'granny', fixed: true, title: '第二处篝火', bg: 'camp',
    text: [
      '迷宫之心前最后一处开阔地。你生起火——火影婆婆又出现了,这次她**没有讲故事**,只是看着你烤手。',
      '良久,她开口:「姑娘我这辈子,恨过他跑了一百年,也恨过迷城咬走了我的记性。到老才想明白——**他不是没回来,他是回不来,又不敢忘。**忘了,就真的什么都没有了。」',
      '她抬起头,火做的眼睛映着你:「孩子,你一路捡的那些纸——**凑齐了,你就能替他做个了断**。至于是哪种了断……」她笑了笑,「骰子在你手里。」',
    ],
    choices: [
      {
        id: 'promise', text: '「婆婆,他叫什么?我替你问。」（需要读过任一残章）',
        requireFlag: 'frag1_read',
        outcome: {
          text: '火影剧烈地晃了一下,像被这句话烫到。她张了张嘴——**「……阿,阿将。小名将。他小时候,跑调大王。」**说完这句,她整个人形的火都亮了亮,如释重负,「说出来了。原来我还记得。**原来我还记得!**」她看向你,郑重得像交接什么圣物:「替我告诉他——**围裙我洗干净了。回家的路,灯我留了一百年。**」',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'granny_password' }, { t: 'inspiration' }, { t: 'short_rest' }, { t: 'heal_pct', v: 0.6 }],
          goto: { to: 'POOL' },
        },
      },
      {
        id: 'listen', text: '静静听完,添柴到天明',
        outcome: {
          text: '婆婆哼起那支摇篮曲,这次你听清了全部歌词:*火焰记得每个名字,名字记得回家的路;忘了名字的孩子啊,沿着灯走,沿着灯走……*你在歌声里睡了入城以来最沉的一觉。',
          effects: [{ t: 'short_rest' }, { t: 'heal_pct', v: 0.6 }],
          goto: { to: 'POOL' },
        },
      },
    ],
  },
  a2_heart_maze: {
    id: 'a2_heart_maze', act: 2, thread: 'main', fixed: true, title: '迷宫之心', bg: 'maze',
    text: [
      '最后一道门后,是**迷宫之心**——百年来所有甬道的汇聚点。墙壁上密密麻麻,全是**名字**。',
      '每一代下来的人,把名字刻在这里,再走向王座殿。你数了数:整整**三面墙**。',
      '刻痕新旧不一。最新的一行墨迹未干,写着一个你今早在登记簿上见过的名字——**今天,第七个。**',
    ],
    choices: [
      {
        id: 'carve', text: '刻下自己的名字',
        grantsInspiration: true,
        outcome: {
          text: '你一笔一划刻下自己的名字。刻完的瞬间,整面墙的刻痕**同时亮了一瞬**——像无数人对你说:知道了,看见了,一路平安。你莫名地踏实。',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'name_carved' }, { t: 'inspiration' }, { t: 'heal_pct', v: 0.5 }],
          goto: { to: 'a2_boss_minotaur' },
        },
      },
      {
        id: 'study', text: '先研究墙上的规律（调查检定）',
        check: { skill: 'investigation', dc: 12 },
        success: {
          text: '你发现一个规律:名字旁边的**小记号**——五种画法。你认出其中四种:骸骨、断剑、漏沙、火焰。而第五种记号,只在极少数名字旁出现:一朵**小小的、回家的箭头**。「有人出去了?」你盯着那个箭头看了很久。',
          effects: [{ t: 'flag', id: 'arrow_found' }, { t: 'inspiration' }, { t: 'heal_pct', v: 0.5 }],
          goto: { to: 'a2_boss_minotaur' },
        },
        failure: {
          text: '名字太多了,密密麻麻看久了眼睛发花。你只在最角落发现一个反复出现的图案:**五个并列的小人**,其中一个被圈了出来。',
          effects: [{ t: 'flag', id: 'five_figures' }, { t: 'heal_pct', v: 0.5 }],
          goto: { to: 'a2_boss_minotaur' },
        },
      },
      { id: 'go', text: '不多停留', outcome: { text: '名字的事,让活人操心。你推开迷宫之心尽头的大门。', goto: { to: 'a2_boss_minotaur' } } },
    ],
  },
  a2_boss_minotaur: {
    id: 'a2_boss_minotaur', act: 2, thread: 'main', fixed: true, title: '看门的老兵', bg: 'maze',
    text: [
      '大门后的甬道猛地拓宽成一座殿堂。地面的震动由远及近——**牛头怪**,迷宫的看守,拖着一柄门板般的巨斧,喘着白汽转过身。',
      '它鼻孔喷出的热气扫过你:「**又一个刻名字的。**」它的声音像塌方,「名字刻了三面墙,我送走的人,比墙上的字还多。」',
      '它举起巨斧,却在原地踏步——像某种郑重的仪式:「规矩:打赢我,你才有资格去见**那位**。他……唉。他等太久了。」',
    ],
    choices: [
      {
        id: 'str', text: '正面撞碎它的斧势!（运动检定:先手压制）',
        check: { skill: 'athletics', dc: 13 },
        success: {
          text: '你抢在它劈落之前,肩撞进它的下盘——巨斧砸空,地面裂开蛛网!你占尽先手!',
          effects: [{ t: 'flag', id: 'minotaur_firststrike' }],
          goto: { combat: 'minotaur', onWin: 'a2_end_heart', onLose: 'ending:death' },
        },
        failure: {
          text: '你撞上了,像撞上一堵会躲的墙。它的膝盖顶得你五脏移位——但至少,它知道你不好惹。',
          effects: [{ t: 'hp', v: -4 }],
          goto: { combat: 'minotaur', onWin: 'a2_end_heart', onLose: 'ending:death' },
        },
      },
      {
        id: 'talk', text: '「你说『他等太久了』——你在同情他?」',
        outcome: {
          text: '牛头怪的动作停了半拍。「……我看了三面墙的名字,」它闷闷地说,「看了七百年。**他一个人站在最下面,比我们所有人都久。**」它摇摇头,巨斧重新抬起,「废话完了。规矩就是规矩。」',
          effects: [{ t: 'flag', id: 'minotaur_sympathy' }],
          goto: { combat: 'minotaur', onWin: 'a2_end_heart', onLose: 'ending:death' },
        },
      },
      { id: 'fight', text: '不多话,战', outcome: { text: '你握紧武器。', goto: { combat: 'minotaur', onWin: 'a2_end_heart', onLose: 'ending:death' } } },
    ],
  },
  a2_end_heart: {
    id: 'a2_end_heart', act: 2, thread: 'main', fixed: true, title: '最深处', bg: 'maze',
    text: [
      '牛头怪单膝跪地,身体化作尘雾前,朝最深处**行了一个军礼**——那是士兵对将领的礼。',
      '「替我问他一句,」它最后说,「**那支队伍的酒钱,他还记不记得。**」',
      '雾散了。你面前,是通往第三层的螺旋长阶。空气烫了起来,呼吸里全是灰烬的味道——像有人,在很深的地方,**烧了一百年的记忆取暖**。',
    ],
    choices: [
      { id: 'descend', text: '踏上长阶（长休:出发前整备）', outcome: { text: '你在阶梯口整备了装备,合眼养神。醒来时,火光已经在下面等你了。', effects: [{ t: 'heal_full' }, { t: 'short_rest' }], goto: { act: 'next' } } },
    ],
  },

  // ══════════════════════ 第三幕:烬王殿 ══════════════════════
  a3_throne_gate: {
    id: 'a3_throne_gate', act: 3, thread: 'main', fixed: true, title: '低语之门', bg: 'throne',
    text: [
      '烬王殿的大门不是推开的——它**认得你**,自己开了。',
      '门后是无边的暖光。低语从四面八方涌来,温柔得可怕:「**把名字放下吧,很重的。**」「**把那张脸放下吧,反正也模糊了。**」「**把孩子、酒馆、雪……都放下。轻一点,再轻一点……**」',
      '你太阳穴突突直跳——这是烬疫浓度最高的地方。它想吃你的记忆,**现在就要**。',
    ],
    choices: [
      {
        id: 'wis', text: '咬破舌尖,靠痛觉锚定自己（感知豁免）',
        check: { skill: 'insight', dc: 13 },
        success: {
          text: '血腥味在舌尖炸开,低语像潮水般退了半步。你在心里默背:我叫×××,我从烬痕镇来,我要去见烬王——**一遍,又一遍**。锚,抛住了。',
          effects: [{ t: 'flag', id: 'anchored' }, { t: 'inspiration' }],
          goto: { to: 'POOL' },
        },
        failure: {
          text: '低语从耳朵缝里钻进来。你晃了晃头——**背包轻了**。低头看:你最称手的一件装备不见了,你怎么也想不起自己把它放哪了。(烬疫吃掉了你的一件装备!)',
          fx: 'hurt',
          effects: [{ t: 'forgetItem' }, { t: 'flag', id: 'whisper_hit' }],
          goto: { to: 'POOL' },
        },
      },
      {
        id: 'censer', text: '点燃烬净香,硬闯过去',
        requireItem: 'censer',
        outcome: {
          text: '香烟升起的一瞬,低语**尖叫着退散**。你抱着一线白烟的余烬,大步穿过门户。烬疫怕这个——怕「清醒的味道」。',
          effects: [{ t: 'loseItem', id: 'censer' }, { t: 'flag', id: 'anchored' }, { t: 'inspiration' }],
          goto: { to: 'POOL' },
        },
      },
      {
        id: 'embrace', text: '……它说得对,好累。松开手',
        outcome: {
          text: '你松开手的瞬间,一段记忆轻飘飘地离你而去——某个夏夜、某句没说完的话、某个再也不重要的约定。**轻了。真的轻了。**低语满意地卷着你向王座殿深处去。你连它吃了你什么都,懒得记了。',
          fx: 'ember',
          effects: [{ t: 'forgetItem' }, { t: 'flag', id: 'embraced_whisper' }, { t: 'hp', v: 5 }],
          goto: { to: 'POOL' },
        },
      },
    ],
  },
  a3_frag3: {
    id: 'a3_frag3', act: 3, thread: 'fragment', fixed: false, title: '残章·三:没寄出的信', bg: 'throne',
    text: [
      '王座殿的侧廊尽头,石壁上有一道**仅容手臂的缝**——和死灵法师说的一样。(若你知道这个秘密,或者你眼力过人。)',
      '你探臂进去,指尖触到一叠用油布包了三层的东西。抽出来——**三封信**。收信人都是同一个名字。',
      '火漆完好。一封都没寄出去过。',
    ],
    choices: [
      {
        id: 'read', text: '读信',
        outcome: {
          text: '「**给阿炉:今天封印成了一半。名字开始忘了。我怕忘了你,先给你写信。**」/「给阿炉:我把你的名字刻在甲胄内侧。每天读。刻痕比甲厚了。」/「**给阿炉:最后一封。如果有人类读到这里——我不求他救我。只求他告诉你:爹不是没回来。**爹是路。路不会回头,路一直都在。」火漆上,是一个小小的、歪歪扭扭的炉子图案。第三枚残章。',
          fx: 'fragment',
          effects: [{ t: 'fragment' }, { t: 'flag', id: 'frag3_read' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
    ],
  },
  a3_whisper: {
    id: 'a3_whisper', act: 3, thread: 'side', fixed: false, title: '低语的提议', bg: 'throne',
    text: [
      '王座殿的立柱之间,低语忽然凝成了**实体**——一缕缠着火星的雾,像一段被抽出来的记忆,在你面前盘旋。',
      '「**何必呢,」**它用烬王的声音说,「他等了一百年,你才来几个小时。你们打,两败俱伤;你们和谈,他不肯——**那就换个法子。**」',
      '「**收下他的一半力量,回去,当你的英雄。**他会感谢你的——终于有人替他扛了。哪怕一半。」',
      '雾气摊开,像一只手:里面有力量,有荣耀,有「不用再疼」的许诺。',
    ],
    choices: [
      {
        id: 'refuse', text: '「他扛了一百年,我替他扛一半?他愿意吗?」',
        check: { skill: 'persuasion', dc: 12 },
        success: {
          text: '低语僵住了。这句话像一把钝刀,捅进了它逻辑的缝隙:「你……你竟然先问他愿不愿意……」雾气烦躁地翻卷,**提议收回**。但它临走前丢下一句:「**你去问他呀。问那个连女儿名字都忘了的人。**」',
          effects: [{ t: 'flag', id: 'refused_whisper' }, { t: 'inspiration' }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '低语轻轻巧巧绕过你的质问:「他愿意的。他**累了**。」这句话在你脑子里嗡嗡作响,挥之不去——**心魔,种下了**。(对话中你会不受控地分神)',
          effects: [{ t: 'flag', id: 'tempted' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      {
        id: 'accept', text: '伸手,接住那团火星',
        outcome: {
          text: '力量涌入的瞬间,你听见记忆剥落的声音——脆,轻,像踩碎薄冰。**不疼。真的不疼。**低语在你耳边温柔地说:「现在,你也是『一半』了。」(你的力量暴涨,但有些东西,永远地少了)',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'took_power' }, { t: 'hp', v: 10 }, { t: 'flag', id: 'tempted' }],
          goto: { to: 'NEXT_POOL' },
        },
      },
      { id: 'ignore', text: '一言不发,穿过去', outcome: { text: '你从雾气中间径直穿过,像穿过一摊坏掉的天气。它在背后怨毒地嘶了一声。', effects: [{ t: 'flag', id: 'refused_whisper' }], goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a3_tendril_ambush: {
    id: 'a3_tendril_ambush', act: 3, thread: 'side', fixed: false, title: '地火突袭', bg: 'throne',
    text: [
      '王座殿的地面像呼吸一样起伏——不,它**就是在呼吸**。',
      '地砖接连爆开,数条烧红的烬疫触须破土而出,抽打着空气里的记忆尘埃。殿门就在眼前,可这些看守不打算放行。',
    ],
    choices: [
      { id: 'fight', text: '迎战!', outcome: { text: '你跃上断柱,居高临下。', goto: { combat: 'tendril', onWin: 'NEXT_POOL', onLose: 'ending:death' } } },
      {
        id: 'athletics', text: '借断柱荡过去（运动检定）',
        check: { skill: 'athletics', dc: 13 },
        success: {
          text: '你踩着倒塌的立柱三步两荡,从触须的缝隙间穿过——落地翻滚,殿门在身后,触须们徒劳地拍打着空地。',
          effects: [{ t: 'xp', v: 1 }],
          goto: { to: 'NEXT_POOL' },
        },
        failure: {
          text: '半空一条触须抽中你的后背——烫得像鞭子蘸了岩浆!你重重摔进殿前空地,触须围了上来。',
          fx: 'hurt',
          effects: [{ t: 'hp', v: -4 }],
          goto: { combat: 'tendril', onWin: 'NEXT_POOL', onLose: 'ending:death' },
        },
      },
    ],
  },
  a3_stall: {
    id: 'a3_stall', act: 3, thread: 'side', fixed: false, title: '深渊尽头的小摊', bg: 'market',
    text: [
      '谁能想到。烬王殿外一百步,居然还有一个小摊——一条板凳,一块摊布,一盏气若游丝的灯。摊主是个盲眼商贩,眼皮安详地阖着。',
      '「客人到了,」他早就在等,「脚步声很乱,又怕又硬气——**最后一战前都是这样**。」他把摊布掀开,下面是你这辈子见过最好的货色。',
    ],
    choices: [
      { id: 'shop', text: '看看最后的货', outcome: { text: '「不看眼泪,只收金币。」', goto: { shop: 'shop_final' } } },
      { id: 'ask', text: '「你不怕烬王?」', outcome: { text: '盲眼商贩笑了:「**我卖的每一样东西,都从他殿里流出来的。**你说他是我的敌人,还是我的货源?」他顿了顿,收起笑,「去吧。他真的,很累了。」', goto: { to: 'NEXT_POOL' } } },
      { id: 'go', text: '赶路要紧', outcome: { text: '你最后看了一眼那盏灯。它在无边暖光里,固执地亮着冷色。', goto: { to: 'NEXT_POOL' } } },
    ],
  },
  a3_lastcamp: {
    id: 'a3_lastcamp', act: 3, thread: 'granny', fixed: true, title: '最后的篝火', bg: 'camp',
    text: [
      '王座殿前的空地,你生起了最后一堆火。火影婆婆出现了——**这一次,她的轮廓有些透明**。镇上的火,快压不住她了。',
      '她什么都没说,只是从围裙口袋里摸出一样东西,隔空放进你手心——一枚**烧黑的顶针**。她爸爸的。当年他走的那天早上,落在门槛上的。',
      '「带给他,」婆婆说,「就当……就当是**他该回家吃饭了**的意思。」',
      '她的火光安静下来,像在等一个答案。',
    ],
    choices: [
      {
        id: 'promise', text: '「我带他回家。活的死的,都带。」',
        grantsInspiration: true,
        outcome: {
          text: '婆婆看着你,火做的脸上,皱纹慢慢舒展。「**好孩子。**」她说,「记住,见了面别先动手——**先说暗号**:*围裙我洗干净了,回家的路,灯我留了一百年。*……他要还有一口气在,就听得懂。」',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'granny_password' }, { t: 'item', id: 'thimble' }, { t: 'inspiration' }, { t: 'heal_full' }, { t: 'short_rest' }],
          goto: { to: 'a3_boss_king' },
        },
      },
      {
        id: 'ask', text: '「婆婆……如果他已经不是『他』了呢?」',
        outcome: {
          text: '火影静了很久。「那就更要把顶针带去。」她说得极慢,「**东西在,人就还有一点在。**哪怕只剩一点……也该认认自家的门。」她抬眼看你,目光是炉火一百年的温度,「去吧。别替我做决定,**替我,做到最后一步。**」',
          effects: [{ t: 'flag', id: 'granny_password' }, { t: 'item', id: 'thimble' }, { t: 'heal_full' }, { t: 'short_rest' }],
          goto: { to: 'a3_boss_king' },
        },
      },
    ],
  },
  a3_boss_king: {
    id: 'a3_boss_king', act: 3, thread: 'main', fixed: true, title: '灰烬的王座', bg: 'throne',
    text: [
      '大殿尽头,灰烬堆成的王座上,「**烬王**」缓缓起身。',
      '铠甲的缝隙里没有血肉,只有缓缓流动的火星。他抬起手——你看见他的护腕内侧,**密密麻麻全是刻痕**。全是同一个名字,刻了又磨,磨了又刻。',
      '「又来了一个……**记不住教训的**。」他的声音像烧穿的木头。火焰在他身后升起,组成一支**五个人的队伍**的剪影——其中四个,已经暗得快看不见了。',
      '「来吧。」他拔出一柄由凝固火焰构成的长剑,摆出的起手式**端正、老派,是教剑的姿态**,「让本王看看——这一代的『去去就回』,是什么斤两。」',
    ],
    choices: [
      {
        id: 'password', text: '先喊出暗号:「围裙我洗干净了——回家的路,灯我留了一百年!」',
        requireFlag: 'granny_password',
        outcome: {
          text: '剑,停在半空。烬王整副铠甲**剧烈地颤抖**起来,火星从缝隙里喷涌——像哭,像笑,像一百年里所有没出口的话一起挤到喉咙口。「……围裙,」他哑声重复,「**她……她还在等?她还在等!**」火焰剪影里,那个抱着鲁特琴的形状,朝你轻轻点了一下头。烬王闭了闭「眼」——再睁开时,火星更亮,也更稳:「**说完了。该打还是得打**——但这一次,本王不会输给自己。」(烬王的攻击因心防松动而略有迟滞,你的「归还」之路已打开)',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'king_password_said' }, { t: 'inspiration' }],
          goto: { combat: 'emberking', onWin: 'a3_final_choice', onLose: 'ending:death' },
        },
      },
      {
        id: 'banjo_word', text: '先带话:「班卓说——歌还没唱完。」',
        requireFlag: 'banjo_truth',
        outcome: {
          text: '烬王的剑尖,晃了一下。「**……跑调大王还在唱?**」他喉咙深处滚出一声近乎叹息的火星,「那个胆小鬼……当年垫在阵眼里的三个人里,他叫得最大声。」火焰剪影里,抱琴的形状浑身一亮。烬王重新举剑,姿态却松了半分:「**带话的,有资格用全力。来。**」',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'king_banjo_word' }],
          goto: { combat: 'emberking', onWin: 'a3_final_choice', onLose: 'ending:death' },
        },
      },
      { id: 'fight', text: '拔剑。废话留到战后', outcome: { text: '你踏上大殿的地砖,一步,一步,走向灰烬的王座。', goto: { combat: 'emberking', onWin: 'a3_final_choice', onLose: 'ending:death' } } },
    ],
  },
  a3_final_choice: {
    id: 'a3_final_choice', act: 3, thread: 'main', fixed: true, title: '王倒下的时刻', bg: 'throne',
    text: [
      '「烬王」单膝跪地。铠甲的火星正在熄灭——**被封印的灾厄失去宿主,正在从他体内溢出**,像百年的洪水终于决堤,在大殿里横冲直撞,寻找新的容器。',
      '烬王抬起头。透过面甲的缝隙,你第一次看清——**不是恶意,是疲惫**。深不见底的、一百年的疲惫。',
      '「快,」他说,「趁它还没散……**杀了我,它会重新聚拢,一百年后再来。**这是规律。」',
      '「或者——」他的目光落在你的怀口,那里鼓鼓囊囊——**如果你凑齐了三枚残章**——「……把记忆,还给我。」',
      '灾厄的火星在他周身盘旋。时间不多了。你的选择是:',
    ],
    choices: [
      {
        id: 'return', text: '【归还】掏出全部残章与顶针:「阿将。小名将。你女儿阿炉,把灯留了一百年。」',
        requireFragment: 3,
        outcome: {
          text: '你把三枚残章、三封没寄出的信、和那枚烧黑的顶针,一样一样,放在他摊开的掌心。',
          fx: 'ember',
          effects: [{ t: 'flag', id: 'chose_return' }],
          goto: { ending: 'end_return' },
        },
      },
      {
        id: 'slay', text: '【斩王】趁灾厄未聚,斩灭烬王',
        outcome: {
          text: '你举起武器。烬王看着你,竟慢慢点头:「……也好。这是你的答案。」他最后一次摆正了姿态——像个老兵整理最后的军容。',
          effects: [{ t: 'flag', id: 'chose_slay' }],
          goto: { ending: 'end_slay' },
        },
      },
      {
        id: 'fall', text: '【接过】让决堤的灾厄,涌进自己的胸膛',
        requireFlag: 'took_power',
        outcome: {
          text: '你张开双臂。火星的洪流愣了一瞬——随即,狂喜地灌进你的身体。烬王嘶吼着扑来阻止,却被自己的溃散绊倒。世界在燃烧,而你在燃烧的中心,**前所未有地清醒**。',
          effects: [{ t: 'flag', id: 'chose_fall' }],
          goto: { ending: 'end_fall' },
        },
      },
    ],
  },
}

// ─── 幕结构:锚点 + 随机池槽位 ───────────────────────────────────────
export interface ActPlan {
  anchors: (string | { pool: number })[]
  pool: string[]
}

export const ACT_PLANS: Record<number, ActPlan> = {
  1: {
    anchors: ['a1_open', 'a1_sign', 'a1_memory_done', { pool: 2 }, 'a1_forge', 'a1_gate', 'a1_goblin_ambush', { pool: 2 }, 'a1_camp1', { pool: 1 }, 'a1_spider_lair', 'a1_end'],
    pool: ['a1_banjo_intro', 'a1_well', 'a1_beggar', 'a1_shrine', 'a1_lostcart', 'a1_ghost_child', 'a1_gamblers', 'a1_frag1'],
  },
  2: {
    anchors: ['a2_descend', { pool: 2 }, 'a2_market', { pool: 2 }, 'a2_camp2', { pool: 1 }, 'a2_heart_maze', 'a2_boss_minotaur', 'a2_end_heart'],
    pool: ['a2_banjo_truth', 'a2_fountain', 'a2_library', 'a2_mimic', 'a2_shadows', 'a2_skeleton_rubble', 'a2_ghoul_ambush', 'a2_orc_camp', 'a2_frag2'],
  },
  3: {
    anchors: ['a3_throne_gate', { pool: 2 }, 'a3_lastcamp', 'a3_boss_king'],
    pool: ['a3_frag3', 'a3_whisper', 'a3_stall', 'a3_tendril_ambush'],
  },
}

// ─── 结局 ───────────────────────────────────────────────────────────
export const ENDINGS: Record<string, EndingDef> = {
  end_slay: {
    id: 'end_slay', name: '斩王',
    lines: [
      '剑落。烬王的铠甲散成一场慢雪。',
      '决堤的灾厄失去容器,在大殿里哀鸣着盘旋、变淡、消散——这一次,没有新的宿主。',
      '你不知道它会不会回来。也许是百年,也许是永远。',
      '——上行的电梯里,你数着自己还记得的名字。一个,一个,都还在。',
      '炉火与骰子酒馆的门被推开。婆婆抬起头。',
      '「就你一个?」她问。',
      '你点头。她沉默地给你倒了一杯酒,又给对面的空位倒了一杯。',
      '「那杯给他。」她说,「百年一盏,习惯了。」',
      '**——结局:斩王。循环斩断了吗?无人知晓。但今晚,镇子的灯是亮的。**',
    ],
  },
  end_return: {
    id: 'end_return', name: '归还', trueEnding: true,
    lines: [
      '残章、信、顶针——他掌心的火星一件件亮起来,像炉膛重新点着。',
      '「阿炉……」烬王的声音碎了。一百年来第一次,那个声音不再是王的,是爹的。',
      '记忆归位的一瞬,灾厄失去了最后的「燃料」——它赖以维生的,从来是**遗忘**本身。',
      '而现在,这个人什么都想起来了。',
      '火,从内向外安静地烧。烬王抬起头——铠甲剥落,露出里面一个白发苍苍、却眉目干净的老人。他冲你笑了,还是画像上那个没心没肺的笑。',
      '「姑娘的酒,」他说,「**酿了一百年,该陈了。**」',
      '灰烬温柔地卷起他,向上,向上,穿过百年的岩层——',
      '那一夜,烬痕镇所有人都看见:一粒火星落进了炉火与骰子酒馆的烟囱。',
      '婆婆愣了很久,忽然把围裙解下来,叠好,放在桌上。',
      '「爹,」她说,「**饭好了。**」',
      '**——真结局:归还。迷城熄了。灯,还亮着。**',
    ],
  },
  end_fall: {
    id: 'end_fall', name: '堕落',
    lines: [
      '灾厄在你体内找到了新的、**更年轻的容器**。',
      '力量是真的。荣耀是真的。镇民抛上天的帽子和欢呼,也是真的。',
      '只有一件事不对劲——你越来越想不起,自己当初为什么要下来。',
      '要紧吗?你笑了笑。火星在你眼底静静地烧。',
      '酒馆墙上,婆婆挂了一幅新的画像。这次,她照着你的下巴画的。',
      '画下的小字写着:**「百年前下来的那个人」。**',
      '——结局:堕落。循环,完成了它最漂亮的一次缝合。',
    ],
  },
  end_death: {
    id: 'end_death', name: '殒命',
    lines: [
      '黑暗合拢之前,你最后听见的,是远处篝火边摇篮曲的余音。',
      '*「忘了名字的孩子啊,沿着灯走,沿着灯走……」*',
      '——你在迷城的名字,留在了墙上。三面墙,又多了一行。',
    ],
  },
}

// ─── 墓志铭模板(死亡结算的 DM 评语) ─────────────────────────────────
export const EPITAPHS: string[] = [
  '「开局三步,卒于教学。骰子已阅,深表同情。」',
  '「勇气可嘉,血量堪忧。下局多带药水——如果你记得买的话。」',
  '「你在墙上刻下名字的时候,墙也记住了你。扯平了。」',
  '「死于贪婪。宝箱表示:这顿饭,它等了一百年。」',
  '「大成功×{nat20},大失败×{nat1}。骰运如此,夫复何言。」',
  '「至少你救过一个人/埋过一个人/记得回家的路。DM 给你点个赞。」',
  '「烬王听说了你的死讯。他说:又少一个能聊天的。」',
  '「班卓为你写了一首歌。跑调,但很好听。」',
  '「婆婆往酒馆门口多放了一盏灯。就一盏,不多问。」',
  '「别灰心。百年来下去的人里,你排第……算了,数字不重要。」',
]
