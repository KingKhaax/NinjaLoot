# NinjaLoot

Gráficas de mejoras de objetos a partir de simulaciones **Droptimizer** de Raidbots.

- Pega una o varias URLs de Raidbots (`https://www.raidbots.com/simbot/report/...`), o arrástralas a la ventana.
- Gráfica general: la mejor mejora de cada jugador, ordenada de mayor a menor, con color e icono de clase.
- Una gráfica por jugador con todos sus objetos (iconos y nombres localizados).
- Español / Inglés (botón 🌐), ajustes, modo claro/oscuro/sistema, colores personalizables, exportar a PNG.
- Pestaña **Rotaciones**: jefes de la temporada activa (datos de Raidbots), banda por jefe con clics y comprobación de buffs/debuffs de banda (en rojo los que faltan).
- Tooltip de objeto al pasar el ratón (estadísticas y nivel de objeto) y aviso **Cuidado** cuando una mejora se debe a una pieza equipada de nivel muy bajo.
- Quitar una simulación (✕) o borrarlas todas.

## Descarga

Descarga la última versión desde [Releases](https://github.com/KingKhaax/NinjaLoot/releases/latest):

- `NinjaLoot vX.Y.Z Setup.exe`: instalador (se desinstala desde *Configuración → Aplicaciones* de Windows).
- `NinjaLoot vX.Y.Z.exe`: versión portable, no necesita instalación.
- `SHA256SUMS.txt`: hashes para comprobar los archivos.

Los ejecutables están firmados digitalmente (ver [Code signing policy](#code-signing-policy)).

## Desarrollo

```
npm install
npm start            # ejecutar
npm run dist         # generar instalador y portable en dist/
node tools/test-parser.js
```

Los iconos (`src/assets`) y `src/data/items.js` se generan con `node tools/build-assets.mjs <CleanIcons-MechagnomeEdition.zip>`
a partir de la release de https://github.com/AcidWeb/Clean-Icons-Mechagnome-Edition (solo objetos de Dragonflight en adelante; el resto se carga de Wowhead/zamimg).

Las releases oficiales se compilan y firman en GitHub Actions ([`.github/workflows/release.yml`](.github/workflows/release.yml)).

## Code signing policy

Free code signing provided by [SignPath.io](https://about.signpath.io/), certificate by [SignPath Foundation](https://signpath.org/).

- Committers and reviewers: [KingKhaax](https://github.com/KingKhaax)
- Approvers: [KingKhaax](https://github.com/KingKhaax)

Release binaries are built from this repository's source code by GitHub Actions and every signing request is approved manually.

## Privacy policy

NinjaLoot does not collect, store or send personal data or telemetry. To work, it makes these requests (only the request itself and your IP address reach these services):

| Service | When | Purpose |
|---|---|---|
| [Raidbots](https://www.raidbots.com/) | When you add a Raidbots report, and at startup | Download the reports you add and the current season's boss list |
| [Wowhead](https://www.wowhead.com/) / zamimg.com | When item names, tooltips or icons are shown | Localized item names, tooltips and icons |
| [GitHub](https://github.com/) | At startup, and when you click update | Check for a new version and download the installer |

Their privacy policies: [Raidbots](https://www.raidbots.com/privacy), [Wowhead](https://www.wowhead.com/privacy), [GitHub](https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement).

## License

[MIT](LICENSE)
