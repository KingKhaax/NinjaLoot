# NinjaLoot

Gráficas de mejoras de objetos a partir de simulaciones **Droptimizer** de Raidbots.

[![Última versión](https://img.shields.io/github/v/release/KingKhaax/NinjaLoot?label=versi%C3%B3n)](https://github.com/KingKhaax/NinjaLoot/releases/latest)
[![Descargas de la última versión](https://img.shields.io/github/downloads/KingKhaax/NinjaLoot/latest/total?label=descargas%20%C3%BAltima%20versi%C3%B3n&cacheSeconds=300)](https://github.com/KingKhaax/NinjaLoot/releases/latest)
[![Descargas totales](https://img.shields.io/github/downloads/KingKhaax/NinjaLoot/total?label=descargas%20totales&cacheSeconds=300)](https://github.com/KingKhaax/NinjaLoot/releases)
[![Licencia: MIT](https://img.shields.io/github/license/KingKhaax/NinjaLoot?label=licencia)](LICENSE)

- Pega una o varias URLs de Raidbots (`https://www.raidbots.com/simbot/report/...`), o arrástralas a la ventana.
- Gráfica general: la mejor mejora de cada jugador, ordenada de mayor a menor, con color e icono de clase.
- Una gráfica por jugador con todos sus objetos (iconos y nombres localizados).
- Español / Inglés (botón 🌐), ajustes, modo claro/oscuro/sistema, colores personalizables, exportar a PNG.
- Pestaña **Rotaciones**: jefes de la temporada activa (datos de Raidbots), banda por jefe con clics y comprobación de buffs/debuffs de banda (en rojo los que faltan).
- Tooltip de objeto al pasar el ratón (estadísticas y nivel de objeto) y aviso **Cuidado** cuando una mejora se debe a una pieza equipada de nivel muy bajo.
- Quitar una simulación (✕) o borrarlas todas.

## Web

Usa NinjaLoot directamente en el navegador, sin instalar nada:

**[https://kingkhaax.github.io/NinjaLoot/](https://kingkhaax.github.io/NinjaLoot/)**

## Requisitos

- Windows 10 u 11 (64 bits) para el instalable y el portable.
- O cualquier navegador moderno para la [versión web](https://kingkhaax.github.io/NinjaLoot/).
- Una o varias simulaciones **Droptimizer** de [Raidbots](https://www.raidbots.com).

## Descarga

Tres formas de usar NinjaLoot, las tres con las mismas funciones:

- **Web, sin instalar nada:** [kingkhaax.github.io/NinjaLoot](https://kingkhaax.github.io/NinjaLoot/) (siempre la última versión; tus datos se quedan en tu navegador).
- **Instalable:** `NinjaLoot.vX.Y.Z.Setup.exe` en [Releases](https://github.com/KingKhaax/NinjaLoot/releases/latest) (se actualiza solo y se desinstala desde *Configuración → Aplicaciones* de Windows).
- **Portable:** `NinjaLoot.vX.Y.Z.exe` en [Releases](https://github.com/KingKhaax/NinjaLoot/releases/latest), no necesita instalación.

`SHA256SUMS.txt` lleva los hashes para comprobar los archivos.

Los ejecutables están firmados digitalmente (ver [Code signing policy](#code-signing-policy)).

## Novedades

El historial de versiones está en el propio programa (Ajustes → Versión) y en [Releases](https://github.com/KingKhaax/NinjaLoot/releases) (solo se conserva la última).

## Desarrollo

Requiere [Node.js](https://nodejs.org/) 20 o superior.

```
npm install
npm start            # ejecutar
npm run dist         # generar instalador y portable en dist/
node tools/test-parser.js
```

Los iconos (`src/assets`) y `src/data/items.js` se generan con `node tools/build-assets.mjs <CleanIcons-MechagnomeEdition.zip>`
a partir de la release de https://github.com/AcidWeb/Clean-Icons-Mechagnome-Edition (solo objetos de Dragonflight en adelante; el resto se carga de Wowhead/zamimg).

Las releases oficiales se compilan y firman en GitHub Actions ([`.github/workflows/release.yml`](.github/workflows/release.yml)).

## Servidor del bot de Discord (opcional)

El bot compartido de NinjaLoot se ejecuta como una función de Vercel en [`server/`](server/) y lee los enlaces de Raidbots que se pegan en un canal. Para desplegar el tuyo:

```
cd server
npx vercel login
npx vercel link --yes --project ninjaloot-relay
npx vercel env add DISCORD_BOT_TOKEN production --sensitive   # token de tu bot
npx vercel env add DISCORD_CLIENT_ID production                # ID de aplicación (para generar la invitación)
npx vercel deploy --prod --yes
```

- `DISCORD_BOT_TOKEN`: token del bot. Solo vive en Vercel, nunca viaja en la aplicación.
- `DISCORD_CLIENT_ID`: ID de la aplicación de Discord (opcional; sin él la app no puede mostrar el enlace de invitación).
- Rutas: `GET /api/discord?op=info`, `?op=history`, `?channel=ID&after=MSG_ID` y `POST ?op=dm`; el detalle está en los comentarios de [`server/api/discord.js`](server/api/discord.js).

> Las secciones *Code signing policy* y *Privacy policy* están en inglés a propósito (requisito de la firma de código y de las políticas de privacidad).

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
| NinjaLoot Discord bot (server on [Vercel](https://vercel.com/)) | Only if you turn on Settings → Discord | The channel ID you choose; the bot server reads new messages there and returns only the codes of Raidbots links. Nothing else is stored |

Their privacy policies: [Raidbots](https://www.raidbots.com/privacy), [Wowhead](https://www.wowhead.com/privacy), [GitHub](https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement), [Discord](https://discord.com/privacy).

Full documents: [Privacy Policy](https://kingkhaax.github.io/NinjaLoot/privacy.html) · [Terms of Service](https://kingkhaax.github.io/NinjaLoot/terms.html)

## License

[MIT](LICENSE)
