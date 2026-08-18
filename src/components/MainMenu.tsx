import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  ChevronRight,
  Coins,
  Cpu,
  Download,
  Flame,
  Gamepad2,
  Gem,
  Heart,
  Plus,
  Shield,
  Sparkles,
  Sword,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { ALL_CHAPTERS } from '../game/chapters';
import { ALL_EQUIPMENT_CATALOG, loadSaveData, saveSaveData, TALENTS_DEF } from '../game/persistence';
import { EquipmentSlot, SaveData, TalentNode } from '../types/game';
import { BattleHub } from './BattleHub';
import { InventoryView } from './InventoryView';

interface MainMenuProps {
  onStartGame: (chapterId?: number, mode?: 'normal' | 'hero') => void;
  onOpenTechSpec: () => void;
  onOpenStandaloneExport: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenTechSpec,
  onOpenStandaloneExport,
}) => {
  const [activeTab, setActiveTab] = useState<'battle' | 'gear' | 'talents' | 'bestiary'>('battle');
  const [saveData, setSaveData] = useState<SaveData>(() => loadSaveData());

  const handleUpgradeTalent = (talent: TalentNode) => {
    const currentLevel = saveData.talents[talent.id] || 0;
    if (currentLevel >= talent.maxLevel) return;

    const cost = Math.round(talent.baseCost * Math.pow(talent.costMultiplier, currentLevel));
    if (saveData.gold < cost) return;

    const updated: SaveData = {
      ...saveData,
      gold: saveData.gold - cost,
      talents: {
        ...saveData.talents,
        [talent.id]: currentLevel + 1,
      },
    };
    setSaveData(updated);
    saveSaveData(updated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 max-w-md mx-auto relative overflow-hidden border-x border-slate-800 w-full shadow-2xl">
      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* TAB 1: BATTLE HUB (Matching Image 2) */}
        {activeTab === 'battle' && (
          <BattleHub
            saveData={saveData}
            onSaveUpdate={setSaveData}
            onStartBattle={(chapterId, mode) => onStartGame(chapterId, mode)}
          />
        )}

        {/* TAB 2: INVENTORY & EQUIPMENT (Matching Image 1) */}
        {activeTab === 'gear' && (
          <InventoryView saveData={saveData} onSaveUpdate={setSaveData} />
        )}

        {/* TAB 3: TALENTS & PERMANENT PROGRESSION */}
        {activeTab === 'talents' && (
          <div className="h-full overflow-y-auto p-4 space-y-3 pb-20 select-none">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-2xl">
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Permanent Talents</h3>
                <p className="text-[11px] text-slate-400">Fortify hero stats for all dungeon runs</p>
              </div>
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                <Coins className="w-3.5 h-3.5" />
                <span>{saveData.gold} Gold</span>
              </div>
            </div>

            <div className="space-y-2">
              {TALENTS_DEF.map(talent => {
                const currentLevel = saveData.talents[talent.id] || 0;
                const cost = Math.round(talent.baseCost * Math.pow(talent.costMultiplier, currentLevel));
                const isMax = currentLevel >= talent.maxLevel;
                const canAfford = saveData.gold >= cost && !isMax;

                return (
                  <div
                    key={talent.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {talent.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{talent.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono">
                            Lv.{currentLevel}/{talent.maxLevel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{talent.statBonusText}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpgradeTalent(talent)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer'
                          : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? (
                        'MAX'
                      ) : (
                        <>
                          <Coins className="w-3.5 h-3.5" />
                          <span>{cost}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: BESTIARY & ALL CHAPTERS CODEX */}
        {activeTab === 'bestiary' && (
          <div className="h-full overflow-y-auto p-4 space-y-4 pb-20 select-none">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-2xl">
              <div>
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Chapters & Codex</h3>
                <p className="text-[11px] text-slate-400">8 World Chapters & Boss taxonomy</p>
              </div>
            </div>

            {/* Chapters Overview List */}
            <div className="space-y-2">
              {ALL_CHAPTERS.map(ch => {
                const record = saveData.chapterRecords[ch.id] || 0;
                const isCleared = record >= ch.stagesCount;

                return (
                  <div
                    key={ch.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                        {ch.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-white">
                            {ch.numberPrefix}. {ch.name}
                          </h4>
                          {isCleared && (
                            <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              Cleared
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{ch.description}</p>
                        <div className="text-[10px] font-mono text-amber-400 mt-0.5">
                          Boss: <strong>{ch.bossName}</strong> • {ch.stagesCount} Stages
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-white font-mono">{record}/{ch.stagesCount}</div>
                      <div className="text-[9px] text-slate-500">Record</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Links: Architecture and HTML5 Exporter */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={onOpenTechSpec}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center gap-2.5 cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">Tech Spec</span>
              </button>

              <button
                onClick={onOpenStandaloneExport}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition flex items-center gap-2.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">Export HTML5</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= BOTTOM NAVIGATION TABS ================= */}
      <div className="grid grid-cols-4 bg-slate-900/95 border-t border-slate-800/90 px-2 py-1.5 shrink-0 z-30 shadow-2xl">
        <button
          onClick={() => setActiveTab('battle')}
          className={`flex flex-col items-center py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'battle'
              ? 'text-amber-400 font-black bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Battle</span>
        </button>

        <button
          onClick={() => setActiveTab('gear')}
          className={`flex flex-col items-center py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'gear'
              ? 'text-amber-400 font-black bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Equipment</span>
        </button>

        <button
          onClick={() => setActiveTab('talents')}
          className={`flex flex-col items-center py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'talents'
              ? 'text-amber-400 font-black bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Talents</span>
        </button>

        <button
          onClick={() => setActiveTab('bestiary')}
          className={`flex flex-col items-center py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'bestiary'
              ? 'text-amber-400 font-black bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Chapters</span>
        </button>
      </div>
    </div>
  );
};
