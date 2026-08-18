import React from 'react';
import { Sparkles } from 'lucide-react';
import { SkillDefinition, SkillRarity } from '../types/game';

interface SkillPickerModalProps {
  skills: SkillDefinition[];
  onSelectSkill: (skillId: string) => void;
}

const RARITY_COLORS: Record<SkillRarity, { border: string; bg: string; text: string; badge: string }> = {
  common: {
    border: 'border-slate-600 hover:border-slate-400',
    bg: 'bg-slate-800/80 hover:bg-slate-800',
    text: 'text-slate-200',
    badge: 'bg-slate-700 text-slate-300',
  },
  rare: {
    border: 'border-sky-600/70 hover:border-sky-400',
    bg: 'bg-sky-950/40 hover:bg-sky-900/50',
    text: 'text-sky-200',
    badge: 'bg-sky-600/30 text-sky-300 border border-sky-500/30',
  },
  epic: {
    border: 'border-purple-600/70 hover:border-purple-400',
    bg: 'bg-purple-950/40 hover:bg-purple-900/50',
    text: 'text-purple-200',
    badge: 'bg-purple-600/30 text-purple-300 border border-purple-500/30',
  },
  legendary: {
    border: 'border-amber-500/80 hover:border-amber-300',
    bg: 'bg-amber-950/40 hover:bg-amber-900/50',
    text: 'text-amber-200',
    badge: 'bg-amber-500/30 text-amber-300 border border-amber-400/40 animate-pulse',
  },
};

export const SkillPickerModal: React.FC<SkillPickerModalProps> = ({ skills, onSelectSkill }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Level Up Acquired</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase drop-shadow-md">
            Choose Your Ability
          </h2>
          <p className="text-xs text-slate-400">
            Select 1 ability to augment your combat trajectory
          </p>
        </div>

        {/* 3 Cards */}
        <div className="w-full space-y-3.5">
          {skills.map(skill => {
            const rarity = RARITY_COLORS[skill.rarity || 'common'];
            return (
              <button
                key={skill.id}
                onClick={() => onSelectSkill(skill.id)}
                className={`w-full p-4 rounded-2xl border-2 ${rarity.border} ${rarity.bg} transition-all duration-200 text-left flex items-center gap-4 group cursor-pointer shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
              >
                {/* Icon Circle */}
                <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition">
                  {skill.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-base text-white truncate group-hover:text-emerald-400 transition">
                      {skill.name}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${rarity.badge} shrink-0`}>
                      {skill.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">
                    {skill.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
