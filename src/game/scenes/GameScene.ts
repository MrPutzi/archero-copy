import Phaser from 'phaser';
import { sound } from '../../audio/soundFx';
import { ALL_HEROES } from '../heroes';
import { ALL_EQUIPMENT, loadSaveData, saveSaveData } from '../persistence';
import { ALL_SKILLS, getRandomSkills } from '../skills';
import { createProceduralTextures } from '../textures';
import { AngelBlessingType, ElementType, EnemyStats, EnemyType, PlayerStats, RoomConfig, RoomType } from '../../types/game';

interface ActiveEnemy {
  sprite: Phaser.Physics.Arcade.Sprite;
  stats: EnemyStats;
  hpBar: Phaser.GameObjects.Graphics;
  aiTimer: number;
  chargeState?: 'idle' | 'telegraph' | 'dashing';
  chargeVector?: { x: number; y: number };
  chargeTimer?: number;
  sniperState?: 'aiming' | 'cooldown';
  aimTimer?: number;
  aimAngle?: number;
  telegraphGfx?: Phaser.GameObjects.Graphics;
  bossPhase?: number;
  bossTimer?: number;
  bossEnraged?: boolean;
  spawnMinionTimer?: number;
  poisonTicksLeft?: number;
  blazeTicksLeft?: number;
  frozenTimer?: number;
}

interface ProjectileData {
  sprite: Phaser.Physics.Arcade.Sprite;
  damage: number;
  isCrit: boolean;
  piercesLeft: number;
  ricochetsLeft: number;
  bouncesLeft: number;
  elements: ElementType[];
  hitEnemies: Set<Phaser.GameObjects.GameObject>;
}

export class GameScene extends Phaser.Scene {
  // Player
  public player!: Phaser.Physics.Arcade.Sprite;
  public playerStats!: PlayerStats;
  private isMoving: boolean = false;
  private inputVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private attackTimer: number = 0;
  private chosenSkillIds: string[] = [];

  // Progression
  public currentRoomNumber: number = 1;
  public currentExp: number = 0;
  public expToNextLevel: number = 100;
  public playerLevel: number = 1;
  public goldEarnedThisRun: number = 0;
  public totalKillsThisRun: number = 0;
  public isRoomCleared: boolean = false;

  // Groups & Entities
  private enemies: ActiveEnemy[] = [];
  private playerProjectiles: ProjectileData[] = [];
  private enemyProjectiles: Phaser.Physics.Arcade.Sprite[] = [];
  private expGems: Phaser.Physics.Arcade.Sprite[] = [];
  private coins: Phaser.Physics.Arcade.Sprite[] = [];
  private hearts: Phaser.Physics.Arcade.Sprite[] = [];
  private obstacles: Phaser.Physics.Arcade.StaticGroup[] = [];
  private spikeTraps: Array<{ sprite: Phaser.GameObjects.Sprite; x: number; y: number; active: boolean; timer: number }> = [];
  private exitDoor: Phaser.GameObjects.Sprite | null = null;
  private angelNpc: Phaser.GameObjects.Sprite | null = null;
  private angelAltarGfx: Phaser.GameObjects.Graphics | null = null;
  private angelHaloGfx: Phaser.GameObjects.Arc | null = null;
  private angelVisited: boolean = false;
  private chestNpc: Phaser.GameObjects.Sprite | null = null;
  private shieldOrbs: Phaser.GameObjects.Sprite[] = [];
  private shieldOrbAngle: number = 0;

  // Visuals & FX
  private aimingLineGfx!: Phaser.GameObjects.Graphics;
  private damageTextGroup!: Phaser.GameObjects.Group;
  private healthBarGfx!: Phaser.GameObjects.Graphics;
  private touchTargetIndicator!: Phaser.GameObjects.Arc;

  // Room Bounds
  private readonly ARENA_MIN_X = 40;
  private readonly ARENA_MAX_X = 500;
  private readonly ARENA_MIN_Y = 120;
  private readonly ARENA_MAX_Y = 880;

  // External event callbacks to React UI
  public onHpChange?: (current: number, max: number) => void;
  public onExpChange?: (current: number, max: number, level: number) => void;
  public onGoldChange?: (gold: number) => void;
  public onRoomChange?: (room: number, type: RoomType) => void;
  public onLevelUp?: (skills: any[]) => void;
  public onAngelEncounter?: () => void;
  public onGameOver?: (metrics: { room: number; kills: number; gold: number; won: boolean }) => void;

  constructor() {
    super('GameScene');
  }

  public init() {
    // Initialize base stats merged with saved gear and talents
    const save = loadSaveData();
    let baseAtk = 45 + (save.talents.strength || 0) * 6;
    let maxHp = 600 + (save.talents.vitality || 0) * 60;
    let dmgRed = (save.talents.iron_skin || 0) * 0.015;
    let moveSpd = 230 * (1 + (save.talents.swiftness || 0) * 0.03);
    let critCh = 0.08 + (save.talents.precision || 0) * 0.015;
    let dodgeCh = 0.0;

    // Apply equipped gear bonuses
    Object.values(save.equipped).forEach(gearId => {
      const item = ALL_EQUIPMENT.find(e => e.id === gearId);
      if (item) {
        baseAtk += item.attackBonus;
        maxHp += item.hpBonus;
        critCh += (item.critBonus || 0) * 0.01;
        if (item.dodgeBonus) dodgeCh += item.dodgeBonus * 0.01;
        if (item.speedBonus) moveSpd += item.speedBonus;
      }
    });

    // Apply active Hero perks
    const activeHero = ALL_HEROES.find(h => h.id === save.selectedHero) || ALL_HEROES[0];
    baseAtk += activeHero.baseAttackBonus;
    maxHp += activeHero.baseHpBonus;
    moveSpd += activeHero.speedBonus;
    if (activeHero.id === 'shade') {
      critCh += 0.12;
      dodgeCh += 0.10;
    }

    const innateElements: ElementType[] = [];
    if (activeHero.element) {
      innateElements.push(activeHero.element);
    }

    this.playerStats = {
      maxHp,
      currentHp: maxHp,
      baseAttack: baseAtk,
      attackSpeed: 1.3,
      moveSpeed: Math.round(moveSpd),
      critChance: Number(critCh.toFixed(3)),
      critDamage: 2.0,
      damageReduction: Number(dmgRed.toFixed(3)),
      dodgeChance: Number(dodgeCh.toFixed(3)),
      attackRange: 460,
      magnetRadius: 130 + (save.talents.prosperity || 0) * 10,
      frontArrows: 1,
      multishot: 0,
      diagonalArrows: false,
      sideArrows: false,
      rearArrow: false,
      piercingCount: 0,
      ricochetBounces: 0,
      bouncyWall: false,
      elements: innateElements,
      bloodthirst: false,
      shieldOrbs: 0,
    };

    this.currentRoomNumber = 1;
    this.currentExp = 0;
    this.expToNextLevel = 80;
    this.playerLevel = 1;
    this.goldEarnedThisRun = 0;
    this.totalKillsThisRun = 0;
    this.chosenSkillIds = [];
    this.isRoomCleared = false;
    this.enemies = [];
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.expGems = [];
    this.coins = [];
    this.hearts = [];
    this.spikeTraps = [];
    this.shieldOrbs = [];
  }

  public create() {
    createProceduralTextures(this);

    // Build Background Arena
    this.buildArenaBackground();

    // Player Sprite
    this.player = this.physics.add.sprite(270, 780, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body?.setSize(28, 28);
    this.player.body?.setOffset(10, 14);
    this.player.setDepth(20);

    // Aiming graphics line
    this.aimingLineGfx = this.add.graphics().setDepth(15);

    // Target indicator circle
    this.touchTargetIndicator = this.add.circle(0, 0, 16, 0xef4444, 0.25).setVisible(false).setDepth(14);

    // Overhead Health bar graphics
    this.healthBarGfx = this.add.graphics().setDepth(25);

    // Damage text group
    this.damageTextGroup = this.add.group();

    // Spawn first room
    this.loadRoom(this.currentRoomNumber);

    // Setup input listeners for desktop
    this.setupKeyboardInput();

    // Initial callbacks
    this.notifyUi();
  }

  private buildArenaBackground() {
    // Tiled Floor
    const cols = 14;
    const rows = 24;
    const tileSize = 40;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * tileSize + 20;
        const y = r * tileSize + 20;
        const tile = this.add.image(x, y, 'floor_tile').setDepth(1);
        if ((r + c) % 2 === 0) {
          tile.setTint(0xe2e8f0);
        }
      }
    }

    // Border walls & Torches
    const wallGfx = this.add.graphics().setDepth(5);
    // Outer border
    wallGfx.fillStyle(0x090d16, 1);
    wallGfx.fillRect(0, 0, 540, 96); // Top header area
    wallGfx.fillRect(0, 896, 540, 64); // Bottom border
    wallGfx.fillRect(0, 0, 32, 960); // Left wall
    wallGfx.fillRect(508, 0, 32, 960); // Right wall

    // Stone rim
    wallGfx.lineStyle(4, 0x334155, 1);
    wallGfx.strokeRect(32, 96, 476, 800);
  }

  private setupKeyboardInput() {
    if (!this.input.keyboard) return;

    this.input.keyboard.on('keydown', () => {
      // Audio init trigger on first user gesture
    });
  }

  public setVirtualJoystick(vector: { x: number; y: number }) {
    this.inputVector.set(vector.x, vector.y);
  }

  public applySkillSelection(skillId: string) {
    const skill = ALL_SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    this.playerStats = skill.apply(this.playerStats);
    this.chosenSkillIds.push(skill.id);

    // Check if shield orbs were added
    this.syncShieldOrbs();

    sound.playLevelUp();
    this.notifyUi();
  }

  private syncShieldOrbs() {
    // Clear old orbs
    this.shieldOrbs.forEach(orb => orb.destroy());
    this.shieldOrbs = [];

    const count = this.playerStats.shieldOrbs || 0;
    for (let i = 0; i < count; i++) {
      const orb = this.physics.add.sprite(this.player.x, this.player.y, 'shield_orb');
      orb.setDepth(22);
      this.shieldOrbs.push(orb);
    }
  }

  public loadRoom(roomNumber: number) {
    this.currentRoomNumber = roomNumber;
    this.isRoomCleared = false;

    // Reset player position to room entrance bottom
    this.player.setPosition(270, 820);
    this.player.setVelocity(0, 0);

    // Clean up old entities
    this.enemies.forEach(e => {
      e.sprite.destroy();
      e.hpBar.destroy();
      if (e.telegraphGfx) e.telegraphGfx.destroy();
    });
    this.enemies = [];

    this.playerProjectiles.forEach(p => p.sprite.destroy());
    this.playerProjectiles = [];

    this.enemyProjectiles.forEach(p => p.destroy());
    this.enemyProjectiles = [];

    this.expGems.forEach(g => g.destroy());
    this.expGems = [];

    this.coins.forEach(c => c.destroy());
    this.coins = [];

    this.hearts.forEach(h => h.destroy());
    this.hearts = [];

    this.spikeTraps.forEach(s => s.sprite.destroy());
    this.spikeTraps = [];

    if (this.exitDoor) {
      this.exitDoor.destroy();
      this.exitDoor = null;
    }

    if (this.angelNpc) {
      this.angelNpc.destroy();
      this.angelNpc = null;
    }

    if (this.angelAltarGfx) {
      this.angelAltarGfx.destroy();
      this.angelAltarGfx = null;
    }

    if (this.angelHaloGfx) {
      this.angelHaloGfx.destroy();
      this.angelHaloGfx = null;
    }

    if (this.chestNpc) {
      this.chestNpc.destroy();
      this.chestNpc = null;
    }

    // Determine Room Type (Every stage ending in 5 is Angel Room, every 10 is Boss)
    let roomType: RoomType = 'normal';
    if (roomNumber % 10 === 0) {
      roomType = 'boss';
    } else if (roomNumber % 10 === 5) {
      roomType = 'angel';
    } else if (roomNumber % 10 === 3 || roomNumber % 10 === 7) {
      roomType = 'elite';
    }

    if (this.onRoomChange) {
      this.onRoomChange(roomNumber, roomType);
    }

    // Spawn Room Contents
    if (roomType === 'angel') {
      this.spawnAngelRoom();
    } else if (roomType === 'boss') {
      this.spawnBossRoom(roomNumber);
    } else {
      this.spawnCombatRoom(roomNumber, roomType === 'elite');
    }

    this.notifyUi();
  }

  private spawnCombatRoom(roomNumber: number, isElite: boolean) {
    const enemyCount = Math.min(3 + Math.floor(roomNumber * 0.4), isElite ? 8 : 6);
    const types: EnemyType[] = ['stalker', 'sniper', 'charger'];

    // Spawn Spikes Hazard Traps
    const spikeCount = Math.min(2 + Math.floor(roomNumber / 8), 5);
    for (let i = 0; i < spikeCount; i++) {
      const sx = Phaser.Math.Between(80, 460);
      const sy = Phaser.Math.Between(240, 700);
      const spikeSprite = this.add.sprite(sx, sy, 'spike_trap').setDepth(3);
      this.spikeTraps.push({
        sprite: spikeSprite,
        x: sx,
        y: sy,
        active: false,
        timer: i * 800, // Staggered timers
      });
    }

    // Spawn enemies in top/mid area
    for (let i = 0; i < enemyCount; i++) {
      const type = types[Phaser.Math.Between(0, types.length - 1)];
      const ex = Phaser.Math.Between(80, 460);
      const ey = Phaser.Math.Between(180, 520);
      this.createEnemy(type, ex, ey, roomNumber, isElite);
    }
  }

  private spawnBossRoom(roomNumber: number) {
    const isDragon = roomNumber >= 20;
    const bossType: EnemyType = isDragon ? 'boss_dragon' : 'boss_minotaur';
    const hpScaling = 1 + roomNumber * 0.25;

    const stats: EnemyStats = {
      type: bossType,
      name: isDragon ? 'Void Archon Dragon' : 'Minotaur Warlord',
      maxHp: Math.round((isDragon ? 2800 : 1800) * hpScaling),
      currentHp: Math.round((isDragon ? 2800 : 1800) * hpScaling),
      damage: Math.round(55 * (1 + roomNumber * 0.1)),
      speed: 110,
      color: isDragon ? 0x6366f1 : 0xdc2626,
      radius: 40,
      expValue: 120,
      coinValue: 50,
    };

    const sprite = this.physics.add.sprite(270, 300, bossType);
    sprite.setCollideWorldBounds(true);
    sprite.setDepth(18);
    sprite.body?.setSize(64, 64);

    const hpBar = this.add.graphics().setDepth(26);

    const activeBoss: ActiveEnemy = {
      sprite,
      stats,
      hpBar,
      aiTimer: 0,
      bossPhase: 1,
      bossTimer: 0,
      bossEnraged: false,
      spawnMinionTimer: 0,
    };

    this.enemies.push(activeBoss);

    // Screen camera rumble for boss entrance
    this.cameras.main.shake(400, 0.015);
    sound.playBossCharge();
  }

  private spawnAngelRoom() {
    this.isRoomCleared = true;
    this.angelVisited = false;

    // Sacred Sanctuary Altar Platform
    this.angelAltarGfx = this.add.graphics().setDepth(2);
    // Outer golden sanctuary circle
    this.angelAltarGfx.lineStyle(3, 0xfde047, 0.7);
    this.angelAltarGfx.strokeCircle(270, 420, 75);
    this.angelAltarGfx.fillStyle(0xfef08a, 0.12);
    this.angelAltarGfx.fillCircle(270, 420, 75);
    // Inner runic circle
    this.angelAltarGfx.lineStyle(1.5, 0xffffff, 0.5);
    this.angelAltarGfx.strokeCircle(270, 420, 50);

    // Place Angel in Center
    this.angelNpc = this.add.sprite(270, 420, 'angel').setDepth(15);
    this.tweens.add({
      targets: this.angelNpc,
      y: 405,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Radiant halo light particles
    this.angelHaloGfx = this.add.circle(270, 420, 42, 0xfde047, 0.25).setDepth(14);
    this.tweens.add({
      targets: this.angelHaloGfx,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Open Door immediately for angel room
    this.openExitDoor();
  }

  public applyAngelBlessing(blessingType: AngelBlessingType) {
    if (blessingType === 'heal') {
      const healAmount = Math.round(this.playerStats.maxHp * 0.4);
      this.healPlayer(healAmount);
      this.spawnFloatingText(this.player.x, this.player.y - 30, `+${healAmount} HP`, '#10b981', true);
      this.spawnHitSparks(this.player.x, this.player.y, 0x10b981);
    } else if (blessingType === 'attack') {
      this.playerStats.baseAttack = Math.round(this.playerStats.baseAttack * 1.15);
      this.playerStats.attackSpeed = Number((this.playerStats.attackSpeed * 1.10).toFixed(2));
      this.spawnFloatingText(this.player.x, this.player.y - 30, '+15% ATK & +10% SPD', '#f59e0b', true);
      this.spawnHitSparks(this.player.x, this.player.y, 0xf59e0b);
    } else if (blessingType === 'max_hp') {
      const bonusHp = Math.round(this.playerStats.maxHp * 0.20);
      this.playerStats.maxHp += bonusHp;
      this.playerStats.currentHp = Math.min(this.playerStats.maxHp, this.playerStats.currentHp + bonusHp);
      this.spawnFloatingText(this.player.x, this.player.y - 30, `+${bonusHp} MAX HP`, '#0ea5e9', true);
      this.spawnHitSparks(this.player.x, this.player.y, 0x0ea5e9);
    } else if (blessingType === 'holy_shield') {
      this.playerStats.shieldOrbs = (this.playerStats.shieldOrbs || 0) + 1;
      this.syncShieldOrbs();
      this.spawnFloatingText(this.player.x, this.player.y - 30, '+1 HOLY SHIELD', '#38bdf8', true);
      this.spawnHitSparks(this.player.x, this.player.y, 0x38bdf8);
    }

    sound.playLevelUp();
    this.notifyUi();

    // Ascend and dismiss Angel sprite with holy burst
    if (this.angelNpc) {
      const angelRef = this.angelNpc;
      this.tweens.killTweensOf(angelRef);
      this.tweens.add({
        targets: angelRef,
        y: angelRef.y - 90,
        alpha: 0,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 800,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          angelRef.destroy();
          if (this.angelNpc === angelRef) {
            this.angelNpc = null;
          }
        },
      });
    }

    if (this.angelHaloGfx) {
      this.tweens.killTweensOf(this.angelHaloGfx);
      this.angelHaloGfx.destroy();
      this.angelHaloGfx = null;
    }
  }

  private createEnemy(type: EnemyType, x: number, y: number, roomNumber: number, isElite: boolean = false) {
    const scale = 1 + roomNumber * 0.12;
    const eliteMultiplier = isElite ? 1.8 : 1.0;

    let stats: EnemyStats;
    if (type === 'stalker') {
      stats = {
        type,
        name: isElite ? 'Elite Stalker' : 'Stalker',
        maxHp: Math.round(130 * scale * eliteMultiplier),
        currentHp: Math.round(130 * scale * eliteMultiplier),
        damage: Math.round(22 * (1 + roomNumber * 0.08) * eliteMultiplier),
        speed: Math.round(95 + (isElite ? 25 : 0)),
        color: 0x22c55e,
        radius: 20,
        expValue: Math.round(25 * (isElite ? 2 : 1)),
        coinValue: Math.round(8 * (isElite ? 2 : 1)),
      };
    } else if (type === 'sniper') {
      stats = {
        type,
        name: isElite ? 'Elite Sniper' : 'Sniper',
        maxHp: Math.round(100 * scale * eliteMultiplier),
        currentHp: Math.round(100 * scale * eliteMultiplier),
        damage: Math.round(28 * (1 + roomNumber * 0.08) * eliteMultiplier),
        speed: 70,
        attackRange: 420,
        color: 0x7c3aed,
        radius: 18,
        expValue: Math.round(30 * (isElite ? 2 : 1)),
        coinValue: Math.round(10 * (isElite ? 2 : 1)),
      };
    } else {
      // Charger
      stats = {
        type,
        name: isElite ? 'Armored Charger' : 'Charger',
        maxHp: Math.round(180 * scale * eliteMultiplier),
        currentHp: Math.round(180 * scale * eliteMultiplier),
        damage: Math.round(35 * (1 + roomNumber * 0.08) * eliteMultiplier),
        speed: 85,
        color: 0xb91c1c,
        radius: 22,
        expValue: Math.round(35 * (isElite ? 2 : 1)),
        coinValue: Math.round(12 * (isElite ? 2 : 1)),
      };
    }

    const sprite = this.physics.add.sprite(x, y, type);
    sprite.setCollideWorldBounds(true);
    sprite.setDepth(16);
    sprite.body?.setSize(28, 28);
    if (isElite) {
      sprite.setScale(1.2);
    }

    const hpBar = this.add.graphics().setDepth(24);
    let telegraphGfx: Phaser.GameObjects.Graphics | undefined;

    if (type === 'sniper' || type === 'charger') {
      telegraphGfx = this.add.graphics().setDepth(12);
    }

    this.enemies.push({
      sprite,
      stats,
      hpBar,
      aiTimer: Phaser.Math.Between(0, 500),
      chargeState: 'idle',
      sniperState: 'cooldown',
      telegraphGfx,
    });
  }

  private openExitDoor() {
    if (this.exitDoor) return;

    sound.playDoorOpen();
    this.exitDoor = this.add.sprite(270, 120, 'door_portal').setDepth(8);

    // Glowing animation
    this.tweens.add({
      targets: this.exitDoor,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  public update(time: number, delta: number) {
    if (this.scene.isPaused('GameScene')) return;

    this.handlePlayerInput(delta);
    this.updateShieldOrbs(delta);
    this.updateSpikes(delta);
    this.updateEnemies(delta);
    this.updateProjectiles(delta);
    this.updatePickups(delta);
    this.updateHudAndOverheads();
    this.checkRoomClearCondition();
  }

  private handlePlayerInput(delta: number) {
    // 1. Keyboard Arrow/WASD input
    let kx = 0;
    let ky = 0;
    const cursors = this.input.keyboard?.createCursorKeys();
    const wasd = this.input.keyboard?.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as any;

    if (cursors?.left.isDown || wasd?.left.isDown) kx -= 1;
    if (cursors?.right.isDown || wasd?.right.isDown) kx += 1;
    if (cursors?.up.isDown || wasd?.up.isDown) ky -= 1;
    if (cursors?.down.isDown || wasd?.down.isDown) ky += 1;

    let moveVec = new Phaser.Math.Vector2(kx, ky);
    if (moveVec.length() > 0) {
      moveVec.normalize();
    }

    // Merge with Virtual Touch Joystick if active
    if (this.inputVector.length() > 0.05) {
      moveVec = this.inputVector.clone();
    }

    const mag = moveVec.length();

    if (mag > 0.1) {
      // MOVING State
      this.isMoving = true;
      const speed = this.playerStats.moveSpeed;
      this.player.setVelocity(moveVec.x * speed, moveVec.y * speed);

      // Face direction of movement
      this.player.setFlipX(moveVec.x < 0);

      // Clear targeting laser
      this.aimingLineGfx.clear();
      this.touchTargetIndicator.setVisible(false);
    } else {
      // IDLE / ATTACKING State ("Attack-on-Stand")
      this.isMoving = false;
      this.player.setVelocity(0, 0);

      this.handleAutoAttack(delta);
    }

    // Angel room trigger check
    if (this.angelNpc && !this.angelVisited && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.angelNpc.x, this.angelNpc.y) < 70) {
      this.angelVisited = true;
      if (this.onAngelEncounter) {
        this.onAngelEncounter();
      }
    }

    // Door transition check
    if (this.exitDoor && this.isRoomCleared) {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.exitDoor.x, this.exitDoor.y) < 48) {
        // Advanced to next room!
        this.advanceToNextRoom();
      }
    }
  }

  private advanceToNextRoom() {
    this.currentRoomNumber++;
    this.loadRoom(this.currentRoomNumber);
  }

  private handleAutoAttack(delta: number) {
    this.attackTimer += delta;
    const cooldownMs = (1 / this.playerStats.attackSpeed) * 1000;

    // Target Acquisition Algorithm:
    // 1. Query active enemies within player.attackRange
    const range = this.playerStats.attackRange;
    let closestEnemy: ActiveEnemy | null = null;
    let minDistance = Infinity;

    for (const enemy of this.enemies) {
      if (!enemy.sprite.active || enemy.stats.currentHp <= 0) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);
      if (dist <= range && dist < minDistance) {
        minDistance = dist;
        closestEnemy = enemy;
      }
    }

    if (closestEnemy) {
      // Lock target
      const targetAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, closestEnemy.sprite.x, closestEnemy.sprite.y);
      this.player.setFlipX(closestEnemy.sprite.x < this.player.x);

      // Draw subtle dashed targeting laser line
      this.aimingLineGfx.clear();
      this.aimingLineGfx.lineStyle(1.5, 0xef4444, 0.4);
      this.aimingLineGfx.lineBetween(this.player.x, this.player.y, closestEnemy.sprite.x, closestEnemy.sprite.y);

      // Draw target lock circle
      this.touchTargetIndicator.setPosition(closestEnemy.sprite.x, closestEnemy.sprite.y).setVisible(true);

      // Auto-Fire Check
      if (this.attackTimer >= cooldownMs) {
        this.attackTimer = 0;
        this.firePlayerVolley(targetAngle, closestEnemy);
      }
    } else {
      this.aimingLineGfx.clear();
      this.touchTargetIndicator.setVisible(false);
    }
  }

  private firePlayerVolley(baseAngle: number, targetEnemy: ActiveEnemy) {
    const burstCount = 1 + this.playerStats.multishot;

    for (let b = 0; b < burstCount; b++) {
      this.time.delayedCall(b * 90, () => {
        if (!this.player || !this.player.active) return;
        sound.playShoot();

        // 1. Front Arrows (spaced slightly or parallel)
        const frontCount = this.playerStats.frontArrows;
        for (let i = 0; i < frontCount; i++) {
          const offsetAngle = frontCount > 1 ? (i - (frontCount - 1) / 2) * 0.12 : 0;
          this.spawnPlayerArrow(baseAngle + offsetAngle);
        }

        // 2. Diagonal Arrows (+45° and -45°)
        if (this.playerStats.diagonalArrows) {
          this.spawnPlayerArrow(baseAngle + Math.PI / 4);
          this.spawnPlayerArrow(baseAngle - Math.PI / 4);
        }

        // 3. Side Arrows (+90° and -90°)
        if (this.playerStats.sideArrows) {
          this.spawnPlayerArrow(baseAngle + Math.PI / 2);
          this.spawnPlayerArrow(baseAngle - Math.PI / 2);
        }

        // 4. Rear Arrow (180°)
        if (this.playerStats.rearArrow) {
          this.spawnPlayerArrow(baseAngle + Math.PI);
        }
      });
    }
  }

  private spawnPlayerArrow(angle: number) {
    const arrow = this.physics.add.sprite(this.player.x, this.player.y, 'arrow');
    arrow.setDepth(19);
    arrow.setRotation(angle);

    const speed = 720;
    arrow.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Crit check
    const isCrit = Math.random() < this.playerStats.critChance;
    const damage = Math.round(this.playerStats.baseAttack * (isCrit ? this.playerStats.critDamage : 1.0));

    this.playerProjectiles.push({
      sprite: arrow,
      damage,
      isCrit,
      piercesLeft: this.playerStats.piercingCount,
      ricochetsLeft: this.playerStats.ricochetBounces,
      bouncesLeft: this.playerStats.bouncyWall ? 2 : 0,
      elements: [...this.playerStats.elements],
      hitEnemies: new Set(),
    });
  }

  private updateShieldOrbs(delta: number) {
    if (this.shieldOrbs.length === 0) return;

    this.shieldOrbAngle += 0.0035 * delta;
    const radius = 56;
    const count = this.shieldOrbs.length;

    this.shieldOrbs.forEach((orb, index) => {
      const angle = this.shieldOrbAngle + (index * (Math.PI * 2)) / count;
      orb.setPosition(this.player.x + Math.cos(angle) * radius, this.player.y + Math.sin(angle) * radius);
    });

    // Check collision between Shield Orbs and Enemy Projectiles
    this.shieldOrbs.forEach(orb => {
      for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
        const bullet = this.enemyProjectiles[i];
        if (Phaser.Math.Distance.Between(orb.x, orb.y, bullet.x, bullet.y) < 22) {
          // Block projectile!
          sound.playHit();
          this.spawnHitSparks(bullet.x, bullet.y, 0x38bdf8);
          bullet.destroy();
          this.enemyProjectiles.splice(i, 1);
        }
      }
    });
  }

  private updateSpikes(delta: number) {
    for (const spike of this.spikeTraps) {
      spike.timer += delta;
      if (spike.timer > 2400) {
        spike.timer = 0;
        spike.active = !spike.active;
        spike.sprite.setTint(spike.active ? 0xef4444 : 0xffffff);
      }

      // If active and player is standing on it, apply damage
      if (spike.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, spike.x, spike.y) < 26) {
        this.damagePlayer(15);
      }
    }
  }

  private updateEnemies(delta: number) {
    const px = this.player.x;
    const py = this.player.y;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.sprite.active || enemy.stats.currentHp <= 0) {
        continue;
      }

      const ex = enemy.sprite.x;
      const ey = enemy.sprite.y;
      const dist = Phaser.Math.Distance.Between(ex, ey, px, py);
      const angleToPlayer = Phaser.Math.Angle.Between(ex, ey, px, py);

      // Status Effects (Blaze / Poison ticks)
      this.handleEnemyStatusEffects(enemy, delta);

      // Freeze check
      let speedFactor = 1.0;
      if (enemy.frozenTimer && enemy.frozenTimer > 0) {
        enemy.frozenTimer -= delta;
        speedFactor = 0.45;
        enemy.sprite.setTint(0x38bdf8);
      }

      // AI Logic based on Enemy Type
      if (enemy.stats.type === 'stalker') {
        // Melee Stalker: Direct vector steering towards player
        const spd = enemy.stats.speed * speedFactor;
        enemy.sprite.setVelocity(Math.cos(angleToPlayer) * spd, Math.sin(angleToPlayer) * spd);
        enemy.sprite.setFlipX(px < ex);

        // Contact Damage
        if (dist < enemy.stats.radius + 16) {
          this.damagePlayer(enemy.stats.damage);
        }
      } else if (enemy.stats.type === 'sniper') {
        // Ranged Sniper AI: maintains standoff distance (200 - 380px)
        enemy.aiTimer += delta;

        if (dist < 180) {
          // Back away from player
          const spd = enemy.stats.speed * 1.2 * speedFactor;
          enemy.sprite.setVelocity(-Math.cos(angleToPlayer) * spd, -Math.sin(angleToPlayer) * spd);
        } else if (dist > 380) {
          // Approach player
          const spd = enemy.stats.speed * speedFactor;
          enemy.sprite.setVelocity(Math.cos(angleToPlayer) * spd, Math.sin(angleToPlayer) * spd);
        } else {
          // In sweet spot -> Stand still & Aim
          enemy.sprite.setVelocity(0, 0);
        }
        enemy.sprite.setFlipX(px < ex);

        // Sniper Attack Telegraph Cycle
        if (enemy.sniperState === 'cooldown' && enemy.aiTimer > 2000) {
          enemy.sniperState = 'aiming';
          enemy.aimTimer = 0;
          enemy.aimAngle = angleToPlayer;
        }

        if (enemy.sniperState === 'aiming') {
          enemy.aimTimer = (enemy.aimTimer || 0) + delta;
          // Update aim laser
          if (enemy.telegraphGfx) {
            enemy.telegraphGfx.clear();
            enemy.telegraphGfx.lineStyle(1.5, 0xef4444, 0.7);
            const targetX = ex + Math.cos(enemy.aimAngle!) * 500;
            const targetY = ey + Math.sin(enemy.aimAngle!) * 500;
            enemy.telegraphGfx.lineBetween(ex, ey, targetX, targetY);
          }

          if (enemy.aimTimer >= 800) {
            // Fire projectile!
            if (enemy.telegraphGfx) enemy.telegraphGfx.clear();
            this.spawnEnemyBullet(ex, ey, enemy.aimAngle!, 420, enemy.stats.damage);
            enemy.sniperState = 'cooldown';
            enemy.aiTimer = 0;
          }
        }
      } else if (enemy.stats.type === 'charger') {
        // Charger AI: Patrols, then locks on and dashes 300px at 3.5x speed
        enemy.aiTimer += delta;

        if (enemy.chargeState === 'idle') {
          if (enemy.telegraphGfx) enemy.telegraphGfx.clear();
          // Slow approach
          const spd = enemy.stats.speed * speedFactor;
          enemy.sprite.setVelocity(Math.cos(angleToPlayer) * spd, Math.sin(angleToPlayer) * spd);
          enemy.sprite.setFlipX(px < ex);

          if (dist < 320 && enemy.aiTimer > 2400) {
            // Start Charge Telegraph
            enemy.chargeState = 'telegraph';
            enemy.chargeTimer = 0;
            enemy.chargeVector = { x: Math.cos(angleToPlayer), y: Math.sin(angleToPlayer) };
            enemy.sprite.setVelocity(0, 0);
            sound.playBossCharge();
          }
        } else if (enemy.chargeState === 'telegraph') {
          enemy.chargeTimer = (enemy.chargeTimer || 0) + delta;
          // Flash Red & draw trajectory
          enemy.sprite.setTint(0xef4444);
          if (enemy.telegraphGfx && enemy.chargeVector) {
            enemy.telegraphGfx.clear();
            enemy.telegraphGfx.fillStyle(0xef4444, 0.25);
            enemy.telegraphGfx.lineStyle(2, 0xef4444, 0.8);
            enemy.telegraphGfx.lineBetween(ex, ey, ex + enemy.chargeVector.x * 280, ey + enemy.chargeVector.y * 280);
          }

          if (enemy.chargeTimer >= 550) {
            // Initiate High-Speed Dash
            enemy.chargeState = 'dashing';
            enemy.chargeTimer = 0;
            if (enemy.telegraphGfx) enemy.telegraphGfx.clear();
            const dashSpeed = 440;
            enemy.sprite.setVelocity(enemy.chargeVector!.x * dashSpeed, enemy.chargeVector!.y * dashSpeed);
          }
        } else if (enemy.chargeState === 'dashing') {
          enemy.chargeTimer = (enemy.chargeTimer || 0) + delta;
          // Contact damage check during dash
          if (dist < enemy.stats.radius + 18) {
            this.damagePlayer(enemy.stats.damage * 1.3);
          }

          if (enemy.chargeTimer >= 650) {
            // Dash finished
            enemy.chargeState = 'idle';
            enemy.aiTimer = 0;
            enemy.sprite.clearTint();
          }
        }
      } else if (enemy.stats.type === 'boss_minotaur' || enemy.stats.type === 'boss_dragon') {
        // Multi-Stage Boss FSM
        this.handleBossAi(enemy, delta, angleToPlayer, dist);
      }
    }
  }

  private handleBossAi(enemy: ActiveEnemy, delta: number, angleToPlayer: number, dist: number) {
    const ex = enemy.sprite.x;
    const ey = enemy.sprite.y;
    const hpRatio = enemy.stats.currentHp / enemy.stats.maxHp;

    // Check Phase 2 Enrage (<50% HP)
    if (hpRatio <= 0.5 && !enemy.bossEnraged) {
      enemy.bossEnraged = true;
      enemy.stats.speed *= 1.3;
      enemy.sprite.setTint(0xff0000);
      this.cameras.main.shake(300, 0.02);
      sound.playBossCharge();
    }

    enemy.bossTimer = (enemy.bossTimer || 0) + delta;
    enemy.spawnMinionTimer = (enemy.spawnMinionTimer || 0) + delta;

    // Enraged minion spawning every 8s
    if (enemy.bossEnraged && enemy.spawnMinionTimer >= 8000 && this.enemies.length < 5) {
      enemy.spawnMinionTimer = 0;
      this.createEnemy('stalker', ex - 50, ey + 20, this.currentRoomNumber);
      this.createEnemy('stalker', ex + 50, ey + 20, this.currentRoomNumber);
    }

    // Alternating Boss Attack Cycle
    const cycleTime = enemy.bossEnraged ? 2400 : 3200;

    if (enemy.bossTimer > cycleTime) {
      enemy.bossTimer = 0;
      const attackType = Phaser.Math.Between(1, 3);

      if (attackType === 1) {
        // 360-Degree Radial Bullet Hell Burst
        const bulletCount = enemy.bossEnraged ? 16 : 12;
        sound.playBossCharge();
        for (let i = 0; i < bulletCount; i++) {
          const angle = (i * (Math.PI * 2)) / bulletCount;
          this.spawnBossOrb(ex, ey, angle, 260, Math.round(enemy.stats.damage * 0.7));
        }
      } else if (attackType === 2) {
        // Targeted Triple Spread
        for (let i = -1; i <= 1; i++) {
          const spreadAngle = angleToPlayer + i * 0.25;
          this.spawnBossOrb(ex, ey, spreadAngle, 320, enemy.stats.damage);
        }
      } else {
        // Boss Charge / Leap forward
        const leapSpeed = 380;
        enemy.sprite.setVelocity(Math.cos(angleToPlayer) * leapSpeed, Math.sin(angleToPlayer) * leapSpeed);
        this.time.delayedCall(600, () => {
          if (enemy.sprite.active) enemy.sprite.setVelocity(0, 0);
        });
      }
    } else {
      // Normal slow stalk towards player
      const spd = enemy.stats.speed;
      enemy.sprite.setVelocity(Math.cos(angleToPlayer) * spd, Math.sin(angleToPlayer) * spd);
      enemy.sprite.setFlipX(this.player.x < ex);
    }

    // Contact damage
    if (dist < enemy.stats.radius + 20) {
      this.damagePlayer(enemy.stats.damage);
    }
  }

  private handleEnemyStatusEffects(enemy: ActiveEnemy, delta: number) {
    // Blaze Ticks (every 400ms)
    if (enemy.blazeTicksLeft && enemy.blazeTicksLeft > 0) {
      enemy.blazeTicksLeft -= delta;
      if (Math.random() < 0.05) {
        const dmg = Math.round(this.playerStats.baseAttack * 0.3);
        this.damageEnemy(enemy, dmg, false, 'blaze');
      }
    }

    // Poison Ticks
    if (enemy.poisonTicksLeft && enemy.poisonTicksLeft > 0) {
      enemy.poisonTicksLeft -= delta;
      if (Math.random() < 0.04) {
        const dmg = Math.round(this.playerStats.baseAttack * 0.2);
        this.damageEnemy(enemy, dmg, false, 'poison');
      }
    }
  }

  private spawnEnemyBullet(x: number, y: number, angle: number, speed: number, damage: number) {
    const bullet = this.physics.add.sprite(x, y, 'enemy_bullet');
    bullet.setDepth(17);
    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    (bullet as any).damage = damage;
    this.enemyProjectiles.push(bullet);
  }

  private spawnBossOrb(x: number, y: number, angle: number, speed: number, damage: number) {
    const orb = this.physics.add.sprite(x, y, 'boss_orb');
    orb.setDepth(18);
    orb.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    (orb as any).damage = damage;
    this.enemyProjectiles.push(orb);
  }

  private updateProjectiles(delta: number) {
    // 1. Update Player Projectiles
    for (let pIdx = this.playerProjectiles.length - 1; pIdx >= 0; pIdx--) {
      const proj = this.playerProjectiles[pIdx];
      const arrow = proj.sprite;

      if (!arrow.active) {
        this.playerProjectiles.splice(pIdx, 1);
        continue;
      }

      // Check Wall Boundary collision
      if (arrow.x < this.ARENA_MIN_X || arrow.x > this.ARENA_MAX_X || arrow.y < this.ARENA_MIN_Y || arrow.y > this.ARENA_MAX_Y) {
        if (proj.bouncesLeft > 0) {
          proj.bouncesLeft--;
          // Reflect velocity
          const body = arrow.body as Phaser.Physics.Arcade.Body;
          if (arrow.x < this.ARENA_MIN_X || arrow.x > this.ARENA_MAX_X) {
            body.velocity.x *= -1;
          }
          if (arrow.y < this.ARENA_MIN_Y || arrow.y > this.ARENA_MAX_Y) {
            body.velocity.y *= -1;
          }
          arrow.setRotation(Math.atan2(body.velocity.y, body.velocity.x));
          sound.playHit();
        } else {
          arrow.destroy();
          this.playerProjectiles.splice(pIdx, 1);
          continue;
        }
      }

      // Check Collision with Enemies
      for (const enemy of this.enemies) {
        if (!enemy.sprite.active || enemy.stats.currentHp <= 0) continue;
        if (proj.hitEnemies.has(enemy.sprite)) continue;

        if (Phaser.Math.Distance.Between(arrow.x, arrow.y, enemy.sprite.x, enemy.sprite.y) < enemy.stats.radius + 12) {
          proj.hitEnemies.add(enemy.sprite);

          // Apply damage
          this.damageEnemy(enemy, proj.damage, proj.isCrit);

          // Apply elemental procs
          if (proj.elements.includes('blaze')) enemy.blazeTicksLeft = 2000;
          if (proj.elements.includes('poison')) enemy.poisonTicksLeft = 6000;
          if (proj.elements.includes('freeze')) enemy.frozenTimer = 1500;
          if (proj.elements.includes('lightning')) {
            this.triggerLightningChain(enemy.sprite.x, enemy.sprite.y, enemy);
          }

          // Handle Ricochet
          if (proj.ricochetsLeft > 0) {
            proj.ricochetsLeft--;
            const nextEnemy = this.findNearestEnemyExcept(arrow.x, arrow.y, enemy);
            if (nextEnemy) {
              const bounceAngle = Phaser.Math.Angle.Between(arrow.x, arrow.y, nextEnemy.sprite.x, nextEnemy.sprite.y);
              const speed = 720;
              arrow.setVelocity(Math.cos(bounceAngle) * speed, Math.sin(bounceAngle) * speed);
              arrow.setRotation(bounceAngle);
              sound.playHit();
              break;
            }
          }

          // Handle Piercing
          if (proj.piercesLeft > 0) {
            proj.piercesLeft--;
            proj.damage = Math.round(proj.damage * 0.67);
          } else {
            arrow.destroy();
            this.playerProjectiles.splice(pIdx, 1);
            break;
          }
        }
      }
    }

    // 2. Update Enemy Projectiles
    for (let bIdx = this.enemyProjectiles.length - 1; bIdx >= 0; bIdx--) {
      const bullet = this.enemyProjectiles[bIdx];
      if (!bullet.active) {
        this.enemyProjectiles.splice(bIdx, 1);
        continue;
      }

      // Check bounds
      if (bullet.x < this.ARENA_MIN_X || bullet.x > this.ARENA_MAX_X || bullet.y < this.ARENA_MIN_Y || bullet.y > this.ARENA_MAX_Y) {
        bullet.destroy();
        this.enemyProjectiles.splice(bIdx, 1);
        continue;
      }

      // Check Collision with Player
      if (Phaser.Math.Distance.Between(bullet.x, bullet.y, this.player.x, this.player.y) < 22) {
        const dmg = (bullet as any).damage || 25;
        this.damagePlayer(dmg);
        bullet.destroy();
        this.enemyProjectiles.splice(bIdx, 1);
      }
    }
  }

  private triggerLightningChain(x: number, y: number, originEnemy: ActiveEnemy) {
    const chainTarget = this.findNearestEnemyExcept(x, y, originEnemy, 240);
    if (chainTarget) {
      sound.playShoot();
      // Draw lightning bolt
      const boltGfx = this.add.graphics().setDepth(22);
      boltGfx.lineStyle(3, 0xfde047, 1);
      boltGfx.lineBetween(x, y, chainTarget.sprite.x, chainTarget.sprite.y);
      this.time.delayedCall(120, () => boltGfx.destroy());

      const chainDmg = Math.round(this.playerStats.baseAttack * 0.75);
      this.damageEnemy(chainTarget, chainDmg, false, 'lightning');
    }
  }

  private findNearestEnemyExcept(x: number, y: number, exclude: ActiveEnemy, maxDist: number = 220): ActiveEnemy | null {
    let nearest: ActiveEnemy | null = null;
    let minDist = maxDist;

    for (const e of this.enemies) {
      if (e === exclude || !e.sprite.active || e.stats.currentHp <= 0) continue;
      const d = Phaser.Math.Distance.Between(x, y, e.sprite.x, e.sprite.y);
      if (d < minDist) {
        minDist = d;
        nearest = e;
      }
    }
    return nearest;
  }

  public damageEnemy(enemy: ActiveEnemy, rawDmg: number, isCrit: boolean = false, element: ElementType = 'none') {
    enemy.stats.currentHp -= rawDmg;

    // Hit Flash
    enemy.sprite.setTint(0xffffff);
    this.time.delayedCall(80, () => {
      if (enemy.sprite.active) enemy.sprite.clearTint();
    });

    if (isCrit) {
      sound.playCrit();
      this.cameras.main.shake(120, 0.008);
    } else {
      sound.playHit();
    }

    // Color-coded damage float numbers
    let textColor = '#ffffff';
    if (isCrit) textColor = '#ef4444';
    else if (element === 'blaze') textColor = '#f97316';
    else if (element === 'poison') textColor = '#22c55e';
    else if (element === 'freeze') textColor = '#06b6d4';
    else if (element === 'lightning') textColor = '#facc15';

    this.spawnFloatingText(enemy.sprite.x, enemy.sprite.y - 16, `${rawDmg}${isCrit ? '!' : ''}`, textColor, isCrit);

    // Enemy Death Check
    if (enemy.stats.currentHp <= 0) {
      this.onEnemyDefeated(enemy);
    }
  }

  private onEnemyDefeated(enemy: ActiveEnemy) {
    sound.playEnemyDie();
    this.totalKillsThisRun++;

    // Bloodthirst healing
    if (this.playerStats.bloodthirst) {
      const healAmount = Math.max(1, Math.round(this.playerStats.maxHp * 0.02));
      this.healPlayer(healAmount);
    }

    // Spawn EXP Gems, Coins, and occasional Heart
    this.spawnExpGem(enemy.sprite.x, enemy.sprite.y, enemy.stats.expValue);
    this.spawnCoin(enemy.sprite.x + 8, enemy.sprite.y, enemy.stats.coinValue);

    if (Math.random() < 0.2) {
      this.spawnHeart(enemy.sprite.x - 8, enemy.sprite.y);
    }

    // Death Particle Explosion
    this.spawnDeathExplosion(enemy.sprite.x, enemy.sprite.y, enemy.stats.color);

    // Clean up
    enemy.sprite.destroy();
    enemy.hpBar.destroy();
    if (enemy.telegraphGfx) enemy.telegraphGfx.destroy();
  }

  private spawnExpGem(x: number, y: number, value: number) {
    const gem = this.physics.add.sprite(x, y, 'gem_exp');
    gem.setDepth(10);
    (gem as any).expValue = value;
    this.expGems.push(gem);
  }

  private spawnCoin(x: number, y: number, value: number) {
    const coin = this.physics.add.sprite(x, y, 'coin');
    coin.setDepth(10);
    (coin as any).coinValue = value;
    this.coins.push(coin);
  }

  private spawnHeart(x: number, y: number) {
    const heart = this.physics.add.sprite(x, y, 'heart');
    heart.setDepth(10);
    (heart as any).healValue = Math.round(this.playerStats.maxHp * 0.2);
    this.hearts.push(heart);
  }

  private spawnDeathExplosion(x: number, y: number, color: number) {
    const particles = this.add.graphics().setDepth(25);
    particles.fillStyle(color, 1);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const px = x + Math.cos(angle) * 16;
      const py = y + Math.sin(angle) * 16;
      particles.fillCircle(px, py, 4);
    }
    this.tweens.add({
      targets: particles,
      alpha: 0,
      scaleX: 1.6,
      scaleY: 1.6,
      duration: 350,
      onComplete: () => particles.destroy(),
    });
  }

  private spawnHitSparks(x: number, y: number, color: number) {
    const spark = this.add.circle(x, y, 6, color, 0.9).setDepth(24);
    this.tweens.add({
      targets: spark,
      scale: 2.2,
      alpha: 0,
      duration: 180,
      onComplete: () => spark.destroy(),
    });
  }

  private updatePickups(delta: number) {
    const px = this.player.x;
    const py = this.player.y;
    const magnetRadius = this.playerStats.magnetRadius;

    // 1. EXP Gems Magnet & Pickup
    for (let i = this.expGems.length - 1; i >= 0; i--) {
      const gem = this.expGems[i];
      const dist = Phaser.Math.Distance.Between(gem.x, gem.y, px, py);

      if (dist <= magnetRadius) {
        // Quadratic attraction force
        const angle = Phaser.Math.Angle.Between(gem.x, gem.y, px, py);
        const speed = Math.min(600, (magnetRadius / Math.max(10, dist)) * 180);
        gem.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      }

      if (dist < 26) {
        sound.playExp();
        this.addExp((gem as any).expValue || 20);
        gem.destroy();
        this.expGems.splice(i, 1);
      }
    }

    // 2. Coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      const dist = Phaser.Math.Distance.Between(coin.x, coin.y, px, py);

      if (dist <= magnetRadius) {
        const angle = Phaser.Math.Angle.Between(coin.x, coin.y, px, py);
        coin.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350);
      }

      if (dist < 26) {
        sound.playCoin();
        const value = (coin as any).coinValue || 10;
        this.goldEarnedThisRun += value;
        this.notifyUi();
        coin.destroy();
        this.coins.splice(i, 1);
      }
    }

    // 3. Hearts
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const heart = this.hearts[i];
      const dist = Phaser.Math.Distance.Between(heart.x, heart.y, px, py);

      if (dist < 28) {
        sound.playExp();
        const heal = (heart as any).healValue || 100;
        this.healPlayer(heal);
        heart.destroy();
        this.hearts.splice(i, 1);
      }
    }
  }

  public addExp(amount: number) {
    this.currentExp += amount;

    // Check Level Up
    if (this.currentExp >= this.expToNextLevel) {
      this.currentExp -= this.expToNextLevel;
      this.playerLevel++;
      this.expToNextLevel = Math.round(this.expToNextLevel * 1.35);

      // Trigger 3-Card Skill Choice Selection
      const skills = getRandomSkills(3, this.playerStats, this.chosenSkillIds);
      if (this.onLevelUp) {
        this.onLevelUp(skills);
      }
    }
    this.notifyUi();
  }

  public damagePlayer(rawDmg: number) {
    // Apply damage reduction
    const actualDmg = Math.max(1, Math.round(rawDmg * (1 - this.playerStats.damageReduction)));
    this.playerStats.currentHp -= actualDmg;

    sound.playPlayerHurt();
    this.cameras.main.shake(200, 0.012);

    // Red screen hurt vignette flash
    const hurtGfx = this.add.graphics().setDepth(100);
    hurtGfx.fillStyle(0xdc2626, 0.25);
    hurtGfx.fillRect(0, 0, 540, 960);
    this.time.delayedCall(120, () => hurtGfx.destroy());

    this.spawnFloatingText(this.player.x, this.player.y - 20, `-${actualDmg}`, '#ef4444', true);
    this.notifyUi();

    // Player Death Check
    if (this.playerStats.currentHp <= 0) {
      this.playerStats.currentHp = 0;
      this.handleGameOver(false);
    }
  }

  public healPlayer(amount: number) {
    this.playerStats.currentHp = Math.min(this.playerStats.maxHp, this.playerStats.currentHp + amount);
    this.spawnFloatingText(this.player.x, this.player.y - 20, `+${amount}`, '#22c55e', false);
    this.notifyUi();
  }

  private handleGameOver(won: boolean) {
    // Save rewards to persistent storage
    const save = loadSaveData();
    save.gold += this.goldEarnedThisRun;
    save.totalKills += this.totalKillsThisRun;
    if (this.currentRoomNumber > save.highestRoom) {
      save.highestRoom = this.currentRoomNumber;
    }
    const currentChapter = save.selectedChapter || 1;
    const prevBest = save.chapterRecords[currentChapter] || 0;
    if (this.currentRoomNumber > prevBest) {
      save.chapterRecords[currentChapter] = this.currentRoomNumber;
    }
    if (won && currentChapter >= save.highestChapter) {
      save.highestChapter = Math.min(8, currentChapter + 1);
    }

    // Update incubating eggs progress
    if (Array.isArray(save.incubatingEggs)) {
      save.incubatingEggs.forEach(egg => {
        if (!egg.hatched) {
          egg.progressKills = Math.min(egg.targetKills, egg.progressKills + this.totalKillsThisRun);
          if (egg.progressKills >= egg.targetKills) {
            egg.hatched = true;
          }
        }
      });
    }

    saveSaveData(save);

    if (this.onGameOver) {
      this.onGameOver({
        room: this.currentRoomNumber,
        kills: this.totalKillsThisRun,
        gold: this.goldEarnedThisRun,
        won,
      });
    }
  }

  private checkRoomClearCondition() {
    if (this.isRoomCleared) return;

    // Check if all active enemies are defeated
    const activeEnemies = this.enemies.filter(e => e.sprite.active && e.stats.currentHp > 0);

    if (activeEnemies.length === 0 && this.enemies.length > 0) {
      this.isRoomCleared = true;

      // Unlock exit door
      this.openExitDoor();

      // Check chapter victory at Room 50
      if (this.currentRoomNumber >= 50) {
        this.handleGameOver(true);
      }
    }
  }

  private spawnFloatingText(x: number, y: number, message: string, color: string, isBig: boolean = false) {
    const text = this.add.text(x, y, message, {
      fontFamily: 'monospace, sans-serif',
      fontSize: isBig ? '20px' : '15px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setOrigin(0.5, 0.5);
    text.setDepth(30);

    this.tweens.add({
      targets: text,
      y: y - 36,
      alpha: 0,
      scale: isBig ? 1.3 : 1.1,
      duration: 650,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  private updateHudAndOverheads() {
    // 1. Player Overhead Health Bar
    this.healthBarGfx.clear();
    const hpRatio = Math.max(0, this.playerStats.currentHp / this.playerStats.maxHp);
    const barW = 40;
    const barH = 5;
    const px = this.player.x - barW / 2;
    const py = this.player.y - 28;

    this.healthBarGfx.fillStyle(0x0f172a, 0.8);
    this.healthBarGfx.fillRect(px, py, barW, barH);
    this.healthBarGfx.fillStyle(hpRatio > 0.3 ? 0x22c55e : 0xef4444, 1);
    this.healthBarGfx.fillRect(px, py, barW * hpRatio, barH);

    // 2. Enemy Overhead Health Bars
    for (const enemy of this.enemies) {
      enemy.hpBar.clear();
      if (!enemy.sprite.active || enemy.stats.currentHp <= 0) continue;

      const eRatio = Math.max(0, enemy.stats.currentHp / enemy.stats.maxHp);
      const eBarW = enemy.stats.type.startsWith('boss') ? 70 : 34;
      const eBarH = 4;
      const ex = enemy.sprite.x - eBarW / 2;
      const ey = enemy.sprite.y - (enemy.stats.type.startsWith('boss') ? 50 : 26);

      enemy.hpBar.fillStyle(0x0f172a, 0.8);
      enemy.hpBar.fillRect(ex, ey, eBarW, eBarH);
      enemy.hpBar.fillStyle(enemy.stats.color, 1);
      enemy.hpBar.fillRect(ex, ey, eBarW * eRatio, eBarH);
    }
  }

  private notifyUi() {
    if (this.onHpChange) {
      this.onHpChange(this.playerStats.currentHp, this.playerStats.maxHp);
    }
    if (this.onExpChange) {
      this.onExpChange(this.currentExp, this.expToNextLevel, this.playerLevel);
    }
    if (this.onGoldChange) {
      this.onGoldChange(this.goldEarnedThisRun);
    }
  }
}
