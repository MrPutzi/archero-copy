import { EquipmentItem, EquipmentSlot, ItemRarity, SaveData, TalentNode } from '../types/game';

const STORAGE_KEY = 'archero_roguelite_save_v2';

export const RARITY_STYLES: Record<
  ItemRarity,
  {
    name: string;
    border: string;
    bg: string;
    glow: string;
    text: string;
    badgeBg: string;
    colorHex: string;
  }
> = {
  common: {
    name: 'Common',
    border: 'border-slate-500',
    bg: 'bg-slate-800',
    glow: 'shadow-slate-500/20',
    text: 'text-slate-300',
    badgeBg: 'bg-slate-700 text-slate-200',
    colorHex: '#94a3b8',
  },
  great: {
    name: 'Great',
    border: 'border-emerald-500',
    bg: 'bg-emerald-950/80',
    glow: 'shadow-emerald-500/30',
    text: 'text-emerald-300',
    badgeBg: 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40',
    colorHex: '#10b981',
  },
  rare: {
    name: 'Rare',
    border: 'border-sky-500',
    bg: 'bg-sky-950/80',
    glow: 'shadow-sky-500/30',
    text: 'text-sky-300',
    badgeBg: 'bg-sky-600/30 text-sky-300 border border-sky-500/40',
    colorHex: '#0ea5e9',
  },
  epic: {
    name: 'Epic',
    border: 'border-purple-500',
    bg: 'bg-purple-950/80',
    glow: 'shadow-purple-500/40',
    text: 'text-purple-300',
    badgeBg: 'bg-purple-600/30 text-purple-300 border border-purple-500/40',
    colorHex: '#a855f7',
  },
  perfect_epic: {
    name: 'Perfect Epic',
    border: 'border-amber-400',
    bg: 'bg-amber-950/80',
    glow: 'shadow-amber-400/40',
    text: 'text-amber-300',
    badgeBg: 'bg-amber-500/30 text-amber-300 border border-amber-400/50',
    colorHex: '#f59e0b',
  },
  legendary: {
    name: 'Legendary',
    border: 'border-orange-500',
    bg: 'bg-orange-950/80',
    glow: 'shadow-orange-500/50',
    text: 'text-orange-300',
    badgeBg: 'bg-orange-500/30 text-orange-300 border border-orange-400/50',
    colorHex: '#f97316',
  },
  mythic: {
    name: 'Mythic',
    border: 'border-rose-500',
    bg: 'bg-rose-950/80',
    glow: 'shadow-rose-500/60',
    text: 'text-rose-300',
    badgeBg: 'bg-rose-600/40 text-rose-300 border border-rose-400/60 animate-pulse',
    colorHex: '#f43f5e',
  },
};

export const ALL_EQUIPMENT_CATALOG: EquipmentItem[] = [
  // ===================== WEAPONS =====================
  {
    id: 'weapon_bow',
    name: 'Brave Bow',
    slot: 'weapon',
    rarity: 'common',
    description: 'Standard issue hunter bow. Perfectly balanced with reliable trajectory.',
    icon: '🏹',
    attackBonus: 25,
    hpBonus: 0,
    speedBonus: 0,
    critBonus: 5,
    specialPassive: '+50% Crit Damage when health is above 80%',
    unlocked: true,
  },
  {
    id: 'weapon_sawblade',
    name: 'Saw Blade',
    slot: 'weapon',
    rarity: 'great',
    description: 'Blazing fast razor thrower. Unmatched attack speed upon room entry.',
    icon: '🪚',
    attackBonus: 35,
    hpBonus: 0,
    speedBonus: 25,
    critBonus: 4,
    specialPassive: '+20% Attack Speed for 3s upon entering any room',
    unlocked: true,
  },
  {
    id: 'weapon_tornado',
    name: 'Tornado Boomerang',
    slot: 'weapon',
    rarity: 'rare',
    description: 'Piercing wind disk that flies forward through enemies and returns back to the hero.',
    icon: '🌀',
    attackBonus: 55,
    hpBonus: 0,
    speedBonus: 0,
    critBonus: 6,
    specialPassive: 'Inflicts 66% return damage on enemies as it comes back',
    unlocked: true,
  },
  {
    id: 'weapon_scythe',
    name: 'Death Scythe',
    slot: 'weapon',
    rarity: 'epic',
    description: 'Heavy curved blade with headshot bonus. Hits hard with high knockback.',
    icon: '🪓',
    attackBonus: 90,
    hpBonus: 0,
    speedBonus: -10,
    critBonus: 8,
    specialPassive: 'Headshot chance: Instantly executes non-boss enemies under 30% HP',
    unlocked: true,
  },
  {
    id: 'weapon_staff',
    name: 'Stalker Staff',
    slot: 'weapon',
    rarity: 'epic',
    description: 'Arcane staff firing radiant energy orbs that curve dynamically toward locked targets.',
    icon: '🪄',
    attackBonus: 85,
    hpBonus: 100,
    speedBonus: 0,
    critBonus: 12,
    specialPassive: 'Projectiles track and home in on the nearest target',
    unlocked: false,
  },
  {
    id: 'weapon_spear',
    name: 'Brightspear',
    slot: 'weapon',
    rarity: 'perfect_epic',
    description: 'Fires instantaneous holy lasers with zero bullet flight travel time.',
    icon: '⚡',
    attackBonus: 140,
    hpBonus: 150,
    speedBonus: 10,
    critBonus: 10,
    specialPassive: 'Instant hitscan beam dealing +30% attack damage over continuous fire',
    unlocked: false,
  },
  {
    id: 'weapon_galeforce',
    name: 'Gale Force Crossbow',
    slot: 'weapon',
    rarity: 'legendary',
    description: 'Heavy kinetic siege crossbow that charges destructive hyper-velocity wind bolts.',
    icon: '🎯',
    attackBonus: 220,
    hpBonus: 250,
    speedBonus: -5,
    critBonus: 16,
    specialPassive: 'Charged shot pierces through all enemies with 250% damage',
    unlocked: false,
  },
  {
    id: 'weapon_demonblade',
    name: 'Demon Blade - Rain',
    slot: 'weapon',
    rarity: 'mythic',
    description: 'Ancient cursed katana. Attacks with melee slashes up close and blade waves from afar.',
    icon: '🗡️',
    attackBonus: 340,
    hpBonus: 400,
    speedBonus: 20,
    critBonus: 22,
    dodgeBonus: 8,
    specialPassive: 'Seamless hybrid melee/ranged combat with +40% melee critical rate',
    unlocked: false,
  },

  // ===================== ARMORS =====================
  {
    id: 'armor_dexterity',
    name: 'Vest of Dexterity',
    slot: 'armor',
    rarity: 'great',
    description: 'Lightweight enchanted tunic enhancing natural agility and evasion.',
    icon: '🥋',
    attackBonus: 0,
    hpBonus: 380,
    speedBonus: 15,
    critBonus: 0,
    dodgeBonus: 7,
    specialPassive: '+7% Dodge Rate and releases lightning when dodging',
    unlocked: true,
  },
  {
    id: 'armor_golden',
    name: 'Golden Chestplate',
    slot: 'armor',
    rarity: 'rare',
    description: 'Heavy gilded mail that reduces physical damage from direct monster collisions.',
    icon: '🛡️',
    attackBonus: 10,
    hpBonus: 650,
    speedBonus: -5,
    critBonus: 0,
    specialPassive: '+10% Damage Resistance to all incoming hits',
    unlocked: true,
  },
  {
    id: 'armor_phantom',
    name: 'Phantom Cloak',
    slot: 'armor',
    rarity: 'epic',
    description: 'Woven from ethereal shadows. Absorbs blows and freezes enemies who strike you.',
    icon: '🧥',
    attackBonus: 25,
    hpBonus: 1100,
    speedBonus: 5,
    critBonus: 4,
    specialPassive: 'Freezes attacking enemies for 1.5s and deals 150% thorn damage',
    unlocked: true,
  },
  {
    id: 'armor_void',
    name: 'Void Robe',
    slot: 'armor',
    rarity: 'perfect_epic',
    description: 'Dark shroud infused with lingering miasma that contaminates all room enemies.',
    icon: '🥻',
    attackBonus: 45,
    hpBonus: 1750,
    speedBonus: 0,
    critBonus: 5,
    specialPassive: 'Poisons all enemies upon room entry for continuous ticking damage',
    unlocked: false,
  },
  {
    id: 'armor_shadow',
    name: 'Shadow Cloak',
    slot: 'armor',
    rarity: 'legendary',
    description: 'Woven with dark matter. Emits devastating dark burst pulses to all nearby targets.',
    icon: '🌌',
    attackBonus: 80,
    hpBonus: 2800,
    speedBonus: 15,
    critBonus: 8,
    dodgeBonus: 10,
    specialPassive: 'Triggers a Dark Burst dealing 200% weapon damage to all nearby foes',
    unlocked: false,
  },

  // ===================== RINGS =====================
  {
    id: 'ring_wolf',
    name: 'Wolf Ring',
    slot: 'ring1',
    rarity: 'common',
    description: 'Carved from wolf fang. Boosts lethal critical precision against melee foes.',
    icon: '🐺',
    attackBonus: 15,
    hpBonus: 80,
    speedBonus: 0,
    critBonus: 6,
    specialPassive: '+15% Damage against Melee enemies',
    unlocked: true,
  },
  {
    id: 'ring_falcon',
    name: 'Falcon Ring',
    slot: 'ring1',
    rarity: 'great',
    description: 'Swift as the hunting falcon. Augments rapid attack tempo and airborne foes.',
    icon: '🦅',
    attackBonus: 20,
    hpBonus: 120,
    speedBonus: 12,
    critBonus: 3,
    specialPassive: '+8% Attack Speed and +15% Damage to airborne targets',
    unlocked: true,
  },
  {
    id: 'ring_bear',
    name: 'Bear Ring',
    slot: 'ring2',
    rarity: 'rare',
    description: 'Infused with primal stamina. Grants heavy bulk and durability against ground units.',
    icon: '🐻',
    attackBonus: 15,
    hpBonus: 450,
    speedBonus: 0,
    critBonus: 0,
    specialPassive: '+15% Max HP and +15% Damage against Ground units',
    unlocked: true,
  },
  {
    id: 'ring_serpent',
    name: 'Serpent Ring',
    slot: 'ring2',
    rarity: 'epic',
    description: 'Enchanted with venomous reflexes. Improves evasiveness and ranged defense.',
    icon: '🐍',
    attackBonus: 35,
    hpBonus: 320,
    speedBonus: 5,
    critBonus: 4,
    dodgeBonus: 7,
    specialPassive: '+7% Dodge Rate and +15% Damage against Ranged foes',
    unlocked: true,
  },
  {
    id: 'ring_bull',
    name: 'Bull Ring',
    slot: 'ring1',
    rarity: 'perfect_epic',
    description: 'Massive brass ring boosting defense against all monsters and dropping extra coins.',
    icon: '🐂',
    attackBonus: 50,
    hpBonus: 600,
    speedBonus: 0,
    critBonus: 5,
    specialPassive: '+10% Damage Resistance to all mobs & +12% Coin Drops',
    unlocked: false,
  },
  {
    id: 'ring_lion',
    name: 'Lion Ring',
    slot: 'ring2',
    rarity: 'legendary',
    description: 'Emblazoned with a regal lion crest. Maximizes offensive punch against Chapter Bosses.',
    icon: '🦁',
    attackBonus: 110,
    hpBonus: 400,
    speedBonus: 5,
    critBonus: 10,
    specialPassive: '+20% Attack Damage against Bosses and +25% Crit Damage',
    unlocked: false,
  },

  // ===================== PETS / SPIRITS =====================
  {
    id: 'pet_bat',
    name: 'Laser Bat',
    slot: 'pet',
    rarity: 'rare',
    description: 'A loyal nocturnal bat that shoots radiant laser beams through stone walls.',
    icon: '🦇',
    attackBonus: 30,
    hpBonus: 150,
    speedBonus: 0,
    critBonus: 4,
    specialPassive: 'Pet laser penetrates straight through solid obstacles and walls',
    unlocked: true,
  },
  {
    id: 'pet_ghost',
    name: 'Flaming Ghost',
    slot: 'pet',
    rarity: 'epic',
    description: 'A spectral fiery spirit that bombards enemies with flaming meteors.',
    icon: '👻',
    attackBonus: 55,
    hpBonus: 280,
    speedBonus: 0,
    critBonus: 6,
    specialPassive: 'Pet fireballs split into twin embers on collision',
    unlocked: false,
  },
  {
    id: 'pet_mage',
    name: 'Scythe Mage',
    slot: 'pet',
    rarity: 'perfect_epic',
    description: 'A miniature necromancer hurling rotating phantom scythes.',
    icon: '🧙‍♂️',
    attackBonus: 90,
    hpBonus: 420,
    speedBonus: 0,
    critBonus: 8,
    specialPassive: 'Pet scythes pierce up to 3 targets in a straight line',
    unlocked: false,
  },
  {
    id: 'pet_bomb',
    name: 'Living Bomb',
    slot: 'pet',
    rarity: 'legendary',
    description: 'A volcanic elemental that drops area-of-effect bomb clusters on clustered foes.',
    icon: '💣',
    attackBonus: 140,
    hpBonus: 650,
    speedBonus: 0,
    critBonus: 10,
    specialPassive: 'Pet explosions stun small enemies for 0.5s',
    unlocked: false,
  },

  // ===================== BRACELETS & LOCKETS =====================
  {
    id: 'bracelet_frozen',
    name: 'Frozen Bracelet',
    slot: 'bracelet',
    rarity: 'rare',
    description: 'Frost-encrusted bangle that instantly chills room enemies upon entry.',
    icon: '🧊',
    attackBonus: 30,
    hpBonus: 200,
    speedBonus: 0,
    critBonus: 5,
    specialPassive: 'Freezes 3 random enemies for 2.0s upon entering any room',
    unlocked: true,
  },
  {
    id: 'bracelet_thunder',
    name: 'Thunder Bracelet',
    slot: 'bracelet',
    rarity: 'epic',
    description: 'Charged with ionic storm energy. Summons lightning upon room entry.',
    icon: '⚡',
    attackBonus: 65,
    hpBonus: 350,
    speedBonus: 5,
    critBonus: 7,
    specialPassive: 'Strikes lightning on all enemies dealing 120% attack upon room entry',
    unlocked: false,
  },
  {
    id: 'bracelet_quickshot',
    name: 'Quickshot Bracelet',
    slot: 'bracelet',
    rarity: 'legendary',
    description: 'Precision shooting wristguard that gives blazing arrow volleys.',
    icon: '💫',
    attackBonus: 130,
    hpBonus: 600,
    speedBonus: 15,
    critBonus: 12,
    specialPassive: 'Increases hero arrow velocity by +35% and gives +15% Attack',
    unlocked: false,
  },
  {
    id: 'locket_agile',
    name: 'Agile Locket',
    slot: 'locket',
    rarity: 'rare',
    description: 'Pendant containing a wind fairy that grants supreme reflexes near death.',
    icon: '📿',
    attackBonus: 15,
    hpBonus: 400,
    speedBonus: 0,
    critBonus: 0,
    dodgeBonus: 15,
    specialPassive: '+20% Dodge Rate when HP drops below 30%',
    unlocked: true,
  },
  {
    id: 'locket_angel',
    name: 'Angel Locket',
    slot: 'locket',
    rarity: 'epic',
    description: 'Blessed with divine grace. Grants a chance to revive upon lethal defeat.',
    icon: '👼',
    attackBonus: 40,
    hpBonus: 850,
    speedBonus: 0,
    critBonus: 5,
    specialPassive: '25% chance to revive with 30% Max HP and 2s invincibility',
    unlocked: false,
  },
  {
    id: 'locket_bloodthirsty',
    name: 'Bloodthirsty Locket',
    slot: 'locket',
    rarity: 'legendary',
    description: 'Vampiric ruby pendant that restores vitality upon executing enemies.',
    icon: '🩸',
    attackBonus: 95,
    hpBonus: 1400,
    speedBonus: 10,
    critBonus: 10,
    specialPassive: 'Restores +3% Max HP whenever an enemy is defeated',
    unlocked: false,
  },

  // ===================== SPELLBOOKS =====================
  {
    id: 'book_arcane',
    name: 'Arcane Archer Book',
    slot: 'book',
    rarity: 'rare',
    description: 'Ancient tome that channels mana into arrow barrage storms.',
    icon: '📖',
    attackBonus: 35,
    hpBonus: 300,
    speedBonus: 0,
    critBonus: 6,
    specialPassive: 'Ultimate: Unleashes a storm of +2 front arrows with boosted damage',
    unlocked: true,
  },
  {
    id: 'book_combat',
    name: 'Art of Combat',
    slot: 'book',
    rarity: 'epic',
    description: 'Tactical combat codex that builds combat rage with every kill.',
    icon: '📕',
    attackBonus: 70,
    hpBonus: 650,
    speedBonus: 10,
    critBonus: 8,
    specialPassive: 'Killing an enemy grants +25% Attack and +15% Knockback for 4s',
    unlocked: false,
  },
  {
    id: 'book_enlightenment',
    name: 'Enlightenment Book',
    slot: 'book',
    rarity: 'legendary',
    description: 'Sacred celestial scriptures that bestow divine abilities during trials.',
    icon: '✨',
    attackBonus: 120,
    hpBonus: 1200,
    speedBonus: 10,
    critBonus: 10,
    specialPassive: 'Grants 1 extra random permanent ability upgrade during every 10th room',
    unlocked: false,
  },
];

export const TALENTS_DEF: TalentNode[] = [
  {
    id: 'strength',
    name: 'Strength',
    description: 'Increases permanent base attack damage.',
    icon: '⚔️',
    level: 0,
    maxLevel: 25,
    baseCost: 100,
    costMultiplier: 1.35,
    statBonusText: '+8 Attack / lvl',
  },
  {
    id: 'vitality',
    name: 'Vitality',
    description: 'Increases permanent maximum health points.',
    icon: '❤️',
    level: 0,
    maxLevel: 25,
    baseCost: 80,
    costMultiplier: 1.3,
    statBonusText: '+80 Max HP / lvl',
  },
  {
    id: 'iron_skin',
    name: 'Iron Skin',
    description: 'Increases permanent damage reduction armor.',
    icon: '🛡️',
    level: 0,
    maxLevel: 20,
    baseCost: 150,
    costMultiplier: 1.45,
    statBonusText: '+1.5% Damage Reduction / lvl',
  },
  {
    id: 'swiftness',
    name: 'Swiftness',
    description: 'Increases permanent character move speed and agility.',
    icon: '👟',
    level: 0,
    maxLevel: 15,
    baseCost: 120,
    costMultiplier: 1.38,
    statBonusText: '+3% Move Speed / lvl',
  },
  {
    id: 'precision',
    name: 'Precision',
    description: 'Increases lethal critical strike chance.',
    icon: '🎯',
    level: 0,
    maxLevel: 20,
    baseCost: 200,
    costMultiplier: 1.5,
    statBonusText: '+1.5% Crit Chance / lvl',
  },
  {
    id: 'prosperity',
    name: 'Prosperity',
    description: 'Increases Gold drops and Exp absorption radius.',
    icon: '💰',
    level: 0,
    maxLevel: 15,
    baseCost: 100,
    costMultiplier: 1.28,
    statBonusText: '+10% Gold Drop / lvl',
  },
  {
    id: 'glory',
    name: 'Glory',
    description: 'Begin every dungeon run with 1 extra skill choice right at Room 1.',
    icon: '👑',
    level: 0,
    maxLevel: 5,
    baseCost: 500,
    costMultiplier: 2.0,
    statBonusText: 'Start with 1 Skill Choice',
  },
];

const INITIAL_INVENTORY_IDS = [
  'weapon_bow',
  'weapon_sawblade',
  'weapon_tornado',
  'weapon_scythe',
  'armor_dexterity',
  'armor_golden',
  'armor_phantom',
  'ring_wolf',
  'ring_falcon',
  'ring_bear',
  'ring_serpent',
  'pet_bat',
  'bracelet_frozen',
  'locket_agile',
  'book_arcane',
];

const DEFAULT_SAVE: SaveData = {
  gold: 450,
  gems: 40,
  energy: 20,
  maxEnergy: 20,
  lastEnergyTime: Date.now(),
  selectedChapter: 5, // Default to chapter 5 (Lava Land) or 1
  highestRoom: 35,
  highestChapter: 5,
  chapterRecords: {
    1: 50,
    2: 50,
    3: 50,
    4: 50,
    5: 35,
    6: 12,
    7: 1,
    8: 1,
  },
  gameMode: 'normal',
  totalKills: 280,
  talents: {
    strength: 3,
    vitality: 4,
    iron_skin: 2,
    swiftness: 2,
    precision: 2,
    prosperity: 1,
    glory: 1,
  },
  equipped: {
    weapon: 'weapon_scythe',
    armor: 'armor_phantom',
    ring1: 'ring_wolf',
    ring2: 'ring_bear',
    pet: 'pet_bat',
    bracelet: 'bracelet_frozen',
    locket: 'locket_agile',
    book: 'book_arcane',
  },
  inventory: ALL_EQUIPMENT_CATALOG.filter(item => INITIAL_INVENTORY_IDS.includes(item.id)),
  dailyGiftClaimed: false,
  milestonesClaimed: [1, 2, 3],
  selectedHero: 'atreus',
  heroLevels: { atreus: 5, urasil: 3, phoren: 1 },
  unlockedHeroes: ['atreus', 'urasil', 'phoren'],
  incubatingEggs: [
    {
      id: 'egg_1',
      name: 'Laser Bat Egg',
      tier: 'rare',
      icon: '🦇',
      progressKills: 18,
      targetKills: 25,
      hatched: false,
      rewardPetId: 'pet_bat',
    },
    {
      id: 'egg_2',
      name: 'Flaming Ghost Egg',
      tier: 'normal',
      icon: '👻',
      progressKills: 10,
      targetKills: 10,
      hatched: true,
      rewardPetId: 'pet_ghost',
    },
  ],
  loginStreakDay: 3,
  completedQuests: ['quest_1'],
  expeditionFloor: 12,
};

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE;
    const parsed = JSON.parse(raw);

    // Calculate regenerated energy (+1 per 5 minutes = 300000ms)
    let currentEnergy = typeof parsed.energy === 'number' ? parsed.energy : DEFAULT_SAVE.energy;
    const maxEnergy = 20;
    const lastTime = parsed.lastEnergyTime || Date.now();
    const elapsedMs = Date.now() - lastTime;
    const recovered = Math.floor(elapsedMs / (5 * 60 * 1000));
    if (recovered > 0 && currentEnergy < maxEnergy) {
      currentEnergy = Math.min(maxEnergy, currentEnergy + recovered);
    }

    // Ensure inventory has valid objects
    let inventoryItems: EquipmentItem[] = [];
    if (Array.isArray(parsed.inventory) && parsed.inventory.length > 0) {
      inventoryItems = parsed.inventory;
    } else {
      inventoryItems = DEFAULT_SAVE.inventory;
    }

    return {
      ...DEFAULT_SAVE,
      ...parsed,
      energy: currentEnergy,
      lastEnergyTime: Date.now(),
      talents: { ...DEFAULT_SAVE.talents, ...(parsed.talents || {}) },
      equipped: { ...DEFAULT_SAVE.equipped, ...(parsed.equipped || {}) },
      chapterRecords: { ...DEFAULT_SAVE.chapterRecords, ...(parsed.chapterRecords || {}) },
      inventory: inventoryItems,
    };
  } catch {
    return DEFAULT_SAVE;
  }
}

export function saveSaveData(data: SaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
  }
}

export function openChest(
  type: 'golden' | 'obsidian',
  save: SaveData
): { item: EquipmentItem; updatedSave: SaveData } | null {
  const goldCost = type === 'golden' ? 150 : 0;
  const gemCost = type === 'obsidian' ? 30 : 0;

  if (type === 'golden' && save.gold < goldCost) return null;
  if (type === 'obsidian' && save.gems < gemCost) return null;

  // Filter pool based on chest tier
  let pool = ALL_EQUIPMENT_CATALOG;
  if (type === 'obsidian') {
    pool = ALL_EQUIPMENT_CATALOG.filter(i => ['rare', 'epic', 'perfect_epic', 'legendary', 'mythic'].includes(i.rarity));
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  const drawnItem = { ...pool[randomIndex], id: `${pool[randomIndex].id}_${Date.now()}` };

  const updatedInventory = [...save.inventory, drawnItem];

  const updatedSave: SaveData = {
    ...save,
    gold: save.gold - goldCost,
    gems: save.gems - gemCost,
    inventory: updatedInventory,
  };

  saveSaveData(updatedSave);
  return { item: drawnItem, updatedSave };
}

export const ALL_EQUIPMENT = ALL_EQUIPMENT_CATALOG;
