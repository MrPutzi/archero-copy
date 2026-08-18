import React, { useState } from 'react';
import {
  Award,
  ChevronUp,
  Coins,
  Gem,
  Heart,
  Info,
  Package,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Sword,
  Target,
  Trash2,
  Wind,
  Zap,
} from 'lucide-react';
import { ALL_EQUIPMENT_CATALOG, openChest, RARITY_STYLES, saveSaveData } from '../game/persistence';
import { EquipmentItem, EquipmentSlot, ItemRarity, SaveData } from '../types/game';

interface InventoryViewProps {
  saveData: SaveData;
  onSaveUpdate: (updated: SaveData) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ saveData, onSaveUpdate }) => {
  const [hoveredItem, setHoveredItem] = useState<EquipmentItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'weapon' | 'armor' | 'ring' | 'pet' | 'other'>('all');
  const [chestOpeningResult, setChestOpeningResult] = useState<EquipmentItem | null>(null);

  // Compute player stats based on talents + equipped items
  const baseStrength = (saveData.talents.strength || 0) * 8;
  const baseVitality = (saveData.talents.vitality || 0) * 80;
  const baseDmgRed = (saveData.talents.iron_skin || 0) * 1.5;
  const baseSpeed = (saveData.talents.swiftness || 0) * 3;
  const baseCrit = 8 + (saveData.talents.precision || 0) * 1.5;

  let totalAttack = 50 + baseStrength;
  let totalHp = 650 + baseVitality;
  let totalCrit = baseCrit;
  let totalSpeed = baseSpeed;
  let totalDodge = 0;
  let totalDmgReduction = baseDmgRed;

  // Aggregate equipped stats
  const equippedItems: Record<EquipmentSlot, EquipmentItem | null> = {
    weapon: null,
    armor: null,
    ring1: null,
    ring2: null,
    pet: null,
    bracelet: null,
    locket: null,
    book: null,
  };

  Object.entries(saveData.equipped).forEach(([slotKey, itemId]) => {
    if (!itemId) return;
    const item =
      saveData.inventory.find(i => i.id === itemId) ||
      ALL_EQUIPMENT_CATALOG.find(i => i.id === itemId);
    if (item) {
      equippedItems[slotKey as EquipmentSlot] = item;
      totalAttack += item.attackBonus;
      totalHp += item.hpBonus;
      totalCrit += item.critBonus || 0;
      totalSpeed += item.speedBonus || 0;
      totalDodge += item.dodgeBonus || 0;
    }
  });

  const handleEquipItem = (item: EquipmentItem) => {
    let targetSlot: EquipmentSlot = item.slot;

    // Handle ring dual slotting
    if (item.slot === 'ring1' || item.slot === 'ring2') {
      if (!saveData.equipped.ring1) {
        targetSlot = 'ring1';
      } else if (!saveData.equipped.ring2) {
        targetSlot = 'ring2';
      } else {
        targetSlot = 'ring1';
      }
    }

    const updated: SaveData = {
      ...saveData,
      equipped: {
        ...saveData.equipped,
        [targetSlot]: item.id,
      },
    };
    onSaveUpdate(updated);
    saveSaveData(updated);
    setSelectedItem(null);
  };

  const handleUnequipItem = (slot: EquipmentSlot) => {
    const updated: SaveData = {
      ...saveData,
      equipped: {
        ...saveData.equipped,
        [slot]: null,
      },
    };
    onSaveUpdate(updated);
    saveSaveData(updated);
    setSelectedItem(null);
  };

  const handleOpenChest = (type: 'golden' | 'obsidian') => {
    const res = openChest(type, saveData);
    if (res) {
      onSaveUpdate(res.updatedSave);
      setChestOpeningResult(res.item);
    }
  };

  // Filter inventory
  const filteredInventory = saveData.inventory.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'weapon') return item.slot === 'weapon';
    if (activeFilter === 'armor') return item.slot === 'armor';
    if (activeFilter === 'ring') return item.slot === 'ring1' || item.slot === 'ring2';
    if (activeFilter === 'pet') return item.slot === 'pet';
    if (activeFilter === 'other') return ['bracelet', 'locket', 'book'].includes(item.slot);
    return true;
  });

  // Current active tooltip preview (hovered or selected)
  const activeInspectItem = hoveredItem || selectedItem;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto px-4 py-3 space-y-3 relative pb-20 select-none">
      {/* Top Header & Resources */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-2xl shadow-md backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm shadow-inner">
            🛡️
          </div>
          <div>
            <div className="text-xs font-black uppercase text-white tracking-wide">Hero Equipment</div>
            <div className="text-[10px] text-slate-400">Level 42 Ranger • Chapter 13 Master</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-bold text-xs">
            <Coins className="w-3.5 h-3.5" />
            <span>{saveData.gold}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-300 font-bold text-xs">
            <Gem className="w-3.5 h-3.5" />
            <span>{saveData.gems}</span>
          </div>
        </div>
      </div>

      {/* ================= SECTION 1: HERO & SURROUNDING EQUIPMENT SLOTS (Inspired by Drawing 1) ================= */}
      <div className="relative rounded-3xl bg-radial from-slate-900 via-slate-950 to-slate-950 border border-slate-800/90 p-4 shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-between">
        {/* Subtle Ambient Background Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* The Grid: 3 Slots Left | Character Center | 3 Slots Right */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          {/* LEFT SLOTS COLUMN: Weapon, Armor, Pet */}
          <div className="flex flex-col gap-3 shrink-0">
            {/* SLOT 1: WEAPON */}
            <EquippedSlotFrame
              slotLabel="Weapon"
              item={equippedItems.weapon}
              onHover={setHoveredItem}
              onClick={() => setSelectedItem(equippedItems.weapon)}
              onUnequip={() => handleUnequipItem('weapon')}
            />

            {/* SLOT 2: ARMOR */}
            <EquippedSlotFrame
              slotLabel="Armor"
              item={equippedItems.armor}
              onHover={setHoveredItem}
              onClick={() => setSelectedItem(equippedItems.armor)}
              onUnequip={() => handleUnequipItem('armor')}
            />

            {/* SLOT 3: PET / SPIRIT */}
            <EquippedSlotFrame
              slotLabel="Spirit"
              item={equippedItems.pet}
              onHover={setHoveredItem}
              onClick={() => setSelectedItem(equippedItems.pet)}
              onUnequip={() => handleUnequipItem('pet')}
            />
          </div>

          {/* CENTER: HERO CHARACTER DISPLAY */}
          <div className="flex-1 flex flex-col items-center justify-center relative py-1">
            {/* Hero SVG/Avatar Artwork with Hood, Bow, and Glowing Stance */}
            <div className="relative w-36 h-48 flex items-center justify-center">
              {/* Radial Ground Platform / Runes */}
              <div className="absolute bottom-1 w-28 h-7 bg-amber-500/20 rounded-[100%] border border-amber-400/40 blur-xs animate-pulse" />
              <div className="absolute bottom-2 w-24 h-5 bg-emerald-500/20 rounded-[100%] border border-emerald-400/30" />

              {/* Stylized Vector Hero illustration matching the ranger in image 1 */}
              <svg viewBox="0 0 160 220" className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]">
                {/* Cloak Shadow */}
                <path d="M40 90 Q80 130 120 90 L130 190 Q80 210 30 190 Z" fill="#1e293b" opacity="0.9" />
                {/* Legs & Armored Boots */}
                <rect x="52" y="145" width="22" height="48" rx="8" fill="#475569" />
                <rect x="86" y="145" width="22" height="48" rx="8" fill="#475569" />
                <rect x="48" y="180" width="28" height="15" rx="4" fill="#78350f" />
                <rect x="84" y="180" width="28" height="15" rx="4" fill="#78350f" />
                {/* Leather Tunic & Belt */}
                <path d="M48 85 L112 85 L106 148 L54 148 Z" fill="#334155" />
                <rect x="50" y="125" width="60" height="10" rx="3" fill="#b45309" />
                <circle cx="80" cy="130" r="5" fill="#fef08a" />
                {/* Chest Armor Plate */}
                <path d="M58 88 L102 88 L96 122 L64 122 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
                {/* Shoulder Pauldrons */}
                <path d="M34 82 Q50 68 62 88 L46 102 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M126 82 Q110 68 98 88 L114 102 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Hood & Face Shadow */}
                <path d="M52 45 Q80 18 108 45 Q120 85 80 88 Q40 85 52 45 Z" fill="#334155" />
                <path d="M60 48 Q80 32 100 48 Q106 72 80 75 Q54 72 60 48 Z" fill="#0f172a" />
                {/* Glowing Ranger Eyes */}
                <ellipse cx="72" cy="56" rx="3.5" ry="2" fill="#38bdf8" />
                <ellipse cx="88" cy="56" rx="3.5" ry="2" fill="#38bdf8" />
                {/* Hunter Greatbow in Left Hand */}
                <path
                  d="M26 35 Q10 110 32 185"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <line x1="26" y1="35" x2="32" y2="185" stroke="#f8fafc" strokeWidth="1.5" strokeOpacity="0.8" />
                {/* Quiver of Arrows */}
                <rect x="106" y="55" width="14" height="42" rx="4" fill="#78350f" transform="rotate(15 106 55)" />
                <line x1="112" y1="42" x2="114" y2="60" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="117" y1="45" x2="119" y2="63" stroke="#38bdf8" strokeWidth="2.5" />
              </svg>

              {/* Hero Level Badge */}
              <div className="absolute -bottom-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-amber-500/50 text-[10px] font-bold text-amber-400 shadow-md">
                ATREUS • LV.42
              </div>
            </div>
          </div>

          {/* RIGHT SLOTS COLUMN: Ring 1, Ring 2, Locket/Bracelet */}
          <div className="flex flex-col gap-3 shrink-0">
            {/* SLOT 4: RING 1 */}
            <EquippedSlotFrame
              slotLabel="Ring 1"
              item={equippedItems.ring1}
              onHover={setHoveredItem}
              onClick={() => setSelectedItem(equippedItems.ring1)}
              onUnequip={() => handleUnequipItem('ring1')}
            />

            {/* SLOT 5: RING 2 */}
            <EquippedSlotFrame
              slotLabel="Ring 2"
              item={equippedItems.ring2}
              onHover={setHoveredItem}
              onClick={() => setSelectedItem(equippedItems.ring2)}
              onUnequip={() => handleUnequipItem('ring2')}
            />

            {/* SLOT 6: LOCKET / BRACELET */}
            <EquippedSlotFrame
              slotLabel="Locket"
              item={equippedItems.locket || equippedItems.bracelet}
              onHover={setHoveredItem}
              onClick={() => setSelectedItem(equippedItems.locket || equippedItems.bracelet)}
              onUnequip={() => handleUnequipItem(equippedItems.locket ? 'locket' : 'bracelet')}
            />
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: THE TWO STAT LINES / BARS (As Requested) ================= */}
      <div className="space-y-2 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 shadow-xl">
        {/* LINE 1: ATTACK STAT BAR */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <Sword className="w-4 h-4" />
              <span className="tracking-wide">ATTACK</span>
            </div>
            <div className="font-black text-sm text-white font-mono">{totalAttack.toLocaleString()}</div>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (totalAttack / 3500) * 100)}%` }}
            />
          </div>
        </div>

        {/* LINE 2: HEALTH (HP) STAT BAR */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <Heart className="w-4 h-4 fill-emerald-500/30" />
              <span className="tracking-wide">MAX HEALTH</span>
            </div>
            <div className="font-black text-sm text-white font-mono">{totalHp.toLocaleString()}</div>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (totalHp / 15000) * 100)}%` }}
            />
          </div>
        </div>

        {/* Sub-Stats Pill Bar */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800 text-center text-[10px]">
          <div className="bg-slate-950/60 py-1 px-1.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block">Crit Rate</span>
            <span className="font-bold text-amber-400">{totalCrit.toFixed(1)}%</span>
          </div>
          <div className="bg-slate-950/60 py-1 px-1.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block">Dodge</span>
            <span className="font-bold text-sky-400">{totalDodge}%</span>
          </div>
          <div className="bg-slate-950/60 py-1 px-1.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block">Damage Red.</span>
            <span className="font-bold text-emerald-400">{totalDmgReduction.toFixed(1)}%</span>
          </div>
          <div className="bg-slate-950/60 py-1 px-1.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 block">Move Speed</span>
            <span className="font-bold text-purple-400">+{totalSpeed}</span>
          </div>
        </div>
      </div>

      {/* ================= SECTION 3: INVENTORY GRID OF SQUARES (Hover to Reveal Specs) ================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-white uppercase tracking-wider">Inventory Bag</h3>
            <p className="text-[10px] text-slate-400">Hover or tap an item square to inspect combat specs</p>
          </div>

          {/* Chest Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleOpenChest('golden')}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              <span>🎁</span>
              <span>150 Gold</span>
            </button>
            <button
              onClick={() => handleOpenChest('obsidian')}
              className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-[10px] rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              <span>💎</span>
              <span>30 Gems</span>
            </button>
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'weapon', label: 'Weapons' },
            { id: 'armor', label: 'Armors' },
            { id: 'ring', label: 'Rings' },
            { id: 'pet', label: 'Spirits' },
            { id: 'other', label: 'Artifacts' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* THE PURE SQUARES INVENTORY GRID */}
        <div className="grid grid-cols-5 gap-2.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          {filteredInventory.map(item => {
            const rarity = RARITY_STYLES[item.rarity];
            const isEquipped = Object.values(saveData.equipped).includes(item.id);

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => setSelectedItem(item)}
                className={`relative aspect-square rounded-2xl border-2 ${rarity.border} ${rarity.bg} p-1.5 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 transform hover:scale-105 active:scale-95 shadow-md group ${
                  isEquipped ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950' : ''
                }`}
              >
                {/* Item Icon */}
                <div className="text-2xl drop-shadow-md select-none group-hover:scale-110 transition">
                  {item.icon}
                </div>

                {/* Slot/Rarity indicator badge */}
                <div className="absolute bottom-1 right-1 text-[9px] font-black uppercase text-slate-300 bg-slate-950/80 px-1 rounded">
                  {item.slot === 'weapon' ? 'WPN' : item.slot === 'armor' ? 'ARM' : item.slot.startsWith('ring') ? 'RNG' : 'ART'}
                </div>

                {/* Equipped checkmark */}
                {isEquipped && (
                  <div className="absolute top-1 left-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= FLOATING ITEM SPECS TOOLTIP CARD (Revealed on Hover or Tap) ================= */}
      {activeInspectItem && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40 animate-in fade-in slide-in-from-bottom-3 duration-150">
          <div
            className={`p-4 rounded-3xl border-2 ${
              RARITY_STYLES[activeInspectItem.rarity].border
            } bg-slate-900/95 backdrop-blur-xl shadow-2xl space-y-3 relative`}
          >
            {/* Close Button for touch */}
            <button
              onClick={() => {
                setSelectedItem(null);
                setHoveredItem(null);
              }}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>

            {/* Header: Icon, Title, Rarity */}
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl border-2 ${
                  RARITY_STYLES[activeInspectItem.rarity].border
                } ${
                  RARITY_STYLES[activeInspectItem.rarity].bg
                } flex items-center justify-center text-3xl shadow-lg shrink-0`}
              >
                {activeInspectItem.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-white truncate">{activeInspectItem.name}</h4>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      RARITY_STYLES[activeInspectItem.rarity].badgeBg
                    }`}
                  >
                    {RARITY_STYLES[activeInspectItem.rarity].name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Slot: {activeInspectItem.slot}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed italic border-y border-slate-800/80 py-2">
              "{activeInspectItem.description}"
            </p>

            {/* Stat Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {activeInspectItem.attackBonus > 0 && (
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-rose-300">
                  <span>Attack:</span>
                  <strong className="font-bold text-white">+{activeInspectItem.attackBonus}</strong>
                </div>
              )}
              {activeInspectItem.hpBonus > 0 && (
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-emerald-300">
                  <span>Max HP:</span>
                  <strong className="font-bold text-white">+{activeInspectItem.hpBonus}</strong>
                </div>
              )}
              {activeInspectItem.critBonus > 0 && (
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-amber-300">
                  <span>Crit Rate:</span>
                  <strong className="font-bold text-white">+{activeInspectItem.critBonus}%</strong>
                </div>
              )}
              {activeInspectItem.speedBonus !== 0 && (
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-sky-300">
                  <span>Speed:</span>
                  <strong className="font-bold text-white">
                    {activeInspectItem.speedBonus > 0 ? `+${activeInspectItem.speedBonus}` : activeInspectItem.speedBonus}
                  </strong>
                </div>
              )}
            </div>

            {/* Special Passive Ability */}
            {activeInspectItem.specialPassive && (
              <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl text-xs space-y-0.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Unique Passive Ability</span>
                </div>
                <div className="text-slate-200 text-[11px] leading-snug">
                  {activeInspectItem.specialPassive}
                </div>
              </div>
            )}

            {/* Equip / Unequip Action Button */}
            <div className="flex gap-2 pt-1">
              {Object.values(saveData.equipped).includes(activeInspectItem.id) ? (
                <button
                  onClick={() => {
                    const slot = (Object.keys(saveData.equipped) as EquipmentSlot[]).find(
                      k => saveData.equipped[k] === activeInspectItem.id
                    );
                    if (slot) handleUnequipItem(slot);
                  }}
                  className="w-full py-2.5 bg-rose-600/80 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Unequip Item
                </button>
              ) : (
                <button
                  onClick={() => handleEquipItem(activeInspectItem)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  Equip to Character
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHEST OPENING REWARD MODAL */}
      {chestOpeningResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 w-full max-w-xs text-center space-y-4 shadow-2xl">
            <div className="text-xs uppercase font-bold text-amber-400 tracking-widest">Loot Acquired!</div>
            <div
              className={`w-20 h-20 mx-auto rounded-3xl border-2 ${
                RARITY_STYLES[chestOpeningResult.rarity].border
              } ${RARITY_STYLES[chestOpeningResult.rarity].bg} flex items-center justify-center text-4xl shadow-xl animate-bounce`}
            >
              {chestOpeningResult.icon}
            </div>
            <div>
              <h3 className="font-black text-lg text-white">{chestOpeningResult.name}</h3>
              <p className="text-xs text-amber-400 font-bold uppercase">{chestOpeningResult.rarity}</p>
            </div>
            <p className="text-xs text-slate-300 italic">"{chestOpeningResult.description}"</p>
            <button
              onClick={() => {
                setChestOpeningResult(null);
                setSelectedItem(chestOpeningResult);
              }}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer uppercase tracking-wider"
            >
              Claim & Inspect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* Sub-component: Stylized Angular Equipment Slot Frame (Matching Drawing 1) */
interface EquippedSlotFrameProps {
  slotLabel: string;
  item: EquipmentItem | null;
  onHover: (item: EquipmentItem | null) => void;
  onClick: () => void;
  onUnequip: () => void;
}

const EquippedSlotFrame: React.FC<EquippedSlotFrameProps> = ({
  slotLabel,
  item,
  onHover,
  onClick,
  onUnequip,
}) => {
  const rarity = item ? RARITY_STYLES[item.rarity] : null;

  return (
    <div
      onMouseEnter={() => item && onHover(item)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      className={`relative w-20 h-16 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-center group ${
        item && rarity
          ? `${rarity.border} ${rarity.bg} shadow-lg hover:scale-105`
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
      }`}
      style={{
        // Angular sci-fi clip path inspired by the drawing's outer frames
        clipPath: 'polygon(10% 0, 100% 0, 100% 85%, 90% 100%, 0 100%, 0 15%)',
      }}
    >
      {item ? (
        <div className="flex flex-col items-center justify-center p-1">
          <span className="text-2xl select-none group-hover:scale-110 transition">{item.icon}</span>
          <span className="text-[9px] font-black uppercase text-white tracking-tighter truncate max-w-[65px]">
            {item.name}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-slate-400 transition">
          <Plus className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] uppercase font-bold tracking-wider">{slotLabel}</span>
        </div>
      )}

      {/* Top right corner notch */}
      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-slate-800/80 border-b border-l border-slate-700/60" />
    </div>
  );
};
