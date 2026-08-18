export type ElementType = 'none' | 'blaze' | 'poison' | 'freeze' | 'lightning';

export interface PlayerStats {
  maxHp: number;
  currentHp: number;
  baseAttack: number;
  attackSpeed: number; // Attacks per second (e.g. 1.2)
  moveSpeed: number; // Pixels per second (e.g. 240)
  critChance: number; // Decimal (0.1 = 10%)
  critDamage: number; // Multiplier (2.0 = 200%)
  damageReduction: number; // Decimal (0.05 = 5%)
  dodgeChance: number; // Decimal (0.07 = 7%)
  attackRange: number; // In pixels (e.g. 460)
  magnetRadius: number; // In pixels (e.g. 130)

  // Projectile modifiers
  frontArrows: number; // 1 = standard, 2 = +1 front arrow
  multishot: number; // Number of sequential shot bursts
  diagonalArrows: boolean;
  sideArrows: boolean;
  rearArrow: boolean;
  piercingCount: number; // Times arrow can pierce
  ricochetBounces: number; // Times arrow can bounce to nearby enemy
  bouncyWall: boolean; // Bounces off room perimeter
  elements: ElementType[]; // Active elemental effects
  bloodthirst: boolean; // Heal on kill
  shieldOrbs: number; // Number of orbiting shields
  weaponType?: string; // e.g. 'staff', 'scythe', 'blade', 'spear', 'bow'
}

export type SkillRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemRarity = 'common' | 'great' | 'rare' | 'epic' | 'perfect_epic' | 'legendary' | 'mythic';

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: SkillRarity;
  stackable: boolean;
  apply: (stats: PlayerStats) => PlayerStats;
}

export type EnemyType = 'stalker' | 'sniper' | 'charger' | 'bat' | 'golem' | 'fire_skull' | 'sand_worm' | 'boss_minotaur' | 'boss_dragon' | 'boss_golem';

export interface EnemyStats {
  type: EnemyType;
  name: string;
  maxHp: number;
  currentHp: number;
  damage: number;
  speed: number;
  attackRange?: number;
  color: number;
  radius: number;
  expValue: number;
  coinValue: number;
}

export interface FloatingTextData {
  x: number;
  y: number;
  text: string;
  color: string;
  isCrit?: boolean;
}

export type RoomType = 'normal' | 'elite' | 'angel' | 'chest' | 'boss';

export interface RoomConfig {
  roomNumber: number;
  roomType: RoomType;
  obstacles: Array<{ x: number; y: number; width: number; height: number; type: 'rock' | 'water' | 'pillar' | 'lava' }>;
  spikes: Array<{ x: number; y: number }>;
  enemySpawns: Array<{ type: EnemyType; x: number; y: number }>;
}

export interface TalentNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  statBonusText: string;
}

export type EquipmentSlot = 'weapon' | 'armor' | 'ring1' | 'ring2' | 'pet' | 'bracelet' | 'locket' | 'book';

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  description: string;
  icon: string;
  attackBonus: number;
  hpBonus: number;
  speedBonus: number;
  critBonus: number;
  dodgeBonus?: number;
  specialPassive?: string;
  level?: number;
  unlocked: boolean;
}

export type ChapterTheme = 'verdant' | 'dungeon' | 'desert' | 'crystal' | 'lava' | 'sky' | 'void' | 'peak';

export interface ChapterDefinition {
  id: number;
  numberPrefix: string;
  name: string;
  stagesCount: number;
  theme: ChapterTheme;
  description: string;
  recommendedAtk: number;
  recommendedHp: number;
  icon: string;
  bossName: string;
  themeColors: {
    floorPrimary: number;
    floorSecondary: number;
    wallColor: number;
    accentColor: string;
    ambientGlow: string;
  };
}

export type AngelBlessingType = 'heal' | 'attack' | 'max_hp' | 'holy_shield';

export interface HeroDefinition {
  id: string;
  name: string;
  title: string;
  icon: string;
  baseAttackBonus: number;
  baseHpBonus: number;
  speedBonus: number;
  passiveName: string;
  passiveDesc: string;
  element?: ElementType;
  unlocked: boolean;
  unlockCostGems: number;
}

export interface IncubatingEgg {
  id: string;
  name: string;
  tier: 'normal' | 'rare' | 'mythic';
  icon: string;
  progressKills: number;
  targetKills: number;
  hatched: boolean;
  rewardPetId: string;
}

export interface QuestItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  target: number;
  current: number;
  rewardType: 'gold' | 'gems' | 'energy';
  rewardAmount: number;
  claimed: boolean;
}

export interface SaveData {
  gold: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  lastEnergyTime: number;
  selectedChapter: number;
  highestRoom: number;
  highestChapter: number;
  chapterRecords: Record<number, number>; // chapterId -> highest room reached
  gameMode: 'normal' | 'hero';
  totalKills: number;
  talents: Record<string, number>; // talentId -> level
  equipped: Partial<Record<EquipmentSlot, string>>; // slot -> itemId
  inventory: EquipmentItem[];
  selectedHero: string;
  heroLevels: Record<string, number>;
  unlockedHeroes: string[];
  incubatingEggs: IncubatingEgg[];
  loginStreakDay: number;
  lastDailyClaimTime?: number;
  dailyGiftClaimed: boolean;
  milestonesClaimed: number[];
  completedQuests: string[];
  expeditionFloor: number;
}
