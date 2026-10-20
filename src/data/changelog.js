'use strict';
// Historial de versiones (Ajustes → Versión). La más reciente arriba.
const CHANGELOG = {
  es: [
    ['1.6.7', 'Todas las piezas: la cabecera de cada jefe se distingue claramente de las piezas, con una banda de color arriba, fondo degradado, icono más grande con marco y nombre y total más grandes.'],
    ['1.6.6', 'El nivel de objeto de encima de cada pieza de la cabecera también lleva color en las simulaciones antiguas o en piezas sin mejora (crafteadas): se colorea por tramos de nivel de objeto (naranja Mítico, morado Heroico, azul Normal, verde por debajo y gris lo inferior).'],
    ['1.6.5', 'Piezas de tier: se quita el texto repetido «Entre paréntesis, lo que da cada estadística…» de debajo de la tabla, y el bibelot de Ula’tek sale con su nombre en el idioma de la web.'],
    ['1.6.4', 'Piezas de tier: la columna de estadísticas lleva entre paréntesis la cantidad exacta de cada una. Las piezas de Ula’tek pasadas a catalizador cuya pieza de origen tiene una sola estadística y una pasiva avisan de que conservan esa pasiva y esa estadística (no pasan a 2 de tier), y las de tier normal de Ula’tek llevan el icono del bibelot de voluta durmiente con la nota de que es el que dropea al matarlo.'],
    ['1.6.3', 'Piezas de tier: el tooltip de cada pieza ya no incluye el bloque gigante del conjunto (lista de piezas y bonus de 2 y 4 piezas), y cada jefe lleva su icono al lado del nombre para ver de un vistazo cuál la suelta. El selector de orden de Todas las piezas (Prioridad, Orden de jefes, Valor esperado, Mejor) vuelve a salir siempre, con cualquier fuente.'],
    ['1.6.2', 'En la cabecera de la simulación el personaje sale con su modelo 3D (el retrato que da Blizzard) en vez del icono de la especialización, y encima de cada pieza equipada aparece su nivel de objeto exacto con el color de su mejora: naranja Mítico, morado Heroico, azul Campeón, verde Veterano y gris lo inferior.'],
    ['1.6.1', 'En cada simulación cargada, junto a «de hoy» o «hace N días» ahora sale también la hora a la que se hizo (por ejemplo «de hoy, 18:36»).'],
    ['1.6.0', 'Las simulaciones tienen una cabecera igual que la de Raidbots según su tipo (Droptimizer, Quick Sim o Top Gear): título, DPS grande (mejor pieza o mejor combinación), opciones de la sim, personaje con raza, nivel y reino, botón para exportar SimC y la fila de equipo con su nivel de objeto medio.'],
    ['1.5.2', 'Todas las piezas, con la fuente Raid: nuevo selector de orden para las tarjetas de jefe (Prioridad, Orden de jefes de la raid, Valor esperado y Mejor), como en Raidbots.'],
    ['1.5.1', 'Todas las piezas pasa a verse como botín por jefe: una tarjeta por jefe o mazmorra con sus piezas, lo que suman en DPS y las de mayor mejora arriba, en vez de una tabla larga.'],
    ['1.5.0', 'Dónde tirar moneda estrena diseño: un resumen arriba (monedas, DPS que ganas, mejora total y fuentes distintas), un podio con las tres mejores monedas en tarjetas grandes y el resto del plan en una lista compacta.'],
    ['1.4.9', 'En la web, cuando hay una versión nueva de NinjaLoot sale un aviso abajo («Hay una versión nueva de NinjaLoot») con el botón «Recargar», igual que en WipeTime.'],
    ['1.4.8', 'Con la web en español ya salen los iconos de todos los jefes (Nymrissa Clamaolas, Nek’zali, Los colmillos gemelos, El Altar en Espiral…): se buscaban por su nombre traducido y solo salían los que se llaman igual en inglés.'],
    ['1.4.7', 'Los iconos de la barra superior (Inicio, Tiers, Simulación personal, Gráficas, Rotaciones, Roster, Idioma y Ajustes) y el resto de iconos de interfaz se ven menos ampliados: se recorta solo su marco, igual que en WipeTime.'],
    ['1.4.6', 'La portada siempre tiene la dirección limpia (ninjaloot.vercel.app), sin «#/», también al volver a Inicio o al abrir un enlace guardado con «#/», igual que WipeTime.'],
    ['1.4.5', 'La pestaña del navegador pone solo «NinjaLoot» en la portada, sin «· Inicio», igual que WipeTime. Las demás pantallas siguen mostrando su nombre.'],
    ['1.4.4', 'La portada ya no añade «#/» al final de la dirección al abrir NinjaLoot (queda ninjaloot.vercel.app limpio, como WipeTime). Las demás pantallas siguen teniendo su propia URL.'],
    ['1.4.3', 'Cada vez que copias algo en NinjaLoot sale un aviso en medio de la pantalla («Se ha copiado al portapapeles»), y el historial de versiones de Ajustes pasa a tarjetas con iconos de World of Warcraft, un resumen y los cambios por secciones.'],
    ['1.4.2', 'Seguridad: se elimina del servidor y de la app el envío de mensajes privados por Discord (ya no se usaba), así que el bot solo puede leer los enlaces de Raidbots del canal.'],
    ['1.4.1', 'La portada ahora es «#/» como en WipeTime (los enlaces antiguos «#/home» siguen funcionando).'],
    ['1.4.0', 'Con la web en español las bandas y los jefes de la temporada salen en español (El Abismo Venenoso, La Gruta Ligada a la Marea, El Desatamiento de Kith’ix…). Rotaciones: en vez de «Midnight Season 2» pone la semana actual, de reinicio a reinicio («Rotaciones desde el 14 de Octubre hasta el 21 de Octubre»), y se quitan «Raid nueva» y «Jefe nuevo». Modo captura sin el logo ni el enlace de GitHub. Roster: se quita la vinculación con Discord y el envío por mensaje privado; ahora cada personaje se marca a mano pulsando su estado (verde: no falta, rojo: falta) y la marca se borra sola en el reinicio. Rangos de la guild con nombres propios (Raiders, Alters, Oficiales…) y selección libre de qué rangos importar.'],
    ['1.3.1', 'Al pulsar el nombre de Discord o de Battle.net en Acerca de ya no se abre ninguna aplicación: se copia al portapapeles y sale un aviso en medio de la pantalla («Se ha copiado al portapapeles»). Pulsar un objeto (cuadrados de «Dónde tirar moneda», piezas de tier y listas) abre su página de Wowhead en el idioma de la web, y los cuadrados de objeto brillan y se levantan al pasar el ratón. El cofre semanal dice «Delves y cacerías» en vez de «bajadas y presas».'],
    ['1.3.0', 'Tus guantes u otra pieza ya no salen como cambiadas por error: NinjaLoot compara con la fecha de los datos de Raider.IO (si son anteriores a la sim no se avisa), la nota dice de cuándo son y cada cambio tiene un botón «Es correcto». Versión y Acerca de pasan a una sola pestaña, como en WipeTime. Pestaña Discord revisada (avisa al guardar, el interruptor se guarda solo y hay botón para desconectar el canal). El cofre semanal ya no muestra el cursor de interrogación y cada casilla brilla al pasar el ratón. Se quitan las notas de atajos de teclado.'],
    ['1.2.3–1.2.5', 'Ajustes renovados: pestaña Listas, lo que se muestra pasa a Apariencia, tamaño de la interfaz con deslizador, densidad Cómoda, «Restablecer todos los ajustes» con confirmación e historial con las últimas 10 versiones y «Ver más». Pulsar Discord o Battle.net en Acerca de copia el nombre y abre la aplicación instalada. En el programa los enlaces internos siempre se abren dentro de la ventana.'],
    ['1.2.2', 'Cada pantalla tiene ahora su propia dirección (#/tiers, #/charts, #/rotations…): el botón Atrás del navegador vuelve a la pantalla anterior, F5 se queda donde estabas, y los enlaces de la barra se abren en otra ventana con Mayús + clic (o en otra pestaña con Ctrl + clic).'],
    ['1.2.1', 'El reloj del servidor mantiene el estilo consola pero con los colores de NinjaLoot (el morado de la web) en vez de verde.'],
    ['1.2.0', 'Dónde tirar moneda: nuevo selector Todo / Raid / M+ para decidir de dónde sale la pieza, y cada fila lleva el icono del jefe o, en mazmorras, el de la mazmorra.'],
    ['1.1.1', 'Nuevo reloj del servidor con estilo consola: panel oscuro con las cifras en verde y brillo, sin la esfera.'],
    ['1.1.0', 'Los textos se ajustan solos para leerse bien en el tema claro y en el oscuro; los iconos de objetos nuevos que faltaban (por ejemplo Tentáculo de horror retorcido y Sortija del evocaenjambres) ya cargan; el contador del reinicio semanal muestra días, horas, minutos y segundos con su nombre completo; el botón Abrir Raidbots de la web abre ahora un enlace real.'],
    ['1.0.1', 'Tema claro: más contraste en los verdes y rojos de estado, en las insignias QS/TG y en el botón de borrar.'],
    ['1.0.0', 'Pulido visual: las barras de las gráficas y de las tablas de ganancia son cuadradas y el resto de formas siguen tres radios (controles, tarjetas e iconos); los jefes llevan su icono en el título de cada tarjeta y en la tabla de rotaciones; las cifras grandes cuentan al aparecer; mejor aspecto en ventanas estrechas y en el tema claro.'],
    ['0.9.0', 'NinjaLoot vuelve a ser totalmente independiente: se quita el botón «Ver en WipeTime» y el filtro de asistentes que llegaba desde WipeTime.'],
    ['0.8.1', 'La web carga más rápido sin perder nada del aspecto ni de las animaciones: scripts y estilos en un solo archivo minificado, los datos grandes se leen como JSON, las fuentes principales se precargan y un service worker guarda lo estático para que las visitas siguientes sean instantáneas y la web abra incluso sin conexión. En una conexión lenta con CPU limitada, la primera carga pasa de 5,4 s a 3,5 s y las peticiones de 36 a 21.'],
    ['0.8.0', 'Conexión con WipeTime: el botón «Ver en WipeTime» de cada jugador abre su ficha, y un enlace de WipeTime («Abrir en NinjaLoot con estos asistentes») carga NinjaLoot mostrando solo a los jugadores de ese log, con un botón para quitar el filtro.'],
    ['0.7.1', 'Simulaciones que conviene repetir: ya no avisa de que «ya lleva» una mejora si el personaje ya la llevaba puesta cuando se lanzó la simulación (la sim ya contaba con ella); solo cuenta las que ha conseguido después. Además la explicación del «?» ahora muestra el icono de cada objeto, su ranura, de dónde sale, la mejora que decía la sim y lo que llevaba el personaje en esa ranura al simular, y separa las ya entregadas esta semana (historial de RCLootCouncil).'],
    ['0.7.0', 'Más tipos de simulación: además de Droptimizer ahora se aceptan Quick Sim (DPS total y estadísticas) y Top Gear (ranking de combinaciones de equipo), en un panel propio. Importar loot: pega o elige el historial exportado de RCLootCouncil y las mejoras que ya se han entregado esta semana a cada jugador salen marcadas como «ya lo lleva». Los números llevan separador de miles también de 4 cifras (4.260).'],
    ['0.6.0', 'Estética: barras con degradado y brillo del color de clase también en las gráficas por objeto; tarjetas fantasma con brillo mientras Raidbots responde; fundido escalonado al cambiar de vista o de filtros; cada jugador muestra su «objeto estrella» (con tooltip) en la cabecera; y Modo captura: una imagen limpia y compacta de la gráfica general (con tus filtros) para copiar al portapapeles o guardar como PNG. Además se corrige «Guardar como PNG», que fallaba por una restricción de seguridad con las imágenes del navegador.'],
    ['0.5.0', 'Filtros por rol (Tank, Sanador, DPS) y por clase en las gráficas, que afectan a todas las vistas. Sesiones guardadas: guarda el conjunto de simulaciones de una raid con nombre y fecha y ábrelo (o añádelo a las actuales) cuando quieras. Compartir: genera un enlace que abre NinjaLoot web con tus mismas simulaciones; también puedes pegar un enlace así para cargarlas.'],
    ['0.4.6', 'Tiers: el bonus de 4 piezas del Elemental salía en portugués; ahora está traducido al castellano con los nombres oficiales de las habilidades.'],
    ['0.4.5', 'Tiers: cada especialización es ahora un desplegable cerrado; el texto de los bonus de 2 y 4 piezas solo aparece al pulsarla, para que no se vea todo el texto de golpe.'],
    ['0.4.4', 'En la barra superior, Tiers y Gráficas intercambian su sitio: ahora el orden es Inicio, Tiers, Simulación personal, Gráficas, Rotaciones y Roster.'],
    ['0.4.3', 'El círculo del reloj del servidor gira una vuelta cada 24 horas (ya no por segundos).'],
    ['0.4.2', 'El reloj del servidor vuelve a estar justo a la derecha del nombre y el icono de NinjaLoot (en la 0.4.1 se había descolocado).'],
    ['0.4.1', 'El reloj del servidor pasa al extremo izquierdo de la barra superior, antes del logo.'],
    ['0.4.0', 'Reloj del servidor arriba a la izquierda (Europa por defecto; América, Latinoamérica, Oceanía, Corea y Taiwán en Ajustes → General) con cuenta atrás al reinicio semanal al pasar el ratón. Quitado el texto bajo el nombre de la aplicación; las tarjetas del inicio ya no se pueden seleccionar; el paso 3 de «Cómo se usa» menciona «Dónde tirar moneda»; y «Dificultades e idiomas» ya no dice francés ni alemán.'],
    ['0.3.2', 'Los botones de color brillan, se elevan y se iluminan al pasar el ratón por encima. Reescrito el paso 3 de «Cómo se usa» para que «Rotaciones» y «Cuidado» se entiendan como secciones.'],
    ['0.3.1', 'Quitados el francés y el alemán: la aplicación queda en español e inglés. Si tenías uno de esos idiomas elegido, vuelve al español.'],
    ['0.3.0', 'Identificador interno de la aplicación cambiado a com.kingkhaax.ninjaloot (sin datos personales); el instalador conserva su identidad anterior, así que las actualizaciones siguen funcionando.'],
    ['0.2.9', 'Nuevo jefe de banda: Kith’ix (The Unbinding of Kith’ix). Ahora son 10 jefes de banda en lugar de 9 y las piezas simuladas que caen de él salen en las gráficas por jefe, en la simulación personal y en «Dónde tirar moneda». Tabla de objetos actualizada con las 45 piezas nuevas.'],
    ['0.2.8', 'Cofre semanal: al pasar el ratón por una casilla ves todo el contenido que has hecho esta semana (jefes con su dificultad, llaves con su mazmorra o actividades del mundo), con su nivel de objeto, y resaltado lo que cuenta para esa casilla.'],
    ['0.2.7', 'La pestaña de la versión web se llama ahora solo «NinjaLoot».'],
    ['0.2.6', 'Cofre semanal: cada casilla muestra el nivel de objeto, la calidad con su color (Aventurero, Veterano, Campeón, Héroe, Mito) y el rango (1/6, 2/6...). Nueva fila «Mundo» (bajadas y presas) que apuntas tú, porque Blizzard no publica esos datos. Arreglado: en la versión web la banda salía «No disponible». Botón «?» en «Simulaciones que conviene repetir» que explica el motivo exacto. Nuevos efectos animados en Inicio. Las fechas del reinicio semanal se actualizan solas aunque tengas la app abierta.'],
    ['0.2.5', 'Simulación personal: nuevo apartado «Cofre semanal» con el estado del cofre del personaje de la sim (jefes de banda y llaves de míticas+ de esta semana y qué te dará cada casilla). «Dónde tirar moneda» ahora incluye también piezas de míticas+ (con su mazmorra), bajadas y presas, no solo de banda.'],
    ['0.2.4', 'Roster: el aviso de quién falta ya no se manda a cada jugador, sino que el bot NinjaLoot te lo envía a ti (el RL) por mensaje privado de Discord en un solo mensaje con la lista. Elige tu usuario de Discord en el Roster y pulsa «Enviarme por DM quién falta».'],
    ['0.2.3', 'Nueva pestaña Roster: añade a tu raid a mano o importa la guild desde Raider.IO y ve quién ha subido su sim esta semana y a quién le falta; a los que falten se les puede avisar por mensaje privado de Discord con el bot NinjaLoot. El bot de Discord ahora recoge al conectar las sims publicadas desde el reinicio semanal, ignora las de semanas anteriores, se queda con la más nueva de cada jugador y vincula cada personaje con quien pegó su sim.'],
    ['0.2.2', 'En el inicio aparece «Hecho por Drakko ♥».'],
    ['0.2.1', 'Simulación personal: el tercer hueco pasa de «Delves» a «Otro contenido» y acepta cualquier sim que no sea de raid ni de míticas (delves, profesiones, PvP…).'],
    ['0.2.0', 'NinjaLoot también en la web: kingkhaax.github.io/NinjaLoot, sin instalar nada (además del instalable y el portable). Bot de Discord compartido: ya no hay que crear un bot ni tocar tokens, basta con invitar el bot NinjaLoot y pegar el enlace del canal. Exportar datos a CSV o JSON eligiendo qué exportar: todo, un jefe, un jugador o una pieza. El tooltip de las barras ya no repite el nombre del objeto. Páginas de Condiciones del Servicio y Política de Privacidad.'],
    ['0.1.16', 'Exportar datos a CSV (Excel, Google Sheets) o JSON con todas las mejoras de todas las sims. Nueva vista «Comparar sims» en Simulación personal: una fila por objeto y una columna por sim (1 objetivo 5 min, 5 objetivos 1 min, raid, míticas…), con la mejor resaltada; cada sim muestra su tipo de pelea. «Dónde tirar moneda» ahora es un plan para varias semanas que no gasta dos monedas en la misma ranura. Los enlaces pegados sin espacio se separan solos.'],
    ['0.1.15', 'Sims automáticas desde Discord (Ajustes → Discord): conecta el bot NinjaLoot de tu guild a un canal y, mientras el programa está abierto, cada enlace de Raidbots que se pegue ahí se añade solo a Gráficas. El token del bot se guarda cifrado en tu PC. Incluye los pasos para crear el bot.'],
    ['0.1.14', 'Simulación personal con huecos fijos para cada tipo de contenido: Raid, Míticas+ y Delves. Cada hueco tiene su propia caja para pegar la sim y se queda en el hueco donde la cargas; las sims de otro tipo salen como un hueco más. Las ranuras de la tabla empiezan en mayúscula.'],
    ['0.1.13', 'Nuevo diseño más sobrio y profesional: fondos gris oscuro neutro en vez de morado, tarjetas planas con borde fino, el morado solo en lo activo (botón principal, pestaña y opción elegidas), sin degradados ni brillos, barras de las gráficas planas y títulos de sección más discretos. También en el tema claro.'],
    ['0.1.12', 'Simulación personal con varias simulaciones de una misma persona: pega los enlaces de Raidbots (por ejemplo uno de raid y otro de míticas) y NinjaLoot los junta en una sola lista para comparar. Salen chips con cada sim (fuente, DPS base y antigüedad) que puedes quitar con la ✕, una comparativa con la mejor pieza de cada fuente (★ la que más DPS da), filtro por Raid / Mazmorras y una columna que indica de qué sim viene cada objeto. Si cargas a otro personaje, se empieza una lista nueva. El desplegable de personajes ahora muestra el icono de la especialización.'],
    ['0.1.11', 'Dónde tirar moneda: nueva pregunta «¿Cuántas monedas tienes?» (de 1 a 20) y la lista muestra tantas piezas de jefe como monedas tengas, de la que más DPS te da a la que menos. En Tiers, las ranuras empiezan en mayúscula (Cabeza, Hombros…).'],
    ['0.1.10', 'Gráficas con barras simples: en «Mejor mejora por jugador» sale el icono del objeto encima de cada barra, y en la gráfica de cada jugador el icono del objeto sustituye al nombre larguísimo de debajo; al pasar el ratón por cualquiera de ellos se ve el tooltip del objeto.'],
    ['0.1.9', 'Arreglado el error «No se pudo consultar GitHub»: la búsqueda de actualizaciones ya no usa la API de GitHub (limitada a 60 consultas por hora), sino el archivo de cada versión, y guarda el resultado unos minutos.'],
    ['0.1.8', 'Sims caducadas más claras y en rojo: dice exactamente cuántos días lleva cada jugador sin una sim nueva y, pieza por pieza, qué ranura ha cambiado, qué objeto llevaba y de qué nivel, y por cuál lo ha cambiado y de qué nivel.'],
    ['0.1.7', 'Sims caducadas: NinjaLoot mira en Raider.IO el equipo actual de cada personaje, tacha las mejoras de objetos que ya lleva y avisa si la sim tiene más de X días o si ha cambiado mucho el equipo. Gráficas con barras simples o detalladas, DPS exacto al pasar el ratón por cada barra y tooltip del objeto en su icono. En Por jefe se puede elegir raid (The Venomous Abyss o The Tidebound Grotto) y jefe, y siempre empieza en Todo. Buffs corregidos: Furia del cielo, Toque místico, Veneno atrófico (−4%), Intelecto arcano (+3%) y Bendición de bronce, con sus iconos oficiales. Iconos de la barra superior sin el marco oscuro. Nueva pestaña Versión con historial y actualizaciones más rápidas que solo descargan lo que cambia.'],
    ['0.1.6', 'Rotaciones a un clic: ✓ no rota, ✗ rota y ? pendiente en cada casilla, botones para toda la fila y Todo a pendiente. El cofre semanal empieza siempre en 0/6 y solo cuenta los jefes marcados con ✓. Columna opcional para el jefe de la raid nueva. Tiers pasa al lado de Simulación personal y Rotaciones queda a la derecha.'],
    ['0.1.5', 'Gráficas por jefe con una tarjeta por objeto: icono, jefe o mítica de la que sale, tipo de armadura (tela, cuero, malla, placas o cualquiera) y una barra por jugador con el color de su clase, de más a menos. Tooltip del objeto siempre en el icono.'],
    ['0.1.4', 'Vuelve a salir de qué jefe es cada objeto (Raidbots cambió el formato de sus datos), con la mítica en mazmorras y (Tier) o (Catalizador) en las piezas de tier. Dónde tirar moneda muestra el top 5. Nueva pestaña Tiers con los bonus de 2 y 4 piezas de cada especialización y las piezas de tier con sus estadísticas. Rotaciones con aviso para RLs y oficiales y cofre semanal. La URL de la simulación personal ya no se borra al cambiar de pestaña.'],
    ['0.1.2', 'Pantalla de inicio, gráficas por jefe, filtro por dificultad, simulación personal con Dónde tirar moneda, tabla de rotaciones con buffs y debuffs de banda, avisos de Cuidado, trinkets de healer y tank, cuatro idiomas y más ajustes de apariencia.'],
    ['0.1.1', 'Rotaciones, iconos por especialización y nueva interfaz.'],
    ['0.1.0', 'Primera versión: gráficas de mejoras de objetos a partir de simulaciones de Raidbots.'],
  ],
  en: [
    ['1.6.7', 'All pieces: each boss header now stands out clearly from the pieces, with a coloured band on top, a gradient background, a bigger framed icon and a bigger name and total.'],
    ['1.6.6', 'The item level above each header piece is now coloured also in older simulations or on pieces without upgrade data (crafted): coloured by item level bands (orange Mythic, purple Heroic, blue Normal, green below and grey lower).'],
    ['1.6.5', 'Tier pieces: the repeated “In brackets, what each stat gives…” text under the table is removed, and the Ula’tek trinket shows its name in the web language.'],
    ['1.6.4', 'Tier pieces: the stats column shows the exact amount of each in brackets. Ula’tek pieces catalyzed from a one-stat piece with a passive now say they keep that passive and stat (they do not switch to 2 tier stats), and Ula’tek normal tier pieces show the Slumbering Scroll Trinket icon with a note that it is the one it drops when killed.'],
    ['1.6.3', 'Tier pieces: each piece tooltip no longer includes the huge set block (piece list and 2 and 4 piece bonuses), and every boss has its icon next to the name to see at a glance which one drops it. The sort selector of All pieces (Priority, Boss Order, Expected Value, Best) is back for every source.'],
    ['1.6.2', 'In the simulation header the character shows with its 3D model (the portrait Blizzard provides) instead of the spec icon, and above each equipped piece its exact item level appears coloured by upgrade track: orange Myth, purple Hero, blue Champion, green Veteran and grey for lower.'],
    ['1.6.1', 'On each loaded simulation, next to “today” or “N days ago” the time it was run now shows too (for example “today, 18:36”).'],
    ['1.6.0', 'Simulations have a header like Raidbots one depending on their type (Droptimizer, Quick Sim or Top Gear): title, big DPS (best item or best combo), sim options, character with race, level and realm, a SimC export button and the gear row with its average item level.'],
    ['1.5.2', 'All pieces, with the Raid source: new sort selector for the boss cards (Priority, Boss Order of the raid, Expected Value and Best), like Raidbots.'],
    ['1.5.1', 'All pieces now show as loot by boss: one card per boss or dungeon with its pieces, what they add in DPS and the biggest upgrades on top, instead of one long table.'],
    ['1.5.0', 'Where to use a coin has a new design: a summary on top (coins, DPS you gain, total gain and different sources), a podium with the three best coins in big cards and the rest of the plan in a compact list.'],
    ['1.4.9', 'On the web, when there is a new NinjaLoot version a notice appears at the bottom (“There is a new version of NinjaLoot”) with a “Reload” button, like WipeTime.'],
    ['1.4.8', 'With the web in Spanish every boss icon now shows (Nymrissa Wavecaller, Nek’zali, The Twin Fangs, The Coiled Altar…): they were looked up by their translated name, so only the ones named the same in English appeared.'],
    ['1.4.7', 'The top bar icons (Home, Tiers, Personal sim, Charts, Rotations, Roster, Language and Settings) and the other interface icons are less zoomed in: only their frame is trimmed, like in WipeTime.'],
    ['1.4.6', 'The home page always has the clean address (ninjaloot.vercel.app), without “#/”, also when returning to Home or opening a saved link with “#/”, like WipeTime.'],
    ['1.4.5', 'The browser tab now says just “NinjaLoot” on the home page, without “· Home”, like WipeTime. The other screens still show their name.'],
    ['1.4.4', 'The home page no longer adds “#/” to the end of the address when NinjaLoot opens (it stays a clean ninjaloot.vercel.app, like WipeTime). The other screens still have their own URL.'],
    ['1.4.3', 'Every time you copy something in NinjaLoot a notice appears in the middle of the screen (“Copied to the clipboard”), and the version history in Settings becomes cards with World of Warcraft icons, a summary and the changes by section.'],
    ['1.4.2', 'Security: sending direct messages through Discord is removed from the server and the app (it was no longer used), so the bot can only read the Raidbots links in the channel.'],
    ['1.4.1', 'The home page is now “#/” like in WipeTime (old “#/home” links keep working).'],
    ['1.4.0', 'With the website in Spanish the season’s raids and bosses appear in Spanish (El Abismo Venenoso, La Gruta Ligada a la Marea, El Desatamiento de Kith’ix…). Rotations: instead of “Midnight Season 2” it shows the current week, reset to reset (“Rotations from October 14 to October 21”), and “New raid” and “New boss” are removed. Capture mode without the logo or the GitHub link. Roster: Discord linking and direct-message sending are removed; each character is now set by hand by clicking its status (green: not missing, red: missing) and the mark clears itself at the reset. Guild ranks with your own names (Raiders, Alts, Officers…) and a free choice of which ranks to import.'],
    ['1.3.1', 'Clicking the Discord or Battle.net name in About no longer opens any app: it is copied to the clipboard and a notice appears in the middle of the screen (“Copied to the clipboard”). Clicking an item (the “Where to use a coin” boxes, tier pieces and lists) opens its Wowhead page in the website language, and item boxes glow and lift on hover. The Spanish wording of the weekly vault is fixed (“Delves y cacerías” instead of “bajadas y presas”).'],
    ['1.3.0', 'Your gloves or any other piece no longer show up as changed by mistake: NinjaLoot compares against the date of the Raider.IO data (if it is older than the sim nothing is flagged), the note says how old it is and each change has a “That is right” button. Version and About are now a single tab, like in WipeTime. Discord tab reviewed (it confirms when saving, the toggle saves by itself and there is a button to disconnect the channel). The weekly vault no longer shows the question-mark cursor and each slot glows on hover. Keyboard-shortcut notes are removed.'],
    ['1.2.3–1.2.5', 'Settings revamp: Lists tab, display options moved to Appearance, interface size as a slider, Comfortable density, “Reset all settings” with confirmation and a history showing the latest 10 versions with “Show more”. Clicking Discord or Battle.net in About copies the name and opens the installed app. In the desktop app internal links always open inside the window.'],
    ['1.2.2', 'Every screen now has its own address (#/tiers, #/charts, #/rotations…): the browser Back button returns to the previous screen, F5 keeps you where you were, and the bar links open in a new window with Shift + click (or a new tab with Ctrl + click).'],
    ['1.2.1', 'The server clock keeps the console style but uses NinjaLoot’s colors (the website’s purple) instead of green.'],
    ['1.2.0', 'Where to use a coin: new All / Raid / M+ selector to choose where the piece comes from, and each row shows the boss icon or, for dungeons, the dungeon icon.'],
    ['1.1.1', 'New console-style server clock: a dark panel with glowing green digits and no dial.'],
    ['1.1.0', 'Text now adjusts itself to stay readable in both the light and dark themes; missing icons of new items (such as the Twisted Horror Tendril and the Swarmcaller Band) now load; the weekly reset counter shows days, hours, minutes and seconds with their full names; the web Open Raidbots button now opens a real link.'],
    ['1.0.1', 'Light theme: better contrast on the status greens and reds, the QS/TG badges and the delete button.'],
    ['1.0.0', 'Visual polish: chart and gain-table bars are square and every other shape follows three radii (controls, cards and icons); bosses show their icon in each card title and in the rotations table; big numbers count up as they appear; better look in narrow windows and in the light theme.'],
    ['0.9.0', 'NinjaLoot is fully independent again: the «View in WipeTime» button and the attendees filter coming from WipeTime are gone.'],
    ['0.8.1', 'The web loads faster without losing anything of the look or the animations: scripts and styles in one minified file, big data read as JSON, main fonts preloaded and a service worker that stores the static files so later visits are instant and the web even opens offline. On a slow connection with a throttled CPU, the first load goes from 5.4 s to 3.5 s and requests from 36 to 21.'],
    ['0.8.0', 'WipeTime link: the «View in WipeTime» button on each player opens their page, and a WipeTime link («Open in NinjaLoot with these attendees») loads NinjaLoot showing only the players of that log, with a button to remove the filter.'],
    ['0.7.1', 'Sims worth repeating: it no longer says the character «already wears» an upgrade if they were already wearing it when the sim was run (the sim already counted it); it only counts the ones obtained afterwards. The «?» explanation now shows each item’s icon, its slot, where it drops, the gain the sim promised and what the character wore in that slot at sim time, and separates those already awarded this week (RCLootCouncil history).'],
    ['0.7.0', 'More simulation types: besides Droptimizer, Quick Sim (total DPS and stats) and Top Gear (ranking of gear combinations) are now accepted, in their own panel. Import loot: paste or pick the exported RCLootCouncil history and the upgrades already awarded to each player this week are marked as «already owned». Numbers use a thousands separator also with 4 digits (4,260).'],
    ['0.6.0', 'Aesthetics: bars with a gradient and glow in the class color also in the per-item charts; ghost cards with a shimmer while Raidbots answers; staggered fade when changing view or filters; every player shows their «star item» (with tooltip) in the header; and Capture mode: a clean, compact image of the overview chart (with your filters) to copy to the clipboard or save as PNG. Also fixes «Save as PNG», which failed because of a security restriction on browser images.'],
    ['0.5.0', 'Filters by role (Tank, Healer, DPS) and by class in the charts, applied to every view. Saved sessions: save the set of simulations of a raid with a name and date and open it (or add it to the current ones) whenever you want. Share: generates a link that opens NinjaLoot web with the same simulations; you can also paste such a link to load them.'],
    ['0.4.6', 'Tiers: the Elemental 4-piece bonus appeared in Portuguese; it is now translated to Spanish with the official ability names.'],
    ['0.4.5', 'Tiers: each specialization is now a collapsed section; the 2-piece and 4-piece bonus text only appears when you click it, so you no longer see all the text at once.'],
    ['0.4.4', 'In the top bar, Tiers and Charts swap places: the order is now Home, Tiers, Personal simulation, Charts, Rotations and Roster.'],
    ['0.4.3', 'The server clock circle now makes one turn every 24 hours (no longer per second).'],
    ['0.4.2', 'The server clock is back right next to the NinjaLoot icon and name (it had been displaced in 0.4.1).'],
    ['0.4.1', 'The server clock moves to the far left of the top bar, before the logo.'],
    ['0.4.0', 'Server clock at the top left (Europe by default; Americas, Latin America, Oceania, Korea and Taiwan in Settings → General) with a countdown to the weekly reset on hover. Removed the text under the app name; the home cards can no longer be selected; step 3 of «How to use» mentions “Where to use a coin”; and “Difficulties and languages” no longer lists French and German.'],
    ['0.3.2', 'Coloured buttons now shine, lift and glow when you hover them. Step 3 of «How to use» was reworded so “Rotations” and “Careful” read as sections.'],
    ['0.3.1', 'French and German removed: the app is now Spanish and English only. If you had one of those languages selected, it goes back to Spanish.'],
    ['0.3.0', 'Internal application identifier changed to com.kingkhaax.ninjaloot (no personal data); the installer keeps its previous identity, so updates keep working.'],
    ['0.2.9', 'New raid boss: Kith’ix (The Unbinding of Kith’ix). There are now 10 raid bosses instead of 9, and the simulated pieces that drop from it show up in the per-boss charts, the personal simulation and «Where to spend coins». Item table updated with the 45 new pieces.'],
    ['0.2.8', 'Great Vault: hovering a slot shows all the content you did this week (bosses with difficulty, keys with dungeon or world activities), with item level, highlighting what counts for that slot.'],
    ['0.2.7', 'The web version tab is now called just «NinjaLoot».'],
    ['0.2.6', 'Great Vault: every slot shows the item level, the quality in its color (Adventurer, Veteran, Champion, Hero, Myth) and the rank (1/6, 2/6...). New «World» row (delves and prey) that you fill in yourself, since Blizzard does not publish that data. Fixed: in the web version the raid row showed «Not available». «?» button in «Sims worth redoing» that explains the exact reason. New animated effects on Home. Weekly reset dates update by themselves even with the app open.'],
    ['0.2.5', 'Personal sim: new «Great Vault» section with the vault status of the sim’s character (this week’s raid bosses and Mythic+ keys, and what each slot will give you). «Where to use a coin» now also includes Mythic+ items (with their dungeon), delves and prey, not just raid.'],
    ['0.2.4', 'Roster: the reminder of who is missing is no longer sent to each player; the NinjaLoot bot sends it to you (the RL) as a single Discord direct message with the list. Pick your Discord user in the Roster and click «DM me who is missing».'],
    ['0.2.3', 'New Roster tab: add your raid manually or import the guild from Raider.IO and see who has uploaded their sim this week and who is missing; the missing ones can be reminded by Discord direct message through the NinjaLoot bot. When connecting, the Discord bot now picks up the sims posted since the weekly reset, ignores older weeks, keeps only each player’s newest sim and links each character to whoever posted it.'],
    ['0.2.2', 'The home screen now shows «Made by Drakko ♥».'],
    ['0.2.1', 'Personal simulation: the third slot changes from «Delves» to «Other content» and accepts any sim that is not raid or Mythic+ (delves, professions, PvP…).'],
    ['0.2.0', 'NinjaLoot is now also on the web: kingkhaax.github.io/NinjaLoot, no install needed (besides the installer and the portable version). Shared Discord bot: no need to create a bot or handle tokens, just invite the NinjaLoot bot and paste the channel link. Export data to CSV or JSON choosing what to export: everything, one boss, one player or one item. Bar tooltips no longer repeat the item name. Terms of Service and Privacy Policy pages.'],
    ['0.1.16', 'Export data to CSV (Excel, Google Sheets) or JSON with every upgrade from all sims. New «Compare sims» view in Personal simulation: one row per item and one column per sim (1 target 5 min, 5 targets 1 min, raid, Mythic+…), with the best one highlighted; each sim shows its fight type. «Where to use a coin» is now a plan over several weeks that never spends two coins on the same slot. Links pasted without a space are split automatically.'],
    ['0.1.15', 'Automatic sims from Discord (Settings → Discord): connect your guild’s NinjaLoot bot to a channel and, while the program is open, every Raidbots link posted there is added to Charts by itself. The bot token is stored encrypted on your PC. Includes the steps to create the bot.'],
    ['0.1.14', 'Personal simulation with fixed slots for each content type: Raid, Mythic+ and Delves. Each slot has its own box to paste the sim, and the sim stays in the slot you loaded it into; sims of other types show up as an extra slot. Slot names in the table start with a capital letter.'],
    ['0.1.13', 'New, more sober and professional design: neutral dark grey backgrounds instead of purple, flat cards with thin borders, purple only for what is active (main button, selected tab and option), no gradients or glows, flat chart bars and quieter section titles. Also in the light theme.'],
    ['0.1.12', 'Personal sim with several simulations of the same person: paste the Raidbots links (for example one for raid and one for Mythic+) and NinjaLoot merges them into a single list to compare. Chips show each sim (source, base DPS and age) and can be removed with the ✕, a comparison shows the best piece of each source (★ the biggest DPS gain), you can filter by Raid / Dungeons, and a column tells which sim each item comes from. Loading another character starts a new list. The character dropdown now shows the spec icon.'],
    ['0.1.11', 'Where to use a coin: new «How many coins do you have?» question (1 to 20) and the list shows as many boss pieces as coins you have, from the most DPS to the least. In Tiers, slot names start with a capital letter (Head, Shoulders…).'],
    ['0.1.10', 'Simple bar charts: «Best upgrade per player» shows the item icon above each bar, and each player chart shows the item icon instead of the very long name below; hover any of them to see the item tooltip.'],
    ['0.1.9', 'Fixed the "Could not reach GitHub" error: checking for updates no longer uses the GitHub API (limited to 60 requests per hour) but each release’s own file, and caches the result for a few minutes.'],
    ['0.1.8', 'Clearer stale sims, in red: it says exactly how many days each player has gone without a new sim and, piece by piece, which slot changed, which item they had and its item level, and what they swapped it for and its item level.'],
    ['0.1.7', 'Stale sims: NinjaLoot checks each character’s current gear on Raider.IO, crosses out upgrades they already wear and warns when a sim is older than X days or the gear changed a lot. Simple or detailed bars, exact DPS when hovering each bar and the item tooltip on its icon. By boss lets you pick the raid (The Venomous Abyss or The Tidebound Grotto) and the boss, and always starts on All. Fixed buffs: Skyfury, Mystic Touch, Atrophic Poison (−4%), Arcane Intellect (+3%) and Blessing of the Bronze, with their official icons. Top bar icons without the dark frame. New Version tab with history and faster updates that only download what changed.'],
    ['0.1.6', 'One-click rotations: ✓ doesn’t rotate, ✗ rotates and ? pending in every cell, whole-row buttons and Reset all to pending. The Great Vault always starts at 0/6 and only counts bosses marked ✓. Optional column for the new raid boss. Tiers moves next to Personal sim and Rotations sits on the right.'],
    ['0.1.5', 'By-boss charts with one card per item: icon, boss or dungeon it drops from, armor type (cloth, leather, mail, plate or any) and one bar per player in their class color, from most to least. Item tooltip always on the icon.'],
    ['0.1.4', 'The boss of every item shows again (Raidbots changed its data format), with the dungeon name for Mythic+ and (Tier) or (Catalyst) on tier pieces. Where to use a coin shows the top 5. New Tiers tab with every spec’s 2 and 4-piece bonuses and the tier pieces with their stats. Rotations with a warning for raid leaders and officers and the Great Vault. The personal sim URL is kept when switching tabs.'],
    ['0.1.2', 'Home screen, by-boss charts, difficulty filter, personal sim with Where to use a coin, rotations table with raid buffs and debuffs, Watch out warnings, healer and tank trinkets, four languages and more appearance settings.'],
    ['0.1.1', 'Rotations, spec icons and a new interface.'],
    ['0.1.0', 'First version: item upgrade charts from Raidbots sims.'],
  ],
};

// Historial con aspecto de «notas del parche»: cada versión es una tarjeta con icono, un resumen y secciones con iconos de World of Warcraft.
// Las versiones que no están en RICH_LOG se muestran igual, troceando su texto en frases (con un icono según de qué hablan).
const RICH_LOG = {
  '1.4.3': {
    es: { intro: 'Cada vez que copias algo en NinjaLoot sale un aviso en medio de la pantalla, y el historial de versiones estrena este diseño.', sections: [
      ['inv_scroll_03', 'Avisos al copiar', ['Al copiar un enlace para compartir, la imagen del modo captura o los nombres de Discord y Battle.net sale «Se ha copiado al portapapeles» en el centro de la pantalla.', 'Si no se puede copiar, el aviso sale en rojo y dice qué hacer.']],
      ['inv_misc_note_06', 'Historial de versiones', ['Cada versión es una tarjeta con iconos de World of Warcraft, un resumen y sus cambios por secciones.', 'Las versiones antiguas se reparten solas en frases, cada una con su icono.']],
    ] },
    en: { intro: 'Every time you copy something in NinjaLoot a notice appears in the middle of the screen, and the version history gets this new look.', sections: [
      ['inv_scroll_03', 'Copy notices', ['Copying a share link, the capture-mode image or the Discord and Battle.net names shows “Copied to the clipboard” in the center of the screen.', 'If it cannot be copied the notice turns red and says what to do.']],
      ['inv_misc_note_06', 'Version history', ['Each version is a card with World of Warcraft icons, a summary and its changes by section.', 'Older versions are split into sentences automatically, each with its own icon.']],
    ] },
  },
  '1.4.2': {
    es: { intro: 'Seguridad: el bot de Discord ya solo puede leer.', sections: [
      ['inv_shield_04', 'Seguridad', ['Se elimina del servidor y de la app el envío de mensajes privados por Discord (ya no se usaba).', 'El bot solo puede leer los enlaces de Raidbots del canal.']],
    ] },
    en: { intro: 'Security: the Discord bot can only read now.', sections: [
      ['inv_shield_04', 'Security', ['Sending direct messages through Discord is removed from the server and the app (it was no longer used).', 'The bot can only read the Raidbots links in the channel.']],
    ] },
  },
  '1.4.1': {
    es: { intro: 'La portada ahora es «#/», igual que en WipeTime.', sections: [
      ['inv_misc_net_01', 'Direcciones', ['Los enlaces antiguos «#/home» siguen funcionando.']],
    ] },
    en: { intro: 'The home page is now “#/”, like in WipeTime.', sections: [
      ['inv_misc_net_01', 'Addresses', ['Old “#/home” links keep working.']],
    ] },
  },
  '1.4.0': {
    es: { intro: 'Bandas en español, rotaciones por semana, roster a mano y rangos con nombre.', sections: [
      ['inv_misc_book_11', 'En español', ['Con la web en español las bandas y los jefes de la temporada salen en español (El Abismo Venenoso, La Gruta Ligada a la Marea, El Desatamiento de Kith’ix…).']],
      ['ability_warrior_innerrage', 'Rotaciones', ['En vez de «Midnight Season 2» pone la semana actual, de reinicio a reinicio («Rotaciones desde el 14 de Octubre hasta el 21 de Octubre»).', 'Se quitan «Raid nueva» y «Jefe nuevo».']],
      ['inv_scroll_03', 'Modo captura', ['La imagen sale sin el logo ni el enlace de GitHub.']],
      ['inv_shirt_guildtabard_01', 'Roster y rangos', ['Se quita la vinculación con Discord y el envío por mensaje privado: cada personaje se marca a mano pulsando su estado (verde: no falta, rojo: falta) y la marca se borra sola en el reinicio.', 'Rangos de la guild con tus propios nombres (Raiders, Alters, Oficiales…) y elección libre de qué rangos importar.']],
    ] },
    en: { intro: 'Raids in Spanish, weekly rotations, hand-set roster and named ranks.', sections: [
      ['inv_misc_book_11', 'In Spanish', ['With the website in Spanish the season’s raids and bosses appear in Spanish (El Abismo Venenoso, La Gruta Ligada a la Marea, El Desatamiento de Kith’ix…).']],
      ['ability_warrior_innerrage', 'Rotations', ['Instead of “Midnight Season 2” it shows the current week, reset to reset (“Rotations from October 14 to October 21”).', '“New raid” and “New boss” are removed.']],
      ['inv_scroll_03', 'Capture mode', ['The image comes out without the logo or the GitHub link.']],
      ['inv_shirt_guildtabard_01', 'Roster and ranks', ['Discord linking and direct-message sending are removed: each character is set by hand by clicking its status (green: not missing, red: missing) and the mark clears itself at the reset.', 'Guild ranks with your own names (Raiders, Alts, Officers…) and a free choice of which ranks to import.']],
    ] },
  },
  '1.3.1': {
    es: { intro: 'Copiar con aviso, objetos que llevan a Wowhead y efectos al pasar el ratón.', sections: [
      ['inv_scroll_03', 'Copiar', ['Pulsar el nombre de Discord o de Battle.net lo copia al portapapeles con un aviso en medio de la pantalla; ya no se abre ninguna aplicación.']],
      ['inv_chest_plate04', 'Objetos', ['Pulsar un objeto (cuadrados de «Dónde tirar moneda», piezas de tier y listas) abre su página de Wowhead en el idioma de la web.', 'Los cuadrados de objeto brillan y se levantan al pasar el ratón.']],
      ['inv_misc_book_11', 'Cofre semanal', ['Dice «Delves y cacerías» en vez de «bajadas y presas».']],
    ] },
    en: { intro: 'Copy with a notice, items that lead to Wowhead and hover effects.', sections: [
      ['inv_scroll_03', 'Copy', ['Clicking the Discord or Battle.net name copies it to the clipboard with a notice in the middle of the screen; no app is opened anymore.']],
      ['inv_chest_plate04', 'Items', ['Clicking an item (the “Where to use a coin” boxes, tier pieces and lists) opens its Wowhead page in the website language.', 'Item boxes glow and lift on hover.']],
      ['inv_misc_book_11', 'Weekly vault', ['The Spanish wording is fixed (“Delves y cacerías” instead of “bajadas y presas”).']],
    ] },
  },
  '1.3.0': {
    es: { intro: 'Cambios de equipo más fiables, Versión y Acerca de unidos y la pestaña Discord revisada.', sections: [
      ['inv_chest_plate04', 'Cambios de equipo', ['Ya no salen cambiados por error: NinjaLoot compara con la fecha de los datos de Raider.IO (si son anteriores a la sim no se avisa), la nota dice de cuándo son y cada cambio tiene un botón «Es correcto».']],
      ['inv_misc_note_06', 'Versión y Acerca de', ['Una sola pestaña, como en WipeTime.']],
      ['inv_misc_horn_02', 'Discord', ['Avisa al guardar, el interruptor se guarda solo y hay botón para desconectar el canal.']],
      ['inv_misc_gem_diamond_07', 'Cofre semanal', ['Sin el cursor de interrogación y cada casilla brilla al pasar el ratón.']],
    ] },
    en: { intro: 'More reliable gear changes, Version and About merged and the Discord tab reviewed.', sections: [
      ['inv_chest_plate04', 'Gear changes', ['They no longer show up by mistake: NinjaLoot compares against the date of the Raider.IO data (if it is older than the sim nothing is flagged), the note says how old it is and each change has a “That is right” button.']],
      ['inv_misc_note_06', 'Version and About', ['A single tab, like in WipeTime.']],
      ['inv_misc_horn_02', 'Discord', ['It confirms when saving, the toggle saves by itself and there is a button to disconnect the channel.']],
      ['inv_misc_gem_diamond_07', 'Weekly vault', ['No question-mark cursor and each slot glows on hover.']],
    ] },
  },
};
const LOG_ICONS = [
  [/ajustes|settings|tema|theme|color|fuente|font|densidad/i, 'inv_gizmo_02'], [/guild|banda|roster/i, 'inv_shirt_guildtabard_01'],
  [/rotaci|rotation|buff|debuff/i, 'ability_warrior_innerrage'], [/tier|moneda|coin|objeto|item|equipo|gear|pieza|piece|gema/i, 'inv_chest_plate04'],
  [/discord|battle\.net|contacto/i, 'inv_misc_horn_02'], [/reloj|clock|servidor|server|hora/i, 'inv_misc_gear_01'], [/arreglo|fix|error|corrig/i, 'inv_hammer_20'],
  [/seguridad|security|prueba|test/i, 'inv_shield_04'], [/web|navegador|browser|direcci|address|enlace|link/i, 'inv_misc_net_01'], [/copi|captura|capture/i, 'inv_scroll_03'],
  [/gr[aá]fic|chart|barra|bar|simulaci|sim/i, 'achievement_bg_winwsg'], [/cofre|vault|jefe|boss/i, 'inv_misc_book_11'],
];
const logIcon = t => (LOG_ICONS.find(([re]) => re.test(t)) || [0, 'inv_scroll_02'])[1];
const logEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Frases de un texto plano (sin partir «1.2.3»)
const logSentences = t => String(t).split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ«¿¡“‘(])/).map(x => x.trim()).filter(Boolean);
const logIconUrl = n => `https://wow.zamimg.com/images/wow/icons/medium/${n}.jpg`;
function changelogCards(list, lang, latestLabel) {
  const l = lang === 'es' ? 'es' : 'en';
  return `<div class="cl-list">${list.map(([v, text], i) => {
    const rich = RICH_LOG[v] && RICH_LOG[v][l];
    let intro, sections;
    if (rich) { intro = rich.intro; sections = rich.sections; } else {
      const ss = logSentences(text);
      intro = ss[0] || text;
      sections = ss.length > 1 ? [[null, null, ss.slice(1)]] : [];
    }
    const main = rich && rich.sections[0] ? rich.sections[0][0] : logIcon(text);
    return `<article class="cl-card${i === 0 ? ' latest' : ''}"><header class="cl-head"><img class="cl-ic" src="${logIconUrl(main)}" width="40" height="40" alt="" loading="lazy">`
      + `<div class="cl-ht"><b class="cl-ver">v${logEsc(v)}</b>${i === 0 ? `<span class="cl-tag">${logEsc(latestLabel)}</span>` : ''}</div></header>`
      + `<p class="cl-intro">${logEsc(intro)}</p>`
      + sections.map(([ic, title, items]) => `<section class="cl-sec">${ic ? `<img class="cl-sic" src="${logIconUrl(ic)}" width="26" height="26" alt="" loading="lazy">` : ''}<div class="cl-sb">${title ? `<h4>${logEsc(title)}</h4>` : ''}<ul>${items.map(i2 => `<li>${logEsc(i2)}</li>`).join('')}</ul></div></section>`).join('')
      + '</article>';
  }).join('')}</div>`;
}
