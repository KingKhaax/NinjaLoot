# NinjaLoot

Gráficas de mejoras de objetos a partir de simulaciones **Droptimizer** de Raidbots.

- Pega una o varias URLs de Raidbots (`https://www.raidbots.com/simbot/report/...`), o arrástralas a la ventana.
- Gráfica general: la mejor mejora de cada jugador, ordenada de mayor a menor, con color e icono de clase.
- Una gráfica por jugador con todos sus objetos (iconos y nombres localizados).
- Español / Inglés (botón 🌐), ajustes, modo claro/oscuro/sistema, colores personalizables, exportar a PNG.
- Pestaña **Rotaciones**: jefes de la temporada activa (datos de Raidbots), banda por jefe con clics y comprobación de buffs/debuffs de banda (en rojo los que faltan).
- Tooltip de objeto al pasar el ratón (estadísticas y nivel de objeto) y aviso **Cuidado** cuando una mejora se debe a una pieza equipada de nivel muy bajo.
- Quitar una simulación (✕) o borrarlas todas.

## Desarrollo

```
npm install
npm start            # ejecutar
npm run dist         # generar instalador y portable en dist/
node tools/test-parser.js
```

Los iconos (`src/assets`) y `src/data/items.js` se generan con `node tools/build-assets.mjs <CleanIcons-MechagnomeEdition.zip>`
a partir de la release de https://github.com/AcidWeb/Clean-Icons-Mechagnome-Edition (solo objetos de Dragonflight en adelante; el resto se carga de Wowhead/zamimg).
