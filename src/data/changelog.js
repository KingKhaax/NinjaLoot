'use strict';

// Historial de versiones de NinjaLoot (Ajustes → Versión). La más reciente arriba.
// Cada entrada agrupa varias versiones pequeñas en una sola «versión» con un resumen y sus cambios por secciones (icono de WoW, título y viñetas).
// Se numera con la última versión del grupo. Los cambios que solo tocan colores, tamaños o ajustes internos no se cuentan.
// Estructura: { v, date, es: { intro, sections: [[icono, título, [viñetas]]] }, en: { ... } }
const RELEASES = [
  { v: '1.8.28', date: '2026-10-29',
    es: { intro: 'Versión móvil, NinjaBot con elección de cada cuánto recoge las sims, gráficas paginadas y un pulido visual de toda la aplicación.', sections: [
      ['inv_misc_net_01', 'Versión móvil', ['En pantallas pequeñas la navegación pasa a una barra de pestañas abajo, la cabecera se compacta, los botones y filtros se adaptan al dedo, los ajustes se abren como una hoja desde abajo y ninguna sección se sale por los lados.']],
      ['inv_misc_horn_02', 'NinjaBot y Discord', [
        'El bot de Discord pasa a llamarse NinjaBot en toda la aplicación y «Invitar NinjaBot a tu servidor» abre siempre su enlace de invitación público.',
        'Nuevo selector «Sims que recoge» en Ajustes → Discord: en cada reinicio semanal (por defecto) o cada 1 a 6 días. Solo se añaden las sims pegadas dentro de ese periodo.',
        'En el Roster, cada jugador que ya subió su sim indica si llegó «Vía NinjaBot» (con quién la pegó) o «A mano». Arreglado el interruptor «Leer el canal automáticamente», que no se dejaba activar.',
      ]],
      ['achievement_bg_winwsg', 'Gráficas', ['Cuando un jugador tiene más objetos de los que caben, salen flechas para pasar a los siguientes con el contador «11–20 de 20», con la escala igual en todas las páginas para comparar las barras.']],
      ['inv_chest_plate04', 'Piezas de tier de Kith’ix', ['Las piezas pasadas a catalizador cuyo original suelta ese mismo jefe indican que conservan la pasiva y las estadísticas de la pieza original, además de contar como pieza de tier.']],
      ['inv_gizmo_02', 'Apariencia', ['Barra superior con iconos que siguen el color del tema y un indicador bajo la sección activa, cifras clave sobre las gráficas, tarjeta del personaje en Personal, cabecera de cada clase en Tiers con la imagen del jefe, pasos numerados en Inicio y estados vacíos con ilustración.', 'En Todas las piezas, cada objeto de una tarjeta de jefe es ahora un bloque propio con una franja del color de su calidad (épico, raro…), un borde marcado y más aire entre ellos, para que no se vean pegados aunque salgan muchos a la vez. La cabecera del jefe es más sencilla: icono, nombre y la mejora total.']],
      ['inv_misc_book_11', 'Nombres en español', ['Nombres corregidos con los archivos del juego en castellano («Abismo Venenoso», «La Gruta Mareal», «La liberación de Kith’ix») y el nombre de la banda centrado sobre las columnas de jefes en Rotaciones.']],
      ['inv_shield_04', 'Rendimiento y accesibilidad', ['Carga más rápida, sobre todo en el móvil: los fondos pesan hasta un 85 % menos sin cambiar su aspecto, el de la portada se pide antes y la web guarda mejor sus archivos para que las visitas siguientes vayan casi al instante.', 'Mejor accesibilidad y búsqueda: selector de región del Roster y botón de idioma con nombre para lectores de pantalla y descripción de la web para los buscadores.', 'En el móvil, las animaciones continuas (fondo en movimiento, logo que flota y halos) se quedan quietas para ahorrar batería y hacer más fluido el desplazamiento. Se pueden reactivar en Ajustes → Apariencia → «Animaciones continuas en el móvil».', 'Las letras de la región (EU, US…) del reloj del servidor se leen mejor sobre el fondo oscuro.']],
    ] },
    en: { intro: 'A mobile version, NinjaBot with a choice of how often it picks up sims, paged charts and a visual polish across the whole app.', sections: [
      ['inv_misc_net_01', 'Mobile version', ['On small screens navigation moves to a bottom tab bar, the header compacts, buttons and filters fit a finger, settings open as a sheet from the bottom and no section overflows the sides.']],
      ['inv_misc_horn_02', 'NinjaBot and Discord', [
        'The Discord bot is now called NinjaBot across the app and “Invite NinjaBot to your server” always opens its public invite link.',
        'New “Sims it picks up” selector in Settings → Discord: every weekly reset (default) or every 1 to 6 days. Only sims pasted within that period are added.',
        'In the Roster, each player who already uploaded their sim shows whether it came “Via NinjaBot” (and who pasted it) or “By hand”. Fixed the “Read the channel automatically” switch, which would not turn on.',
      ]],
      ['achievement_bg_winwsg', 'Charts', ['When a player has more items than fit, arrows appear to move to the next ones with the counter “11–20 of 20”, with the same scale on every page so bars can be compared.']],
      ['inv_chest_plate04', 'Kith’ix tier pieces', ['Pieces converted at the Catalyst whose original drops from that same boss now say they keep the original piece’s passive and stats, besides counting as a tier piece.']],
      ['inv_gizmo_02', 'Appearance', ['Top bar with icons that follow the theme color and an indicator under the active section, key figures above the charts, the character card in Personal, each class header in Tiers with the boss image, numbered steps on Home and illustrated empty states.', 'In All pieces, each item inside a boss card is now its own block with a stripe in its quality color (epic, rare…), a clear border and more space between them, so they do not look stuck together even when many appear at once. The boss header is simpler: icon, name and the total gain.']],
      ['inv_misc_book_11', 'Spanish names', ['Names corrected with the Spanish game files (“Abismo Venenoso”, “La Gruta Mareal”, “La liberación de Kith’ix”) and the raid name centered above the boss columns in Rotations.']],
      ['inv_shield_04', 'Performance and accessibility', ['Faster loading, especially on mobile: backgrounds weigh up to 85% less without changing their look, the home one is requested earlier and the web caches its files better so repeat visits are almost instant.', 'Better accessibility and search: the Roster region selector and the language button now have names for screen readers and the site has a description for search engines.', 'On phones, ambient animations (moving background, floating logo and halos) stay still to save battery and scroll more smoothly. They can be turned back on in Settings → Appearance → “Ambient animations on phones”.', 'The region letters (EU, US…) of the server clock are easier to read on the dark background.']],
    ] } },

  { v: '1.7.4', date: '2026-10-21',
    es: { intro: 'Todas las piezas se ordena como en Raidbots, los anillos y abalorios indican su hueco exacto y los iconos ya no fallan.', sections: [
      ['inv_misc_book_11', 'Todas las piezas', ['El selector de orden funciona como el de Raidbots: «Valor esperado» es el DPS medio de todas las piezas del jefe y «Prioridad» agrupa los jefes con un valor esperado parecido y pone primero el que más probabilidad tiene de darte una mejora.']],
      ['inv_chest_plate04', 'Anillos y abalorios', ['Se indica para qué hueco exacto es la mejora (anillo 1 o 2, abalorio 1 o 2), en Todas las piezas y también en Dónde tirar moneda.']],
      ['inv_shield_04', 'Iconos fiables', [
        'Los iconos de jefes y mazmorras (142) van dentro de la aplicación, también los de las mazmorras que no tenían icono, así que salen siempre y sin conexión.',
        'Los iconos de objetos se guardan por nombre en una caché propia que no se borra al actualizar; si un servidor falla se prueba el CDN de Blizzard y, si ninguno sirve, sale un signo de interrogación guardado en la app en vez de un icono roto.',
      ]],
    ] },
    en: { intro: 'All pieces sorts like Raidbots, rings and trinkets show their exact slot and icons no longer fail.', sections: [
      ['inv_misc_book_11', 'All pieces', ['The sort selector works like Raidbots’: “Expected value” is the average DPS of all the boss’s pieces and “Priority” groups bosses with a similar expected value and puts first the one most likely to give you an upgrade.']],
      ['inv_chest_plate04', 'Rings and trinkets', ['The exact slot the upgrade is for (ring 1 or 2, trinket 1 or 2) is shown, in All pieces and also in Where to spend coins.']],
      ['inv_shield_04', 'Reliable icons', [
        'Boss and dungeon icons (142) ship inside the app, including those of the dungeons that had none, so they always show, even offline.',
        'Item icons are stored by name in their own cache that is not cleared on update; if a server fails the Blizzard CDN is tried and, if none works, a question mark stored in the app shows instead of a broken icon.',
      ]],
    ] } },

  { v: '1.6.9', date: '2026-10-20',
    es: { intro: 'Las simulaciones tienen una cabecera como la de Raidbots, las piezas de tier muestran sus estadísticas exactas y Todas las piezas pasa a ser botín por jefe.', sections: [
      ['achievement_bg_winwsg', 'Cabecera de las simulaciones', [
        'Una cabecera como la de Raidbots según el tipo (Droptimizer, Quick Sim o Top Gear): título, DPS grande, opciones de la sim, personaje con raza, nivel y reino, botón para exportar SimC y la fila de equipo con su nivel de objeto medio.',
        'El personaje sale con su modelo 3D y, sobre cada pieza equipada, su nivel de objeto exacto con el color de su mejora (naranja Mítico, morado Heroico, azul Campeón, verde Veterano). Junto a «de hoy» o «hace N días» sale la hora de la sim.',
        'Las simulaciones guardadas antes de la cabecera nueva se actualizan solas una vez, en silencio.',
      ]],
      ['inv_misc_book_11', 'Todas las piezas', ['Se ve como botín por jefe: una tarjeta por jefe o mazmorra con sus piezas, lo que suman en DPS y las de mayor mejora arriba, con un selector de orden (Prioridad, Orden de jefes, Valor esperado, Mejor).', 'La cabecera de cada jefe se distingue claramente de las piezas.']],
      ['inv_chest_plate04', 'Piezas de tier', ['La columna de estadísticas lleva entre paréntesis la cantidad exacta de cada una, el tooltip ya no incluye el bloque gigante del conjunto y cada jefe lleva su icono.', 'Las piezas de Ula’tek pasadas a catalizador con una sola estadística y una pasiva avisan de que conservan esa pasiva, y las de tier normal llevan el bibelot que dropea al matarlo.']],
    ] },
    en: { intro: 'Simulations have a Raidbots-style header, tier pieces show their exact stats and All pieces becomes loot per boss.', sections: [
      ['achievement_bg_winwsg', 'Simulation header', [
        'A Raidbots-style header by type (Droptimizer, Quick Sim or Top Gear): title, big DPS, sim options, character with race, level and realm, a button to export SimC and the gear row with its average item level.',
        'The character shows with their 3D model and, above each equipped piece, its exact item level in the color of its upgrade (orange Mythic, purple Heroic, blue Champion, green Veteran). Next to “today” or “N days ago” the sim’s time shows.',
        'Simulations saved before the new header update themselves once, silently.',
      ]],
      ['inv_misc_book_11', 'All pieces', ['Shown as loot per boss: one card per boss or dungeon with its pieces, what they add in DPS and the biggest upgrades on top, with a sort selector (Priority, Boss order, Expected value, Best).', 'Each boss header stands clearly apart from the pieces.']],
      ['inv_chest_plate04', 'Tier pieces', ['The stats column shows the exact amount of each in parentheses, the tooltip no longer includes the giant set block and each boss carries its icon.', 'Ula’tek pieces converted at the Catalyst with a single stat and a passive warn that they keep that passive, and normal tier ones carry the trinket it drops.']],
    ] } },

  { v: '1.5.0', date: '2026-10-20',
    es: { intro: 'Dónde tirar moneda estrena podio, los avisos de versión nueva llegan a la web y los jefes salen en español.', sections: [
      ['inv_chest_plate04', 'Dónde tirar moneda', ['Rediseñado: un resumen arriba (monedas, DPS que ganas, mejora total y fuentes distintas), un podio con las tres mejores monedas en tarjetas grandes y el resto del plan en una lista compacta.']],
      ['inv_misc_book_11', 'En español', ['Con la web en español las bandas y los jefes de la temporada salen en español, con sus iconos. En Rotaciones sale la semana actual, de reinicio a reinicio, en vez del nombre de la temporada.']],
      ['inv_misc_net_01', 'Web', ['Cuando hay una versión nueva sale un aviso abajo con el botón «Recargar».', 'La portada siempre tiene la dirección limpia (ninjaloot.vercel.app).']],
      ['inv_scroll_03', 'Avisos y seguridad', ['Cada vez que copias algo sale un aviso en medio de la pantalla, y el historial de versiones pasa a tarjetas con iconos de WoW.', 'Se elimina el envío de mensajes privados por Discord: el bot solo puede leer los enlaces de Raidbots del canal.']],
    ] },
    en: { intro: 'Where to spend coins gets a podium, new-version notices reach the web and bosses show in Spanish.', sections: [
      ['inv_chest_plate04', 'Where to spend coins', ['Redesigned: a summary on top (coins, DPS you gain, total upgrade and distinct sources), a podium with the three best coins in big cards and the rest of the plan in a compact list.']],
      ['inv_misc_book_11', 'In Spanish', ['With the web in Spanish the season’s raids and bosses show in Spanish, with their icons. Rotations shows the current week, reset to reset, instead of the season name.']],
      ['inv_misc_net_01', 'Web', ['When there is a new version a notice appears at the bottom with a “Reload” button.', 'The home page always has a clean address (ninjaloot.vercel.app).']],
      ['inv_scroll_03', 'Notices and security', ['Every time you copy something a notice appears in the middle of the screen, and the version history becomes cards with WoW icons.', 'Sending private Discord messages is removed: the bot can only read the Raidbots links in the channel.']],
    ] } },

  { v: '1.3.1', date: '2026-10-19',
    es: { intro: 'Ajustes renovados, una dirección propia para cada pantalla, objetos que abren Wowhead y un aviso más fiable para las sims caducadas.', sections: [
      ['inv_gizmo_02', 'Ajustes', ['Pestaña Listas, tamaño de la interfaz con deslizador, densidad Cómoda y «Restablecer todos los ajustes» con confirmación.', 'Versión y Acerca de en una sola pestaña, con el historial de las últimas 10 versiones. La pestaña Discord avisa al guardar y tiene un botón para desconectar el canal.']],
      ['inv_misc_net_01', 'Direcciones', ['Cada pantalla tiene su propia dirección (#/tiers, #/charts, #/rotations…): Atrás vuelve a la pantalla anterior, F5 se queda donde estabas y los enlaces se abren en otra ventana o pestaña.']],
      ['inv_chest_plate04', 'Objetos y sims', [
        'Pulsar un objeto abre su página de Wowhead en el idioma de la web, y los cuadrados de objeto brillan y se levantan al pasar el ratón.',
        'Tus guantes u otra pieza ya no salen cambiados por error: NinjaLoot compara con la fecha de los datos de Raider.IO y cada cambio tiene un botón «Es correcto».',
        'Dónde tirar moneda tiene un selector Todo / Raid / M+ y cada fila lleva el icono del jefe o de la mazmorra.',
      ]],
      ['inv_gizmo_02', 'Apariencia', ['Barras cuadradas en gráficas y tablas, iconos de jefe en los títulos, mejor aspecto en el tema claro y el reloj del servidor con el estilo de consola.']],
    ] },
    en: { intro: 'Revamped settings, its own address for every screen, items that open Wowhead and a more reliable warning for expired sims.', sections: [
      ['inv_gizmo_02', 'Settings', ['Lists tab, interface size with a slider, Comfortable density and “Reset all settings” with confirmation.', 'Version and About in a single tab, with the history of the latest 10 versions. The Discord tab warns on save and has a button to disconnect the channel.']],
      ['inv_misc_net_01', 'Addresses', ['Every screen has its own address (#/tiers, #/charts, #/rotations…): Back returns to the previous screen, F5 stays where you were and links open in another window or tab.']],
      ['inv_chest_plate04', 'Items and sims', [
        'Clicking an item opens its Wowhead page in the website language, and item squares glow and lift on hover.',
        'Your gloves or another piece no longer show as swapped by mistake: NinjaLoot compares against the date of the Raider.IO data and each change has an “It is correct” button.',
        'Where to spend coins has an All / Raid / M+ selector and each row carries the boss or dungeon icon.',
      ]],
      ['inv_gizmo_02', 'Appearance', ['Square bars in charts and tables, boss icons in titles, better light-theme look and the server clock in console style.']],
    ] } },

  { v: '0.9.0', date: '2026-10-17',
    es: { intro: 'NinjaLoot vuelve a ser totalmente independiente y la web carga mucho más rápido.', sections: [
      ['inv_misc_net_01', 'Web más rápida', ['Scripts y estilos en un solo archivo, los datos grandes se leen como JSON, las fuentes principales se precargan y un service worker guarda lo estático: la primera carga pasa de 5,4 s a 3,5 s y la web abre incluso sin conexión.']],
      ['inv_misc_horn_02', 'Independencia', ['Se quitan el botón «Ver ficha» y el filtro de asistentes que llegaba desde otra web: NinjaLoot funciona por sí solo.']],
    ] },
    en: { intro: 'NinjaLoot is fully independent again and the web loads much faster.', sections: [
      ['inv_misc_net_01', 'Faster web', ['Scripts and styles in a single file, big data read as JSON, main fonts preloaded and a service worker that stores static files: first load goes from 5.4 s to 3.5 s and the web opens even offline.']],
      ['inv_misc_horn_02', 'Independence', ['The “View profile” button and the attendee filter that came from another website are removed: NinjaLoot works on its own.']],
    ] } },

  { v: '0.7.1', date: '2026-10-16',
    es: { intro: 'Más tipos de simulación, filtros por rol y clase, sesiones guardadas y enlaces para compartir.', sections: [
      ['achievement_bg_winwsg', 'Simulaciones', [
        'Además de Droptimizer se aceptan Quick Sim (DPS total y estadísticas) y Top Gear (ranking de combinaciones de equipo), en un panel propio.',
        'Importar loot: pega o elige el historial exportado de RCLootCouncil y las mejoras ya entregadas esta semana salen marcadas como «ya lo lleva».',
        'Las simulaciones que conviene repetir no avisan de lo que el personaje ya llevaba al simular, y el «?» explica el motivo exacto con los objetos implicados.',
      ]],
      ['inv_misc_gem_diamond_07', 'Filtros, sesiones y compartir', [
        'Filtros por rol (Tank, Sanador, DPS) y por clase en las gráficas, que afectan a todas las vistas.',
        'Sesiones guardadas: guarda el conjunto de simulaciones de una raid con nombre y fecha y ábrelo cuando quieras.',
        'Compartir: genera un enlace que abre NinjaLoot web con tus mismas simulaciones.',
      ]],
      ['inv_scroll_03', 'Modo captura', ['Una imagen limpia y compacta de la gráfica general, con tus filtros, para copiar al portapapeles o guardar como PNG, y barras con degradado y brillo del color de la clase.']],
    ] },
    en: { intro: 'More simulation types, role and class filters, saved sessions and share links.', sections: [
      ['achievement_bg_winwsg', 'Simulations', [
        'Besides Droptimizer, Quick Sim (total DPS and stats) and Top Gear (ranking of gear combinations) are accepted, in their own panel.',
        'Import loot: paste or pick the exported RCLootCouncil history and upgrades already awarded this week show as “already has it”.',
        'Sims worth redoing no longer warn about what the character already wore when simulating, and the “?” explains the exact reason with the items involved.',
      ]],
      ['inv_misc_gem_diamond_07', 'Filters, sessions and sharing', [
        'Role (Tank, Healer, DPS) and class filters in the charts, affecting every view.',
        'Saved sessions: save a raid’s set of simulations with a name and date and open it whenever you want.',
        'Share: generates a link that opens NinjaLoot web with your same simulations.',
      ]],
      ['inv_scroll_03', 'Capture mode', ['A clean, compact image of the general chart, with your filters, to copy to the clipboard or save as PNG, and bars with a class-colored gradient and shine.']],
    ] } },

  { v: '0.4.6', date: '2026-10-16',
    es: { intro: 'Reloj del servidor, Tiers con especializaciones desplegables y la aplicación en español e inglés.', sections: [
      ['inv_misc_gear_01', 'Reloj del servidor', ['Reloj arriba a la izquierda (Europa por defecto; América, Latinoamérica, Oceanía, Corea y Taiwán en Ajustes → General) con cuenta atrás al reinicio semanal al pasar el ratón.']],
      ['inv_chest_plate04', 'Tiers', ['Cada especialización es un desplegable cerrado y el texto de los bonus de 2 y 4 piezas solo aparece al pulsarla. El bonus de 4 piezas del Elemental, que salía en portugués, está en castellano con los nombres oficiales.']],
      ['inv_gizmo_02', 'Idiomas y botones', ['La aplicación queda en español e inglés.', 'Los botones de color brillan, se elevan y se iluminan al pasar el ratón, y la barra superior pasa a Inicio, Tiers, Simulación personal, Gráficas, Rotaciones y Roster.']],
    ] },
    en: { intro: 'Server clock, Tiers with collapsible specializations and the app in Spanish and English.', sections: [
      ['inv_misc_gear_01', 'Server clock', ['Clock at the top left (Europe by default; Americas, Latin America, Oceania, Korea and Taiwan in Settings → General) with a weekly-reset countdown on hover.']],
      ['inv_chest_plate04', 'Tiers', ['Each specialization is a closed dropdown and the 2- and 4-piece bonus text only appears when clicked. The Elemental 4-piece bonus, which showed in Portuguese, is in Spanish with the official names.']],
      ['inv_gizmo_02', 'Languages and buttons', ['The app is now Spanish and English.', 'Colored buttons glow, lift and light up on hover, and the top bar becomes Home, Tiers, Personal simulation, Charts, Rotations and Roster.']],
    ] } },

  { v: '0.2.9', date: '2026-10-14',
    es: { intro: 'NinjaLoot llega a la web, con NinjaBot, Roster, cofre semanal y el nuevo jefe Kith’ix.', sections: [
      ['inv_misc_net_01', 'Web y NinjaBot', ['NinjaLoot también en la web: kingkhaax.github.io/NinjaLoot, sin instalar nada.', 'Bot de Discord compartido: no hay que crear un bot ni tocar tokens, basta con invitar NinjaBot y pegar el enlace del canal.', 'Exportar datos a CSV o JSON eligiendo qué exportar: todo, un jefe, un jugador o una pieza.']],
      ['inv_shirt_guildtabard_01', 'Roster', ['Nueva pestaña Roster: añade a tu raid a mano o importa la guild desde Raider.IO y ve quién ha subido su sim esta semana y a quién le falta. NinjaBot te manda por mensaje privado la lista de quién falta.']],
      ['inv_misc_book_11', 'Cofre semanal', ['Nuevo apartado en Simulación personal con el estado del cofre del personaje: jefes de banda y llaves de esta semana y qué te dará cada casilla, con nivel de objeto, calidad y rango (1/6…). Una fila «Mundo» que apuntas tú.']],
      ['inv_chest_plate04', 'Kith’ix', ['Nuevo jefe de banda: Kith’ix. Ahora son 10 jefes y las 45 piezas nuevas salen en las gráficas, en la simulación personal y en «Dónde tirar moneda», que también incluye piezas de mítica+, bajadas y presas.']],
    ] },
    en: { intro: 'NinjaLoot arrives on the web, with NinjaBot, Roster, weekly vault and the new boss Kith’ix.', sections: [
      ['inv_misc_net_01', 'Web and NinjaBot', ['NinjaLoot also on the web: kingkhaax.github.io/NinjaLoot, with nothing to install.', 'Shared Discord bot: no need to create a bot or touch tokens, just invite NinjaBot and paste the channel link.', 'Export data to CSV or JSON choosing what to export: everything, a boss, a player or a piece.']],
      ['inv_shirt_guildtabard_01', 'Roster', ['New Roster tab: add your raid by hand or import the guild from Raider.IO and see who uploaded their sim this week and who is missing. NinjaBot sends you the list of who is missing by private message.']],
      ['inv_misc_book_11', 'Weekly vault', ['New section in Personal simulation with the character’s vault status: this week’s raid bosses and keys and what each slot will give, with item level, quality and rank (1/6…). A “World” row that you fill in.']],
      ['inv_chest_plate04', 'Kith’ix', ['New raid boss: Kith’ix. There are now 10 bosses and the 45 new pieces show in the charts, in personal simulation and in “Where to spend coins”, which also includes Mythic+, delve and prey pieces.']],
    ] } },

  { v: '0.1.16', date: '2026-10-11',
    es: { intro: 'Las primeras versiones: gráficas de mejoras a partir de simulaciones de Raidbots, con Tiers, Rotaciones y Dónde tirar moneda.', sections: [
      ['achievement_bg_winwsg', 'Gráficas', ['Gráficas de mejoras de objetos a partir de simulaciones de Raidbots, por jefe y por jugador, con el color de clase, el icono del objeto, su tooltip y el DPS exacto al pasar el ratón.', 'Filtro por dificultad, por raid y por jefe, con el tipo de armadura de cada objeto.']],
      ['inv_chest_plate04', 'Simulación personal', [
        'Varias simulaciones de una misma persona (raid, míticas, otro contenido) juntas para comparar, con la mejor pieza de cada fuente y una vista «Comparar sims».',
        '«Dónde tirar moneda»: un plan para varias semanas según las monedas que tengas, que no gasta dos en la misma ranura.',
        'Sims caducadas: mira en Raider.IO el equipo actual, tacha las mejoras que ya lleva y avisa si la sim es antigua o el equipo ha cambiado.',
      ]],
      ['inv_misc_book_11', 'Tiers y Rotaciones', ['Pestaña Tiers con los bonus de 2 y 4 piezas de cada especialización y las piezas de tier con sus estadísticas.', 'Rotaciones a un clic (✓ no rota, ✗ rota, ? pendiente) con buffs y debuffs de banda, avisos de Cuidado y cofre semanal.']],
      ['inv_misc_horn_02', 'Discord y exportar', ['Sims automáticas desde Discord: conecta NinjaBot a un canal y cada enlace de Raidbots que se pegue se añade solo a Gráficas.', 'Exportar a CSV o JSON, y búsqueda de actualizaciones que ya no depende de la API de GitHub.']],
    ] },
    en: { intro: 'The first versions: upgrade charts from Raidbots simulations, with Tiers, Rotations and Where to spend coins.', sections: [
      ['achievement_bg_winwsg', 'Charts', ['Item upgrade charts from Raidbots simulations, per boss and per player, with class color, item icon, tooltip and the exact DPS on hover.', 'Filter by difficulty, raid and boss, with each item’s armor type.']],
      ['inv_chest_plate04', 'Personal simulation', [
        'Several simulations of the same person (raid, Mythic+, other content) together to compare, with the best piece of each source and a “Compare sims” view.',
        '“Where to spend coins”: a multi-week plan based on the coins you have, which never spends two on the same slot.',
        'Expired sims: checks the current gear on Raider.IO, crosses out upgrades already worn and warns if the sim is old or gear changed.',
      ]],
      ['inv_misc_book_11', 'Tiers and Rotations', ['Tiers tab with the 2- and 4-piece bonuses of each specialization and the tier pieces with their stats.', 'One-click Rotations (✓ does not rotate, ✗ rotates, ? pending) with raid buffs and debuffs, Caution warnings and the weekly vault.']],
      ['inv_misc_horn_02', 'Discord and export', ['Automatic sims from Discord: connect NinjaBot to a channel and every Raidbots link pasted there is added to Charts by itself.', 'Export to CSV or JSON, and update checking that no longer depends on the GitHub API.']],
    ] } },
];

// Formato [versión, resumen] que usa el resto de la aplicación
const CHANGELOG = { es: RELEASES.map((r) => [r.v, r.es.intro]), en: RELEASES.map((r) => [r.v, r.en.intro]) };

const logEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const logIconUrl = n => `https://wow.zamimg.com/images/wow/icons/medium/${n}.jpg`;
// Tarjetas del historial: título con la versión y «Novedades», fecha, resumen y cambios por secciones que se despliegan al pulsar la cabecera
function changelogCards(list, lang, latestLabel) {
  const es = lang === 'es';
  return `<div class="cl-list">${list.map(([v], i) => {
    const rel = RELEASES.find(r => r.v === v);
    if (!rel) return '';
    const r = rel[es ? 'es' : 'en'];
    const latest = i === 0;
    const date = rel.date ? new Date(`${rel.date}T12:00:00`).toLocaleDateString(es ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    return `<article class="cl-card${latest ? ' latest' : ''} open"><header class="cl-head" data-cl-toggle role="button" tabindex="0" aria-expanded="true"><img class="cl-ic" src="${logIconUrl(r.sections[0] ? r.sections[0][0] : 'inv_scroll_02')}" width="40" height="40" alt="" loading="lazy">`
      + `<div class="cl-ht"><b class="cl-ver">v${logEsc(v)} · ${es ? 'Novedades' : 'What’s new'}</b>${latest ? `<span class="cl-tag">${logEsc(latestLabel)}</span>` : ''}${date ? `<small class="cl-date">${logEsc(date)}</small>` : ''}</div><span class="cl-chev" aria-hidden="true"></span></header>`
      + `<p class="cl-intro">${logEsc(r.intro)}</p>`
      + '<div class="cl-body">' + r.sections.map(([ic, title, items]) => `<section class="cl-sec">${ic ? `<img class="cl-sic" src="${logIconUrl(ic)}" width="26" height="26" alt="" loading="lazy">` : ''}<div class="cl-sb">${title ? `<h4>${logEsc(title)}</h4>` : ''}<ul>${items.map(it => `<li>${logEsc(it)}</li>`).join('')}</ul></div></section>`).join('') + '</div>'
      + '</article>';
  }).join('')}</div>`;
}
// Al pulsar la cabecera de una versión se despliegan o se pliegan sus cambios
if (typeof document !== 'undefined') {
  const toggleCard = head => { const card = head.closest('.cl-card'); const on = !card.classList.contains('open'); card.classList.toggle('open', on); head.setAttribute('aria-expanded', String(on)); };
  document.addEventListener('click', ev => { const h = ev.target.closest('[data-cl-toggle]'); if (h) toggleCard(h); });
  document.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('[data-cl-toggle]')) { ev.preventDefault(); toggleCard(ev.target); } });
}
