'use strict';
// Buffs y debuffs de banda por clase. kind: 'buff' (a la banda) | 'debuff' (al jefe) | 'util' (utilidad de banda)
// from: clases que lo aportan. name/effect: [español, inglés]
const RAID_BUFFS = [
  { id: 'arcaneintellect', icon: 'spell_holy_magicalsentry', kind: 'buff', from: ['mage'], name: ['Intelecto arcano', 'Arcane Intellect'], effect: ['+5% de intelecto', '+5% Intellect'] },
  { id: 'fortitude', icon: 'spell_holy_wordfortitude', kind: 'buff', from: ['priest'], name: ['Palabra de poder: Entereza', 'Power Word: Fortitude'], effect: ['+5% de aguante', '+5% Stamina'] },
  { id: 'wild', icon: 'spell_nature_regeneration', kind: 'buff', from: ['druid'], name: ['Marca de lo salvaje', 'Mark of the Wild'], effect: ['+3% de versatilidad', '+3% Versatility'] },
  { id: 'battleshout', icon: 'ability_warrior_battleshout', kind: 'buff', from: ['warrior'], name: ['Grito de batalla', 'Battle Shout'], effect: ['+5% de poder de ataque', '+5% Attack Power'] },
  { id: 'skyfury', icon: 'spell_nature_windfury', kind: 'buff', from: ['shaman'], name: ['Furia celeste', 'Skyfury'], effect: ['+2% de maestría', '+2% Mastery'] },
  { id: 'bronze', icon: 'ability_evoker_blessingofthebronze', kind: 'buff', from: ['evoker'], name: ['Bendición de los Bronces', 'Blessing of the Bronze'], effect: ['Reduce la reutilización de habilidades de movimiento', 'Reduces movement ability cooldowns'] },
  { id: 'devotion', icon: 'spell_holy_devotionaura', kind: 'buff', from: ['paladin'], name: ['Aura de devoción', 'Devotion Aura'], effect: ['−3% de daño recibido por la banda', '−3% damage taken by the raid'] },
  { id: 'mystictouch', icon: 'ability_monk_touchofdeath', kind: 'debuff', from: ['monk'], name: ['Toque místico', 'Mystic Touch'], effect: ['El jefe recibe +5% de daño físico', 'Boss takes +5% physical damage'] },
  { id: 'chaosbrand', icon: 'ability_demonhunter_empowerwards', kind: 'debuff', from: ['demonhunter'], name: ['Marca del caos', 'Chaos Brand'], effect: ['El jefe recibe +3% de daño mágico', 'Boss takes +3% magic damage'] },
  { id: 'atrophic', icon: 'ability_rogue_deadlybrew', kind: 'debuff', from: ['rogue'], name: ['Veneno atrofiante', 'Atrophic Poison'], effect: ['El jefe inflige −3% de daño', 'Boss deals −3% damage'] },
  { id: 'bloodlust', icon: 'spell_nature_bloodlust', kind: 'util', from: ['shaman', 'mage', 'evoker', 'hunter'], name: ['Ansia de sangre / Heroísmo', 'Bloodlust / Heroism'], effect: ['+30% de celeridad a la banda', '+30% Haste for the raid'] },
  { id: 'brez', icon: 'spell_nature_reincarnation', kind: 'util', from: ['druid', 'deathknight', 'warlock', 'paladin'], name: ['Resurrección en combate', 'Battle Resurrection'], effect: ['Revivir a un jugador durante el combate', 'Revive a player during combat'] },
];

if (typeof module !== 'undefined') module.exports = { RAID_BUFFS };
