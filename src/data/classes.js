'use strict';
// Colores oficiales de clase de World of Warcraft
const CLASS_COLORS = {
  deathknight: '#C41E3A', demonhunter: '#A330C9', druid: '#FF7C0A', evoker: '#33937F', hunter: '#AAD372', mage: '#3FC7EB', monk: '#00FF98',
  paladin: '#F48CBA', priest: '#FFFFFF', rogue: '#FFF468', shaman: '#0070DD', warlock: '#8788EE', warrior: '#C69B6D',
};
const QUALITY_COLORS = { 0: '#9d9d9d', 1: '#ffffff', 2: '#1eff00', 3: '#0070dd', 4: '#a335ee', 5: '#ff8000', 6: '#e6cc80', 7: '#00ccff' };

// Especializaciones: clave (nombre en inglés sin espacios) -> [inglés, español, icono del pack Clean Icons]
const SPECS = {
  deathknight: { blood: ['Blood', 'Sangre', 'spell_deathknight_bloodpresence'], frost: ['Frost', 'Escarcha', 'spell_deathknight_frostpresence'], unholy: ['Unholy', 'Profano', 'spell_deathknight_unholypresence'] },
  demonhunter: { havoc: ['Havoc', 'Devastación', 'ability_demonhunter_specdps'], vengeance: ['Vengeance', 'Venganza', 'ability_demonhunter_spectank'], devourer: ['Devourer', 'Devorador', 'classicon_demonhunter_void'] },
  druid: { balance: ['Balance', 'Equilibrio', 'spell_nature_starfall'], feral: ['Feral', 'Feral', 'ability_druid_catform'], guardian: ['Guardian', 'Guardián', 'ability_racial_bearform'], restoration: ['Restoration', 'Restauración', 'spell_nature_healingtouch'] },
  evoker: { devastation: ['Devastation', 'Devastación', 'classicon_evoker_devastation'], preservation: ['Preservation', 'Preservación', 'classicon_evoker_preservation'], augmentation: ['Augmentation', 'Aumento', 'classicon_evoker_augmentation'] },
  hunter: { beastmastery: ['Beast Mastery', 'Bestias', 'ability_hunter_bestialdiscipline'], marksmanship: ['Marksmanship', 'Puntería', 'ability_hunter_focusedaim'], survival: ['Survival', 'Supervivencia', 'ability_hunter_camouflage'] },
  mage: { arcane: ['Arcane', 'Arcano', 'spell_holy_magicalsentry'], fire: ['Fire', 'Fuego', 'spell_fire_firebolt02'], frost: ['Frost', 'Escarcha', 'spell_frost_frostbolt02'] },
  monk: { brewmaster: ['Brewmaster', 'Maestro cervecero', 'spell_monk_brewmaster_spec'], mistweaver: ['Mistweaver', 'Tejedor de niebla', 'spell_monk_mistweaver_spec'], windwalker: ['Windwalker', 'Viajero del viento', 'spell_monk_windwalker_spec'] },
  paladin: { holy: ['Holy', 'Sagrado', 'spell_holy_holybolt'], protection: ['Protection', 'Protección', 'ability_paladin_shieldofthetemplar'], retribution: ['Retribution', 'Reprensión', 'spell_holy_auraoflight'] },
  priest: { discipline: ['Discipline', 'Disciplina', 'spell_holy_powerwordshield'], holy: ['Holy', 'Sagrado', 'spell_holy_guardianspirit'], shadow: ['Shadow', 'Sombra', 'spell_shadow_shadowwordpain'] },
  rogue: { assassination: ['Assassination', 'Asesinato', 'ability_rogue_eviscerate'], outlaw: ['Outlaw', 'Forajido', 'ability_rogue_waylay'], subtlety: ['Subtlety', 'Sutileza', 'ability_stealth'] },
  shaman: { elemental: ['Elemental', 'Elemental', 'spell_nature_lightning'], enhancement: ['Enhancement', 'Mejora', 'spell_shaman_improvedstormstrike'], restoration: ['Restoration', 'Restauración', 'spell_nature_magicimmunity'] },
  warlock: { affliction: ['Affliction', 'Aflicción', 'spell_shadow_deathcoil'], demonology: ['Demonology', 'Demonología', 'spell_shadow_metamorphosis'], destruction: ['Destruction', 'Destrucción', 'spell_shadow_rainoffire'] },
  warrior: { arms: ['Arms', 'Armas', 'ability_warrior_savageblow'], fury: ['Fury', 'Furia', 'ability_warrior_innerrage'], protection: ['Protection', 'Protección', 'ability_warrior_defensivestance'] },
};

if (typeof module !== 'undefined') module.exports = { CLASS_COLORS, QUALITY_COLORS, SPECS };
