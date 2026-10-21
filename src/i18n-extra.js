'use strict';
// Idiomas disponibles: español e inglés
const LANGS = [['es', 'Español'], ['en', 'English']];
// nombres de especialización y de buffos de banda traducidos (vacío: se usan los de es/en de los propios datos)
const SPEC_L10N = {};
const BUFF_L10N = {};
Object.assign(I18N.es, {
  statSims: 'Simulaciones', statChars: 'Personajes', statItems: 'Piezas con mejora', statBest: 'Mejor mejora',
  persSumItems: 'Piezas', persSumSources: 'Fuentes', persSumTop: 'Mejor pieza',
  roFilterAll: 'Todos', roFilterMissing: 'Faltan', roFilterDone: 'Con sim'
});
Object.assign(I18N.en, {
  statSims: 'Simulations', statChars: 'Characters', statItems: 'Upgrade items', statBest: 'Best upgrade',
  persSumItems: 'Items', persSumSources: 'Sources', persSumTop: 'Best item',
  roFilterAll: 'All', roFilterMissing: 'Missing', roFilterDone: 'Has sim'
});
