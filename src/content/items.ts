// ─── 物品与商店 ─────────────────────────────────────────────────────
import type { ItemDef, ShopDef } from '../game/types'

export const ITEMS: Record<string, ItemDef> = {
  // 武器
  shortsword: {
    id: 'shortsword', name: '短剑', emoji: '🗡️', price: 5,
    desc: '贴身快刃，走的是巧劲。',
    kind: 'weapon', damageDice: '1d6', damageType: 'pierce', attackAttr: 'dex', material: 'normal',
  },
  longsword: {
    id: 'longsword', name: '长剑', emoji: '⚔️', price: 10,
    desc: '铁匠铺学徒作的正经货，剑柄缠着防滑的粗麻。',
    kind: 'weapon', damageDice: '1d8', damageType: 'slash', attackAttr: 'str', material: 'normal',
  },
  mace: {
    id: 'mace', name: '战锤', emoji: '🔨', price: 8,
    desc: '牧师的旧识。钝器对亡灵的骨头有奇效。',
    kind: 'weapon', damageDice: '1d6', damageType: 'blunt', attackAttr: 'wis', material: 'normal',
  },
  staff: {
    id: 'staff', name: '烬木法杖', emoji: '🪄', price: 10,
    desc: '杖头的余烬永不冷却，敲人也很疼——以魔法的名义。',
    kind: 'weapon', damageDice: '1d6', damageType: 'magic', attackAttr: 'int', material: 'magic',
  },
  silverdagger: {
    id: 'silverdagger', name: '银匕首', emoji: '🔪', price: 25,
    desc: '银子打的。某些「不该存在的东西」怕它。',
    kind: 'weapon', damageDice: '1d4', damageType: 'pierce', attackAttr: 'dex', material: 'silver',
  },
  warhammer: {
    id: 'warhammer', name: '重战锤', emoji: '⚒️', price: 30,
    desc: '一锤下去，骨头记得住教训。',
    kind: 'weapon', damageDice: '1d8', damageType: 'blunt', attackAttr: 'str', material: 'normal',
  },
  silverlongsword: {
    id: 'silverlongsword', name: '银长剑', emoji: ' ⚔️', price: 60,
    desc: '圣银锻造的长剑，剑身刻着一圈驱邪祷文。',
    kind: 'weapon', damageDice: '1d8', damageType: 'slash', attackAttr: 'str', material: 'silver',
  },
  emberbrand: {
    id: 'emberbrand', name: '烬焰魔剑', emoji: '🔥', price: 120,
    desc: '剑刃是凝固的深红火焰，出鞘时空气里全是烧过的记忆味。魔法武器。',
    kind: 'weapon', damageDice: '1d8', damageType: 'magic', attackAttr: 'int', material: 'magic',
  },
  // 护甲
  robe: {
    id: 'robe', name: '旅法师长袍', emoji: '🧥', price: 5,
    desc: '缝了三个内袋的旧袍子，其中一个装着干花。',
    kind: 'armor', acBonus: 1,
  },
  leather: {
    id: 'leather', name: '旧皮甲', emoji: '🥼', price: 10,
    desc: '硬化的皮革，前任主人留下的护心镜还亮着。',
    kind: 'armor', acBonus: 1,
  },
  chain: {
    id: 'chain', name: '锁子甲', emoji: '🦺', price: 30,
    desc: '三千个铁环彼此咬合，像一句不肯松口的誓言。',
    kind: 'armor', acBonus: 3,
  },
  breastplate: {
    id: 'breastplate', name: '半身板甲', emoji: '🛡️', price: 90,
    desc: '胸口的凹痕是它挡过什么的光荣证明。',
    kind: 'armor', acBonus: 4,
  },
  // 饰品
  luckydie: {
    id: 'luckydie', name: '幸运骰', emoji: '🎲', price: 15,
    desc: '一颗被无数掌心焐热过的骰子。使用后获得 1 点灵感。',
    kind: 'consumable', effect: { t: 'inspiration' },
  },
  guardcharm: {
    id: 'guardcharm', name: '守护符', emoji: '🧿', price: 50,
    desc: '婆婆缝的护身符，针脚里全是惦记。佩戴时 AC +1。',
    kind: 'trinket', effect: { t: 'ac_up', value: 1 },
  },
  echoconch: {
    id: 'echoconch', name: '回响海螺', emoji: '🐚', price: 60,
    desc: '贴在耳边能听见自己的心跳回声。佩戴时职业资源上限 +1。',
    kind: 'trinket', effect: { t: 'resource_up', value: 1 },
  },
  // 消耗品
  potion: {
    id: 'potion', name: '治疗药水', emoji: '🧪', price: 20,
    desc: '喝下去像吞了一口温热的炉火。回复 2d4+4 生命。',
    kind: 'consumable', effect: { t: 'heal', dice: '2d4+4' },
  },
  hipotion: {
    id: 'hipotion', name: '高级治疗药水', emoji: '⚗️', price: 45,
    desc: '深红色，稠得像晚霞。回复 4d4+4 生命。',
    kind: 'consumable', effect: { t: 'heal', dice: '4d4+4' },
  },
  firebomb: {
    id: 'firebomb', name: '火油瓶', emoji: '🍾', price: 18,
    desc: '掷出后炸开一片火海。战斗中造成 2d6 火焰伤害（无视命中）。',
    kind: 'consumable', effect: { t: 'fire_bomb' },
  },
  censer: {
    id: 'censer', name: '烬净香', emoji: '🕯️', price: 15,
    desc: '点燃后心里那阵窃窃私语会安静片刻。清除「低语」侵扰。',
    kind: 'consumable', effect: { t: 'cleanse' },
  },
  thimble: {
    id: 'thimble', name: '烧黑的顶针', emoji: '🪡', price: 0,
    desc: '炉火婆婆的爸爸留下的顶针,烧得漆黑。他说过要戴着它给女儿缝完那件围裙。',
    kind: 'trinket',
  },
}

export function itemDef(id: string): ItemDef {
  const it = ITEMS[id]
  if (!it) throw new Error(`未知物品: ${id}`)
  return it
}

export const SHOPS: Record<string, ShopDef> = {
  shop_smith: {
    id: 'shop_smith',
    name: '炉火铁匠铺',
    keeper: '独臂铁匠',
    greeting: '「又是百年的这一天……想要什么就快挑，我的炉子只在天亮前答话。」',
    items: ['silverdagger', 'warhammer', 'potion', 'luckydie'],
    next: 'a1_gate',
  },
  shop_market: {
    id: 'shop_market',
    name: '无光集市',
    keeper: '兜帽商人',
    greeting: '「金币在这里不问来路。银器、板甲、还有让你活着见到下一层的运气——都在货架上。」',
    items: ['silverlongsword', 'breastplate', 'hipotion', 'firebomb', 'censer', 'echoconch'],
    next: 'a2_broken_bridge',
  },
  shop_final: {
    id: 'shop_final',
    name: '深渊尽头的小摊',
    keeper: '盲眼商贩',
    greeting: '「我不看货，只看人——你在发抖，但我闻得出你还要往上走。最后一笔买卖了。」',
    items: ['emberbrand', 'guardcharm', 'hipotion', 'potion'],
    next: 'a3_lastcamp',
  },
}
