import React from 'react';
import { Heart, Shield, Sparkles, Swords, Zap } from 'lucide-react';
import { AngelBlessingType } from '../types/game';

interface AngelModalProps {
  onSelectBlessing: (type: AngelBlessingType) => void;
}

export const AngelModal: React.FC<AngelModalProps> = ({ onSelectBlessing }) => {
  const blessings: Array<{
    type: AngelBlessingType;
    title: string;
    description: string;
    subtext: string;
    icon: React.ReactNode;
    badge: string;
    borderHover: string;
    bgHover: string;
    textColor: string;
  }> = [
    {
      type: 'heal',
      title: 'Divine Recovery',
      description: 'Instantly restore +40% of Max HP',
      subtext: 'Binds angelic grace to mend mortal wounds',
      icon: <Heart className="w-6 h-6 fill-emerald-500/30 text-emerald-400" />,
      badge: 'Recovery',
      borderHover: 'hover:border-emerald-500/70',
      bgHover: 'hover:bg-emerald-950/40',
      textColor: 'text-emerald-400',
    },
    {
      type: 'attack',
      title: 'Sacred Valor',
      description: '+15% Attack & +10% Speed',
      subtext: 'Empowers arrows with luminous celestial fury',
      icon: <Swords className="w-6 h-6 text-amber-400" />,
      badge: 'Empower',
      borderHover: 'hover:border-amber-500/70',
      bgHover: 'hover:bg-amber-950/40',
      textColor: 'text-amber-400',
    },
    {
      type: 'max_hp',
      title: 'Celestial Vitality',
      description: '+20% Max HP & Instant Heal',
      subtext: 'Expands your spiritual vessel and constitution',
      icon: <Sparkles className="w-6 h-6 text-sky-400" />,
      badge: 'Ascendance',
      borderHover: 'hover:border-sky-500/70',
      bgHover: 'hover:bg-sky-950/40',
      textColor: 'text-sky-400',
    },
    {
      type: 'holy_shield',
      title: 'Aegis of Light',
      description: '+1 Orbiting Holy Shield',
      subtext: 'Summons a sacred barrier orb that blocks enemy projectiles',
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      badge: 'Defense',
      borderHover: 'hover:border-purple-500/70',
      bgHover: 'hover:bg-purple-950/40',
      textColor: 'text-purple-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-6 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Divine Aura Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Angel Header */}
        <div className="flex flex-col items-center space-y-2 relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 p-[2px] shadow-lg shadow-amber-500/30">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-3xl">
              👼
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[11px] font-bold text-amber-300 tracking-wider uppercase mb-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> Sacred Sanctuary
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">The Archangel's Favor</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-sm">
            "Brave Hunter, you have traversed the harrowing abyss. Choose a divine grace to aid your sacred quest."
          </p>
        </div>

        {/* Blessing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
          {blessings.map((b) => (
            <button
              key={b.type}
              onClick={() => onSelectBlessing(b.type)}
              className={`p-4 rounded-2xl bg-slate-800/80 border border-slate-700 ${b.borderHover} ${b.bgHover} transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer active:scale-95 shadow-md`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700">
                  {b.badge}
                </span>
                <div className="p-2 bg-slate-900/60 rounded-xl group-hover:scale-110 transition">
                  {b.icon}
                </div>
              </div>

              <div className="w-full text-left">
                <div className={`font-bold text-sm text-white group-hover:${b.textColor} transition`}>
                  {b.title}
                </div>
                <div className={`text-xs font-semibold ${b.textColor} mt-0.5`}>
                  {b.description}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  {b.subtext}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

