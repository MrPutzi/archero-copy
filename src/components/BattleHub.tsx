import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Coins,
  Compass,
  Crown,
  Egg,
  Flame,
  Gem,
  Gift,
  HelpCircle,
  Info,
  Lock,
  Package,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Sword,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { sound } from '../audio/soundFx';
import { ALL_CHAPTERS } from '../game/chapters';
import { ALL_HEROES } from '../game/heroes';
import { ALL_EQUIPMENT_CATALOG, saveSaveData } from '../game/persistence';
import { ChapterDefinition, EquipmentItem, HeroDefinition, IncubatingEgg, SaveData } from '../types/game';

interface BattleHubProps {
  saveData: SaveData;
  onSaveUpdate: (updated: SaveData) => void;
  onStartBattle: (chapterId: number, mode: 'normal' | 'hero') => void;
}

export const BattleHub: React.FC<BattleHubProps> = ({
  saveData,
  onSaveUpdate,
  onStartBattle,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    const idx = ALL_CHAPTERS.findIndex(c => c.id === saveData.selectedChapter);
    return idx >= 0 ? idx : 4; // Default to index 4 (Lava Land)
  });

  const [activeModal, setActiveModal] = useState<
    'daily' | 'quests' | 'event' | 'hero_skin' | 'egg' | 'milestone' | 'expedition' | 'energy_refill' | 'chapter_info' | null
  >(null);

  const activeChapter = ALL_CHAPTERS[currentChapterIndex] || ALL_CHAPTERS[0];
  const highestStageInChapter = saveData.chapterRecords?.[activeChapter.id] || 0;
  const isCleared = highestStageInChapter >= activeChapter.stagesCount;

  const currentHeroId = saveData.selectedHero || 'atreus';
  const currentHero = ALL_HEROES.find(h => h.id === currentHeroId) || ALL_HEROES[0];

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      const newIdx = currentChapterIndex - 1;
      setCurrentChapterIndex(newIdx);
      const newChap = ALL_CHAPTERS[newIdx];
      const updated = { ...saveData, selectedChapter: newChap.id };
      onSaveUpdate(updated);
      saveSaveData(updated);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < ALL_CHAPTERS.length - 1) {
      const newIdx = currentChapterIndex + 1;
      setCurrentChapterIndex(newIdx);
      const newChap = ALL_CHAPTERS[newIdx];
      const updated = { ...saveData, selectedChapter: newChap.id };
      onSaveUpdate(updated);
      saveSaveData(updated);
    }
  };

  const handleToggleMode = () => {
    const nextMode = saveData.gameMode === 'normal' ? 'hero' : 'normal';
    const updated = { ...saveData, gameMode: nextMode };
    onSaveUpdate(updated);
    saveSaveData(updated);
  };

  const handleClaimDailyGift = () => {
    if (saveData.dailyGiftClaimed) return;
    const currentStreak = (saveData.loginStreakDay || 1) % 7 + 1;
    const updated: SaveData = {
      ...saveData,
      gold: saveData.gold + 350,
      gems: saveData.gems + 25,
      energy: Math.min(saveData.maxEnergy, saveData.energy + 10),
      dailyGiftClaimed: true,
      loginStreakDay: currentStreak,
      lastDailyClaimTime: Date.now(),
    };
    onSaveUpdate(updated);
    saveSaveData(updated);
    sound.playLevelUp();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
  };

  const handleClaimChapterMilestone = (stageThreshold: number, rewardGold: number, rewardGems: number) => {
    const milestoneKey = activeChapter.id * 100 + stageThreshold;
    if (saveData.milestonesClaimed.includes(milestoneKey)) return;
    const updated: SaveData = {
      ...saveData,
      gold: saveData.gold + rewardGold,
      gems: saveData.gems + rewardGems,
      milestonesClaimed: [...saveData.milestonesClaimed, milestoneKey],
    };
    onSaveUpdate(updated);
    saveSaveData(updated);
    sound.playCoin();
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.5 } });
  };

  const handleSelectHero = (heroId: string) => {
    const updated: SaveData = {
      ...saveData,
      selectedHero: heroId,
    };
    onSaveUpdate(updated);
    saveSaveData(updated);
    sound.playShoot();
  };

  const handleUnlockHero = (hero: HeroDefinition) => {
    if (saveData.gems < hero.unlockCostGems) return;
    const unlocked = saveData.unlockedHeroes || ['atreus', 'urasil', 'phoren'];
    const updated: SaveData = {
      ...saveData,
      gems: saveData.gems - hero.unlockCostGems,
      unlockedHeroes: [...unlocked, hero.id],
      selectedHero: hero.id,
      heroLevels: { ...(saveData.heroLevels || {}), [hero.id]: 1 },
    };
    onSaveUpdate(updated);
    saveSaveData(updated);
    sound.playLevelUp();
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
  };

  const handleUpgradeHero = (heroId: string) => {
    const curLevel = saveData.heroLevels?.[heroId] || 1;
    const cost = curLevel * 150;
    if (saveData.gold < cost) return;
    const updated: SaveData = {
      ...saveData,
      gold: saveData.gold - cost,
      heroLevels: {
        ...(saveData.heroLevels || {}),
        [heroId]: curLevel + 1,
      },
    };
    onSaveUpdate(updated);
    saveSaveData(updated);
    sound.playLevelUp();
  };

  const handleHatchEgg = (eggId: string) => {
    const eggs = saveData.incubatingEggs || [];
    const egg = eggs.find(e => e.id === eggId);
    if (!egg || !egg.hatched) return;

    // Find reward pet item
    const rewardItem = ALL_EQUIPMENT_CATALOG.find(i => i.id === egg.rewardPetId) || ALL_EQUIPMENT_CATALOG.find(i => i.slot === 'pet');
    const newInventory = rewardItem ? [...saveData.inventory, { ...rewardItem, id: `${rewardItem.id}_${Date.now()}` }] : saveData.inventory;

    const remainingEggs = eggs.filter(e => e.id !== eggId);
    const updated: SaveData = {
      ...saveData,
      inventory: newInventory,
      incubatingEggs: remainingEggs,
    };
    onSaveUpdate(updated);
    saveSaveData(updated);
    sound.playLevelUp();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  };

  const handleAddIncubatingEgg = (tier: 'normal' | 'rare' | 'mythic') => {
    const cost = tier === 'normal' ? 100 : tier === 'rare' ? 250 : 500;
    if (saveData.gold < cost) return;

    const newEgg: IncubatingEgg = {
      id: `egg_${Date.now()}`,
      name: tier === 'normal' ? 'Pixie Spirit Egg' : tier === 'rare' ? 'Laser Bat Egg' : 'Void Dragon Egg',
      tier: tier,
      icon: tier === 'normal' ? '🧚' : tier === 'rare' ? '🦇' : '🐉',
      progressKills: 0,
      targetKills: tier === 'normal' ? 15 : tier === 'rare' ? 30 : 60,
      hatched: false,
      rewardPetId: tier === 'normal' ? 'pet_fairy' : tier === 'rare' ? 'pet_bat' : 'pet_ghost',
    };

    const updated: SaveData = {
      ...saveData,
      gold: saveData.gold - cost,
      incubatingEggs: [...(saveData.incubatingEggs || []), newEgg],
    };
    onSaveUpdate(updated);
    saveSaveData(updated);
    sound.playExp();
  };

  const handleClaimQuest = (questId: string, goldReward: number, gemReward: number, energyReward: number) => {
    const completed = saveData.completedQuests || [];
    if (completed.includes(questId)) return;

    const updated: SaveData = {
      ...saveData,
      gold: saveData.gold + goldReward,
      gems: saveData.gems + gemReward,
      energy: Math.min(saveData.maxEnergy, saveData.energy + energyReward),
      completedQuests: [...completed, questId],
    };
    onSaveUpdate(updated);
    saveSaveData(updated);
    sound.playCoin();
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } });
  };

  const handlePlayClick = () => {
    if (saveData.energy < 5) {
      setActiveModal('energy_refill');
      return;
    }

    // Deduct energy
    const updated: SaveData = {
      ...saveData,
      energy: saveData.energy - 5,
      selectedChapter: activeChapter.id,
    };
    onSaveUpdate(updated);
    saveSaveData(updated);

    onStartBattle(activeChapter.id, saveData.gameMode);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-400 via-sky-500 to-sky-700 text-slate-900 select-none">
      {/* Dynamic Ambient Sky / Sun Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.4),transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 -right-24 h-96 bg-gradient-to-t from-sky-900/60 via-sky-800/40 to-transparent pointer-events-none" />

      {/* ================= TOP HEADER RESOURCE BAR ================= */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2">
        {/* Left: Energy Meter */}
        <button
          onClick={() => setActiveModal('energy_refill')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-950 text-white rounded-2xl border border-amber-400/40 shadow-lg backdrop-blur-md transition transform active:scale-95 cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-black text-xs font-mono">
            {saveData.energy}/{saveData.maxEnergy}
          </span>
          <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold ml-1">
            +
          </span>
        </button>

        {/* Right: Currencies */}
        <div className="flex items-center gap-2">
          {/* Gold */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 text-white rounded-2xl border border-amber-400/30 shadow-lg backdrop-blur-md">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-black text-xs font-mono">{saveData.gold.toLocaleString()}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 text-white rounded-2xl border border-sky-400/30 shadow-lg backdrop-blur-md">
            <Gem className="w-4 h-4 text-sky-400" />
            <span className="font-black text-xs font-mono">{saveData.gems.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ================= CHAPTER TITLE & CAROUSEL SWITCHER (Matching Drawing 2) ================= */}
      <div className="relative z-20 flex flex-col items-center text-center mt-1 space-y-0.5">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevChapter}
            disabled={currentChapterIndex === 0}
            className={`p-1.5 rounded-full bg-slate-950/40 text-white hover:bg-slate-950/70 backdrop-blur-xs transition cursor-pointer ${
              currentChapterIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="space-y-0">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans">
                {activeChapter.numberPrefix}.{activeChapter.name}
              </h1>
              <button
                onClick={() => setActiveModal('chapter_info')}
                className="text-sky-200 hover:text-white p-1 transition"
                title="Chapter Info"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs font-bold text-sky-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-wide">
              {isCleared ? (
                <span className="text-emerald-300 font-black">Chapter Cleared</span>
              ) : (
                <span>Stage Record: {highestStageInChapter} / {activeChapter.stagesCount}</span>
              )}
            </div>
          </div>

          <button
            onClick={handleNextChapter}
            disabled={currentChapterIndex === ALL_CHAPTERS.length - 1}
            className={`p-1.5 rounded-full bg-slate-950/40 text-white hover:bg-slate-950/70 backdrop-blur-xs transition cursor-pointer ${
              currentChapterIndex === ALL_CHAPTERS.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ================= MAIN 3D FLOATING ISLAND & INTERACTIVE SURROUNDING BADGES ================= */}
      <div className="relative flex-1 flex items-center justify-center min-h-[360px] my-2">
        {/* TOP-LEFT FLOATING BADGE: Daily Gift with Red Dot */}
        <button
          onClick={() => setActiveModal('daily')}
          className="absolute top-4 left-4 z-30 flex flex-col items-center group cursor-pointer transition transform hover:scale-110 active:scale-95"
        >
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white shadow-xl flex items-center justify-center text-2xl">
            🎁
            {/* Pulsing Red Notification Dot */}
            {!saveData.dailyGiftClaimed && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-ping" />
            )}
            {!saveData.dailyGiftClaimed && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full border-2 border-white" />
            )}
          </div>
          <span className="text-[10px] font-black text-white drop-shadow mt-1">Daily Gift</span>
        </button>

        {/* TOP-RIGHT FLOATING BADGE: Quests / Battle Pass */}
        <button
          onClick={() => setActiveModal('quests')}
          className="absolute top-4 right-4 z-30 flex flex-col items-center group cursor-pointer transition transform hover:scale-110 active:scale-95"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-400 border-2 border-white shadow-xl flex items-center justify-center text-2xl">
            📋
          </div>
          <span className="text-[10px] font-black text-white drop-shadow mt-1">Quests</span>
        </button>

        {/* LEFT-MIDDLE FLOATING BADGE: Event Dungeon (7H 43M) */}
        <button
          onClick={() => setActiveModal('event')}
          className="absolute top-24 left-3 z-30 flex flex-col items-center group cursor-pointer transition transform hover:scale-110 active:scale-95"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-400 border-2 border-white shadow-xl flex items-center justify-center text-xl">
            🐙
          </div>
          <span className="text-[9px] font-black text-slate-900 bg-amber-300 px-1.5 py-0.2 rounded-full shadow mt-0.5">
            7H 43M
          </span>
        </button>

        {/* RIGHT-MIDDLE FLOATING BADGE: Hero Mastery (Active Hero) (2D 7H) */}
        <button
          onClick={() => setActiveModal('hero_skin')}
          className="absolute top-24 right-3 z-30 flex flex-col items-center group cursor-pointer transition transform hover:scale-110 active:scale-95"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 border-2 border-white shadow-xl flex items-center justify-center text-xl">
            {currentHero.icon}
          </div>
          <span className="text-[9px] font-black text-slate-900 bg-amber-300 px-1.5 py-0.2 rounded-full shadow mt-0.5">
            {currentHero.name}
          </span>
        </button>

        {/* CENTER ISOMETRIC 3D ISLAND CANVAS / ARTWORK (Lava Land or Selected Chapter) */}
        <div className="relative w-72 h-72 flex items-center justify-center drop-shadow-[0_20px_25px_rgba(0,0,0,0.6)]">
          {/* Chapter Island SVG Graphic matching Image 2 */}
          <ChapterIslandIllustration theme={activeChapter.theme} />

          {/* Water Ripples around base */}
          <div className="absolute -bottom-4 w-60 h-12 bg-sky-200/40 rounded-[100%] blur-xs -z-10 animate-pulse" />
        </div>

        {/* BOTTOM-LEFT FLOATING BADGE: Pet Egg */}
        <button
          onClick={() => setActiveModal('egg')}
          className="absolute bottom-6 left-5 z-30 flex flex-col items-center group cursor-pointer transition transform hover:scale-110 active:scale-95"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-400 to-green-300 border-2 border-white shadow-xl flex items-center justify-center text-xl">
            🥚
          </div>
          <span className="text-[10px] font-black text-white drop-shadow mt-0.5">Hatchery</span>
        </button>

        {/* FLOATING MILESTONE CHEST ("Reach 15-30") */}
        <button
          onClick={() => setActiveModal('milestone')}
          className="absolute bottom-6 left-28 z-30 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/80 border border-amber-400/50 shadow-xl backdrop-blur-md group cursor-pointer hover:scale-105 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-lg shadow">
            📦
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black text-white block leading-tight">
              Reach {activeChapter.numberPrefix}-30
            </span>
            <span className="text-[9px] font-bold text-amber-400">Milestone Loot</span>
          </div>
        </button>

        {/* RIGHT FLOATING EXPEDITION PORTAL ("Time Left 8D 7H") */}
        <button
          onClick={() => setActiveModal('expedition')}
          className="absolute bottom-6 right-5 z-30 flex flex-col items-center group cursor-pointer transition transform hover:scale-110 active:scale-95"
        >
          <div className="relative w-12 h-14 rounded-2xl bg-gradient-to-b from-slate-200 to-slate-400 border-2 border-white shadow-xl flex flex-col items-center justify-center p-1">
            <div className="w-6 h-8 bg-sky-400 rounded-t-full border border-sky-200 shadow-inner flex items-center justify-center text-xs animate-pulse">
              🌀
            </div>
            <span className="text-[8px] font-black text-slate-800">
              {saveData.expeditionFloor || 12}
            </span>
          </div>
          <span className="text-[8px] font-bold text-slate-900 bg-slate-200/90 px-1 rounded shadow mt-0.5">
            Expedition
          </span>
        </button>
      </div>

      {/* ================= BOTTOM ACTION BAR (Matching Drawing 2) ================= */}
      <div className="relative z-20 grid grid-cols-5 gap-2 px-4 pb-4 pt-2 max-w-md mx-auto w-full items-center">
        {/* LEFT: Normal Mode / Hero Mode Toggle Button */}
        <button
          onClick={handleToggleMode}
          className={`col-span-1 py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl transition transform active:scale-95 cursor-pointer ${
            saveData.gameMode === 'hero'
              ? 'bg-gradient-to-b from-rose-700 to-rose-900 border-rose-400 text-white'
              : 'bg-gradient-to-b from-slate-800 to-slate-950 border-slate-600 text-slate-200'
          }`}
        >
          <div className="text-xl leading-none">
            {saveData.gameMode === 'hero' ? '👹' : '👿'}
          </div>
          <span className="text-[9px] font-black uppercase tracking-tight mt-1 whitespace-nowrap">
            {saveData.gameMode === 'hero' ? 'Hero Mode' : 'Normal'}
          </span>
        </button>

        {/* CENTER: GIANT GOLDEN PLAY BUTTON WITH SWORD EMBLEM & ENERGY (⚡ x5) */}
        <button
          onClick={handlePlayClick}
          className="col-span-3 py-3.5 px-4 rounded-3xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 border-4 border-amber-200 shadow-[0_8px_20px_rgba(245,158,11,0.6)] flex items-center justify-center gap-3 transition-all transform active:scale-95 cursor-pointer text-slate-950 group"
        >
          <div className="flex flex-col items-center">
            <div className="text-2xl font-black uppercase tracking-wider drop-shadow-sm font-sans flex items-center gap-2">
              <span>Play</span>
              {/* Golden Sword Crest Ring Icon */}
              <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-xs shadow-md">
                <Sword className="w-4 h-4 fill-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-black font-mono text-amber-950 mt-0.5">
              <Zap className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
              <span>x5 Energy</span>
            </div>
          </div>
        </button>

        {/* RIGHT: Expedition Mode Button */}
        <button
          onClick={() => setActiveModal('expedition')}
          className="col-span-1 py-3 px-2 rounded-2xl bg-gradient-to-b from-sky-700 to-indigo-900 border-2 border-sky-400 text-white flex flex-col items-center justify-center shadow-xl transition transform active:scale-95 cursor-pointer"
        >
          <div className="text-xl leading-none">🧭</div>
          <span className="text-[9px] font-black uppercase tracking-tight mt-1 whitespace-nowrap">
            Expedition
          </span>
        </button>
      </div>

      {/* ================= MODALS & POPUPS ================= */}

      {/* 1. DAILY LOGIN 7-DAY REWARD STREAK */}
      {activeModal === 'daily' && (
        <ModalWrapper title="7-Day Hunter Login Streak" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                { day: 1, reward: '+300 🪙', sub: 'Day 1' },
                { day: 2, reward: '+25 💎', sub: 'Day 2' },
                { day: 3, reward: '+500 🪙 & ⚡', sub: 'Day 3' },
                { day: 4, reward: 'Rare Ring', sub: 'Day 4' },
                { day: 5, reward: '+60 💎', sub: 'Day 5' },
                { day: 6, reward: 'Epic Key', sub: 'Day 6' },
                { day: 7, reward: 'Death Scythe', sub: 'Day 7', colSpan: 2 },
              ].map((d) => {
                const currentDay = saveData.loginStreakDay || 1;
                const isPast = d.day < currentDay;
                const isToday = d.day === currentDay;

                return (
                  <div
                    key={d.day}
                    className={`p-2.5 rounded-2xl border text-center relative ${
                      d.colSpan ? 'col-span-2' : ''
                    } ${
                      isToday
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : isPast
                        ? 'bg-slate-950/60 border-slate-800 text-slate-500'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase">{d.sub}</div>
                    <div className="text-xs font-black mt-1">{d.reward}</div>
                    {isPast && (
                      <div className="text-[9px] text-emerald-400 font-bold mt-0.5">Claimed ✓</div>
                    )}
                    {isToday && (
                      <div className="text-[9px] text-amber-400 font-black mt-0.5 animate-pulse">TODAY</div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleClaimDailyGift}
              disabled={saveData.dailyGiftClaimed}
              className={`w-full py-3 rounded-2xl font-black text-sm transition uppercase tracking-wider ${
                saveData.dailyGiftClaimed
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg cursor-pointer'
              }`}
            >
              {saveData.dailyGiftClaimed ? 'Claimed Today' : "Claim Today's Tribute"}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* 2. HERO MASTERY & SELECTOR */}
      {activeModal === 'hero_skin' && (
        <ModalWrapper title="Hero Mastery & Select" onClose={() => setActiveModal(null)}>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {ALL_HEROES.map((hero) => {
              const unlockedList = saveData.unlockedHeroes || ['atreus', 'urasil', 'phoren'];
              const isUnlocked = unlockedList.includes(hero.id);
              const isSelected = (saveData.selectedHero || 'atreus') === hero.id;
              const heroLvl = saveData.heroLevels?.[hero.id] || 1;
              const upgradeCost = heroLvl * 150;

              return (
                <div
                  key={hero.id}
                  className={`p-3 rounded-2xl border transition ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-400'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow">
                        {hero.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-sm">{hero.name}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold">
                            Lv.{heroLvl}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{hero.title}</p>
                      </div>
                    </div>

                    {/* Equip or Unlock button */}
                    {isUnlocked ? (
                      <button
                        onClick={() => handleSelectHero(hero.id)}
                        disabled={isSelected}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                        }`}
                      >
                        {isSelected ? 'Equipped' : 'Select'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnlockHero(hero)}
                        disabled={saveData.gems < hero.unlockCostGems}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Gem className="w-3 h-3 text-sky-200" />
                        <span>{hero.unlockCostGems}</span>
                      </button>
                    )}
                  </div>

                  {/* Hero Passive & Upgrade */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="text-slate-300 max-w-[200px]">
                      <span className="text-amber-400 font-bold">{hero.passiveName}: </span>
                      {hero.passiveDesc}
                    </div>

                    {isUnlocked && (
                      <button
                        onClick={() => handleUpgradeHero(hero.id)}
                        disabled={saveData.gold < upgradeCost}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[10px] border border-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Upgrade</span>
                        <span className="text-amber-400 font-mono">{upgradeCost}🪙</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ModalWrapper>
      )}

      {/* 3. MONSTER EGG HATCHERY */}
      {activeModal === 'egg' && (
        <ModalWrapper title="Monster Egg Hatchery" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Incubate spirit eggs earned from abyss bosses. Slay enemies in battle to hatch laser bats and spirit familiars!
            </p>

            <div className="space-y-2.5">
              {(saveData.incubatingEggs || []).map((egg) => {
                const pct = Math.min(100, Math.round((egg.progressKills / egg.targetKills) * 100));

                return (
                  <div key={egg.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                        {egg.icon}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{egg.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Progress: {egg.progressKills} / {egg.targetKills} Kills ({pct}%)
                        </div>
                        {/* Progress Bar */}
                        <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleHatchEgg(egg.id)}
                      disabled={!egg.hatched}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                        egg.hatched
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg animate-bounce cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {egg.hatched ? 'Hatch!' : 'Incubating'}
                    </button>
                  </div>
                );
              })}

              {(!saveData.incubatingEggs || saveData.incubatingEggs.length < 3) && (
                <div className="p-3 rounded-2xl border border-dashed border-slate-700 text-center space-y-2">
                  <div className="text-xs text-slate-400">Empty Incubator Slot</div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleAddIncubatingEgg('normal')}
                      disabled={saveData.gold < 100}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                    >
                      🧚 Pixie (100🪙)
                    </button>
                    <button
                      onClick={() => handleAddIncubatingEgg('rare')}
                      disabled={saveData.gold < 250}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                    >
                      🦇 Bat (250🪙)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 4. HUNTER'S QUESTS & CODEX */}
      {activeModal === 'quests' && (
        <ModalWrapper title="Hunter's Quests & Codex" onClose={() => setActiveModal(null)}>
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {[
              { id: 'quest_kills', title: 'Slay 30 Monsters', desc: 'Defeat creatures in any dungeon chamber', target: 30, current: saveData.totalKills, gold: 300, gems: 10, energy: 0 },
              { id: 'quest_stage', title: `Reach Stage 15 in Chapter ${activeChapter.numberPrefix}`, desc: 'Survive deep into the active world', target: 15, current: highestStageInChapter, gold: 200, gems: 25, energy: 0 },
              { id: 'quest_energy', title: 'Engage in Dungeon Battles', desc: 'Expend combat stamina to sharpen skills', target: 1, current: 1, gold: 100, gems: 0, energy: 10 },
              { id: 'quest_talents', title: 'Talent Mastery', desc: 'Upgrade any talent in the training hall', target: 1, current: 1, gold: 400, gems: 15, energy: 0 },
            ].map((q) => {
              const isClaimed = (saveData.completedQuests || []).includes(q.id);
              const isDone = q.current >= q.target;

              return (
                <div key={q.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white text-xs">{q.title}</div>
                    <div className="text-[10px] text-slate-400">{q.desc}</div>
                    <div className="text-[10px] font-mono text-amber-400">
                      Progress: {Math.min(q.target, q.current)} / {q.target}
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaimQuest(q.id, q.gold, q.gems, q.energy)}
                    disabled={isClaimed || !isDone}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      isClaimed
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : isDone
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer'
                        : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isClaimed ? 'Claimed ✓' : isDone ? 'Claim' : 'Locked'}
                  </button>
                </div>
              );
            })}
          </div>
        </ModalWrapper>
      )}

      {/* 5. EVENT GAUNTLET */}
      {activeModal === 'event' && (
        <ModalWrapper title="Abyss Event Gauntlet" onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-rose-950/70 to-red-950/70 border border-rose-500/40 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Flying Bullets (Bullet Hell)</h4>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-500/30">
                  2.5x Equipment Drop
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Encounter massive projectile storms from elite archers. High risk, supreme loot rewards!
              </p>
              <button
                onClick={() => {
                  setActiveModal(null);
                  handlePlayClick();
                }}
                className="w-full mt-2 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Launch Bullet Hell (5 Energy)
              </button>
            </div>

            <div className="p-3 bg-gradient-to-r from-amber-950/70 to-yellow-950/70 border border-amber-500/40 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Up-Close Dangers</h4>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                  2.5x Gold & EXP
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Fast swarms of melee chargers rush from all corners. Test your movement maneuvers.
              </p>
              <button
                onClick={() => {
                  setActiveModal(null);
                  handlePlayClick();
                }}
                className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Launch Melee Swarm (5 Energy)
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 6. MILESTONE REWARDS */}
      {activeModal === 'milestone' && (
        <ModalWrapper title={`Chapter ${activeChapter.numberPrefix} Milestones`} onClose={() => setActiveModal(null)}>
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {[
              { stage: 10, gold: 300, gems: 20 },
              { stage: 20, gold: 500, gems: 40 },
              { stage: 30, gold: 800, gems: 60 },
              { stage: 40, gold: 1200, gems: 80 },
              { stage: 50, gold: 2000, gems: 150 },
            ].map((m) => {
              const milestoneKey = activeChapter.id * 100 + m.stage;
              const isClaimed = saveData.milestonesClaimed.includes(milestoneKey);
              const isReached = highestStageInChapter >= m.stage;

              return (
                <div key={m.stage} className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">Reach Stage {activeChapter.numberPrefix}-{m.stage}</div>
                    <div className="text-[11px] text-amber-400 font-mono">
                      +{m.gold} 🪙 & +{m.gems} 💎
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaimChapterMilestone(m.stage, m.gold, m.gems)}
                    disabled={isClaimed || !isReached}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      isClaimed
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : isReached
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer'
                        : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isClaimed ? 'Claimed ✓' : isReached ? 'Claim' : 'Locked'}
                  </button>
                </div>
              );
            })}
          </div>
        </ModalWrapper>
      )}

      {/* 7. EXPEDITION RIFT */}
      {activeModal === 'expedition' && (
        <ModalWrapper title="Expedition Endless Rift" onClose={() => setActiveModal(null)}>
          <div className="text-center space-y-4">
            <div className="text-5xl animate-pulse">🌀</div>
            <div>
              <h3 className="font-black text-lg text-white">Floor {saveData.expeditionFloor || 12}</h3>
              <p className="text-xs text-slate-300">
                Climb the endless spire of boss encounters without health resets to earn exclusive relic equipment!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Floor Boss</div>
                <div className="text-xs font-black text-white">Void Dragon</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Floor Reward</div>
                <div className="text-xs font-black text-amber-400">Epic Relic Chest</div>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                handlePlayClick();
              }}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black rounded-2xl text-sm transition cursor-pointer shadow-lg"
            >
              Climb Floor {saveData.expeditionFloor || 12} (5 Energy)
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* 8. CHAPTER INFO PREVIEW */}
      {activeModal === 'chapter_info' && (
        <ModalWrapper title={`${activeChapter.numberPrefix}. ${activeChapter.name}`} onClose={() => setActiveModal(null)}>
          <div className="space-y-3 text-left">
            <p className="text-xs text-slate-300">{activeChapter.description}</p>

            <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Boss Titan</div>
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <span>{activeChapter.icon}</span>
                  <span>{activeChapter.bossName}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Recommended</div>
                <div className="text-xs font-mono font-bold text-amber-300">
                  {activeChapter.recommendedAtk} ATK / {activeChapter.recommendedHp} HP
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Dungeon Hazards</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/30 text-[10px] font-medium">
                  Spike Floor Traps
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/30 text-[10px] font-medium">
                  Magma Vents
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[10px] font-medium">
                  Sniper Angles
                </span>
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 9. ENERGY REFILL */}
      {activeModal === 'energy_refill' && (
        <ModalWrapper title="Energy Refill" onClose={() => setActiveModal(null)}>
          <div className="text-center space-y-4">
            <div className="text-5xl">⚡</div>
            <div>
              <h3 className="font-black text-lg text-white">Instant Stamina Boost</h3>
              <p className="text-xs text-slate-300">Refill your combat energy bar to full (20 Energy).</p>
            </div>

            <button
              onClick={() => {
                const updated: SaveData = {
                  ...saveData,
                  energy: saveData.maxEnergy,
                };
                onSaveUpdate(updated);
                saveSaveData(updated);
                sound.playLevelUp();
                setActiveModal(null);
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-sm transition cursor-pointer uppercase tracking-wider shadow-lg"
            >
              Refill to 20 Energy (Free)
            </button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

/* Modal Backdrop Shell */
const ModalWrapper: React.FC<{ title: string; children: React.ReactNode; onClose: () => void }> = ({
  title,
  children,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          ✕
        </button>
        <h2 className="text-lg font-black text-white uppercase tracking-wider">{title}</h2>
        {children}
      </div>
    </div>
  );
};

/* ================= 3D/ISOMETRIC ISLAND ILLUSTRATION (Matching Drawing 2) ================= */
interface ChapterIslandProps {
  theme: string;
}

const ChapterIslandIllustration: React.FC<ChapterIslandProps> = ({ theme }) => {
  if (theme === 'lava') {
    // 🌋 Lava Land Island (Matching the exact island in Image 2!)
    return (
      <svg viewBox="0 0 320 280" className="w-full h-full">
        {/* Island Base (Dark Terraced Volcanic Earth) */}
        <path
          d="M60 140 L160 80 L260 140 L260 210 L160 260 L60 210 Z"
          fill="#3b1f1a"
          stroke="#26120e"
          strokeWidth="3"
        />
        {/* Top Plateau Base */}
        <path d="M60 140 L160 80 L260 140 L160 190 Z" fill="#542c23" />
        {/* Tiered upper volcano block */}
        <path d="M110 95 L160 65 L210 95 L160 120 Z" fill="#6d392e" />
        <path d="M110 95 L160 120 L160 145 L110 120 Z" fill="#422019" />
        <path d="M160 120 L210 95 L210 120 L160 145 Z" fill="#522820" />

        {/* Glowing Magma Caldera Top */}
        <path d="M130 80 L160 65 L190 80 L160 95 Z" fill="#f59e0b" />
        <ellipse cx="160" cy="80" rx="18" ry="8" fill="#fef08a" />

        {/* Molten Lava Waterfall dripping down from volcano caldera */}
        <path
          d="M152 90 L168 90 L166 170 L154 170 Z"
          fill="#f97316"
          stroke="#fef08a"
          strokeWidth="1.5"
        />
        {/* Spilling Lava Pool on main floor */}
        <path
          d="M100 135 Q160 115 220 135 Q230 160 170 175 Q110 165 100 135 Z"
          fill="#ea580c"
          opacity="0.9"
        />
        <ellipse cx="160" cy="148" rx="35" ry="12" fill="#fbbf24" opacity="0.8" />

        {/* Giant Dragon Skull Fossil on left ledge */}
        <g transform="translate(85, 130)">
          <path
            d="M10 20 Q20 5 40 10 Q50 25 35 30 Q20 32 10 20 Z"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {/* Eye Socket */}
          <circle cx="26" cy="18" r="4" fill="#1e293b" />
          {/* Horn Spikes */}
          <path d="M38 12 L50 2 L42 16 Z" fill="#cbd5e1" />
          <path d="M30 8 L36 0 L34 10 Z" fill="#cbd5e1" />
          {/* Teeth */}
          <line x1="16" y1="26" x2="16" y2="30" stroke="#64748b" strokeWidth="2" />
          <line x1="22" y1="28" x2="22" y2="32" stroke="#64748b" strokeWidth="2" />
          <line x1="28" y1="28" x2="28" y2="32" stroke="#64748b" strokeWidth="2" />
        </g>

        {/* Bone Rib Spikes jutting from right cliff */}
        <path d="M220 130 Q235 110 240 135" fill="none" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />
        <path d="M232 140 Q247 120 252 145" fill="none" stroke="#f1f5f9" strokeWidth="4" strokeLinecap="round" />
        <path d="M210 120 Q225 102 230 125" fill="none" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />

        {/* Lava Drops falling into ocean */}
        <circle cx="160" cy="220" r="3" fill="#f97316" className="animate-bounce" />
        <circle cx="165" cy="235" r="2" fill="#fbbf24" />
      </svg>
    );
  }

  if (theme === 'verdant') {
    // 🌿 Verdant Prairie Island
    return (
      <svg viewBox="0 0 320 280" className="w-full h-full">
        {/* Cliff Base */}
        <path d="M60 140 L160 80 L260 140 L260 210 L160 260 L60 210 Z" fill="#452a12" />
        {/* Lush Green Grass Top */}
        <path d="M60 140 L160 80 L260 140 L160 190 Z" fill="#22c55e" />
        {/* Ancient Stone Shrine & Waterfall */}
        <path d="M120 100 L160 75 L200 100 L160 120 Z" fill="#3b82f6" opacity="0.8" />
        {/* Trees & Ruins */}
        <circle cx="100" cy="130" r="18" fill="#15803d" />
        <circle cx="210" cy="130" r="16" fill="#16a34a" />
      </svg>
    );
  }

  // Fallback / Other Chapters: Crystal / Dungeon / Void
  return (
    <svg viewBox="0 0 320 280" className="w-full h-full">
      <path d="M60 140 L160 80 L260 140 L260 210 L160 260 L60 210 Z" fill="#1e293b" />
      <path d="M60 140 L160 80 L260 140 L160 190 Z" fill="#38bdf8" />
      {/* Spires */}
      <polygon points="160,50 140,110 180,110" fill="#a855f7" />
      <polygon points="110,90 95,140 125,140" fill="#818cf8" />
      <polygon points="210,90 195,140 225,140" fill="#c084fc" />
    </svg>
  );
};
