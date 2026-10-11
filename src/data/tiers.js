'use strict';
// Generado por tools/build-tiers.mjs (datos de Raidbots y Wowhead)
const TIERS = {
 "season": "Midnight Season 2",
 "anyBoss": 2895,
 "classes": {
  "deathknight": {
   "set": 2055,
   "name": {
    "en": "Baleful Grave-Knight's Crucible",
    "fr": "Creuset de chevalier de la tombe sinistre",
    "de": "Tiegel des unheilvollen Grabritters",
    "es": "Crisol de caballero sepulcral torvo"
   },
   "items": [
    {
     "slot": "head",
     "id": 271474,
     "icon": "inv_helm_plate_raiddeathknightulatek_d_01",
     "stats": [
      32,
      49
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271472,
     "icon": "inv_shoulder_plate_raiddeathknightulatek_d_01",
     "stats": [
      40,
      36
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271477,
     "icon": "inv_chest_plate_raiddeathknightulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271475,
     "icon": "inv_glove_plate_raiddeathknightulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271473,
     "icon": "inv_pant_plate_raiddeathknightulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "blood": {
     "en": [
      "When you Death Strike, gain a stack of Blood Debt, increasing Strength by 0.5%, up to 5.0%. When Blood Debt reaches 10 stacks, your next Marrowrend consumes it granting 10% Strength for 10 sec.",
      "When consuming Blood Debt, your next Marrowrend generates 3 additional Boneshield and deals (900% of Attack Power) Shadow damage to your target and (600% of Attack Power) to nearby enemies."
     ],
     "fr": [
      "Quand vous lancez Frappe de mort, vous gagnez un cumul de Dette de sang, ce qui augmente la Force de 0.5 %, jusqu’à 5.0 %. Quand Dette de sang atteint 10 cumuls, votre prochaine Déchirure de moelle les consomme, conférant 10 % de Force pendant 10 s.",
      "La consommation de Dette de sang permet à votre prochaine Déchirure de moelle de générer 3 boucliers d’os supplémentaires et d’infliger (900% de la puissance d’attaque) points de dégâts d’ombre à votre cible et (600% de la puissance d’attaque) points de dégâts d’ombre aux adversaires proches."
     ],
     "de": [
      "Beim Einsatz von 'Todesstoß' erhaltet Ihr einen Stapel 'Blutschuld', der Eure Stärke um 0.5%, bis zu 5.0%, erhöht. Wenn 'Blutschuld' 10 Stapel gesammelt hat, wird es von Eurem nächsten Einsatz von 'Markzerfetzer' verbraucht und gewährt Euch 10 Sek. lang 10% Stärke.",
      "Wenn Ihr 'Blutschuld' verbraucht, erzeugt Euer nächster Einsatz von 'Markzerfetzer' 3 zusätzliche Instanzen 'Knochenschild' und fügt Eurem Ziel (900% der Angriffskraft) sowie Gegnern in der Nähe (600% der Angriffskraft) Schattenschaden zu."
     ],
     "es": [
      "Cuando asestas Golpe letal, consigues una acumulación de Deuda de sangre que aumenta un 0.5% tu fuerza, con un máximo del 5.0%. Cuando Deuda de sangre alcanza 10 acumulaciones, tu siguiente Rasgamédulas la consume y otorga un 10% de fuerza durante 10 s.",
      "Al consumir Deuda de sangre, tu siguiente Rasgamédulas genera 3 unidades de Escudo óseo más e inflige (900% del poder de ataque) p. de daño de las Sombras a tu objetivo y (600% del poder de ataque) p. de daño a los enemigos cercanos."
     ]
    },
    "frost": {
     "en": [
      "Each time Remorseless Winter damages at least 1 enemy, gain Freezing Tempest which grants 1% attack speed and 2% increased Icy Death Torrent damage for 5 sec, stacking.",
      "Remorseless Winter deals damage 25% more frequently, and Freezing Tempest lasts 5 sec longer."
     ],
     "fr": [
      "Chaque fois qu’Hiver impitoyable inflige des dégâts à au moins 1 adversaire, vous gagnez Tempête givrante qui confère un bonus de 1 % de vitesse d’attaque et augmente de 2 % les dégâts de Torrent létal de givre pendant 5 s. Cumulable.",
      "Hiver impitoyable inflige des dégâts 25 % plus souvent, et Tempête givrante dure 5 s supplémentaires."
     ],
     "de": [
      "Jedes Mal, wenn 'Unbarmherziger Winter' mindestens einen Gegner trifft, erhaltet Ihr 'Eisiger Sturm', was Euer Angriffstempo um 1% und Euren durch 'Eisiger Todesstrom' verursachten Schaden um 2% erhöht. Hält 5 Sek. lang an und ist stapelbar.",
      "'Unbarmherziger Winter' verursacht 25% häufiger Schaden und 'Eisiger Sturm' hält 5 Sek. länger an."
     ],
     "es": [
      "Cada vez que Invierno sin remordimientos inflige daño a al menos 1 enemigo, obtienes Tempestad congelante, que te otorga un 1% de velocidad de ataque y aumenta un 2% el daño de Torrente de muerte gélida durante 5 s (acumulable).",
      "Invierno sin remordimientos inflige daño con un 25% más de frecuencia, y Tempestad congelante dura 5 s más."
     ]
    },
    "unholy": {
     "en": [
      "Your Magus of the Dead and Lord of the Dead cast a more powerful Necrotic Bolt instead of Frostbolt, and Withering Grasp instead of Shadow Bolt.",
      "Necrotic Bolt's damage is increased by 130%, and Withering Grasp's damage is increased by 130%, against enemies below 35% health."
     ],
     "fr": [
      "Vos Magus de la mort et Seigneur de la mort lancent un Trait nécrotique plus puissant à la place d’un Éclair de givre, et Emprise tortillarde à la place de Trait de l’ombre.",
      "Les dégâts de Trait nécrotique sont augmentés de 130 %, et les dégâts d’Emprise tortillarde sont augmentés de 130 %, contre les adversaires ayant moins de 35 % de leurs points de vie."
     ],
     "de": [
      "Euer Magus der Toten und Herr der Toten wirken mächtigere nekrotische Blitze, anstatt von Frostblitzen, und 'Verdorrender Griff' anstatt 'Schattenblitz'.",
      "Schaden von 'Nekrotischer Blitz' um 130% und Schaden von 'Verdorrender Griff' gegen Gegner mit weniger als 35% Gesundheit um 130% erhöht."
     ],
     "es": [
      "Tus magus de los muertos y señores de los muertos lanzan una versión más poderosa de Descarga necrótica en lugar de Descarga de Escarcha, y de Agarre marchitante en lugar de Descarga de las Sombras.",
      "El daño de Descarga necrótica aumenta un 130% y el daño de Agarre marchitante aumenta un 130% contra enemigos con menos de un 35% de salud."
     ]
    }
   }
  },
  "demonhunter": {
   "set": 2056,
   "name": {
    "en": "Abyssal Doomhound's Pursuit",
    "fr": "Poursuite de traque funeste abyssale",
    "de": "Jagd des abyssischen Verdammnishundes",
    "es": "Persecución de can maldito abisal"
   },
   "items": [
    {
     "slot": "head",
     "id": 271537,
     "icon": "inv_helm_leather_raiddemonhunterulatek_d_01",
     "stats": [
      32,
      49
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271535,
     "icon": "inv_shoulder_leather_raiddemonhunterulatek_d_01",
     "stats": [
      40,
      32
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271540,
     "icon": "inv_chest_leather_raiddemonhunterulatek_d_01",
     "stats": [
      36,
      40
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271538,
     "icon": "inv_glove_leather_raiddemonhunterulatek_d_01",
     "stats": [
      32,
      49
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271536,
     "icon": "inv_pant_leather_raiddemonhunterulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "havoc": {
     "en": [
      "Blade Dance, Chaos Strike, and Essence Break have 12% increased damage.",
      "Essence Break now applies and benefits from the effects of Cycle of Hatred, has 35% increased initial strike damage, and has 2.0 sec increased duration."
     ],
     "fr": [
      "Danse des lames, Frappe du chaos et Dégradation d’essence infligent 12 % de dégâts supplémentaires.",
      "Dégradation d’essence applique et bénéficie désormais des effets de Cycle de Haine, inflige 35 % de dégâts de frappe initiale supplémentaires et dure 2.0 s supplémentaire."
     ],
     "de": [
      "'Klingentanz', 'Chaosstoß' und 'Essenzbruch' verursachen 12% mehr Schaden.",
      "'Essenzbruch' belegt nun mit und profitiert von den Effekten von 'Teufelskreis', verursacht um 35% erhöhten Initialschaden und hält 2.0 Sek. länger an."
     ],
     "es": [
      "Danza de hojas, Golpe de caos y Rotura de esencia infligen un 12% más de daño.",
      "Ahora, Rotura de esencia aplica y se beneficia de los efectos de Ciclo de odio, inflige un 35% más de daño con el golpe inicial y dura 2.0 s más."
     ]
    },
    "vengeance": {
     "en": [
      "Sigil of Flame's damage over time is increased by 50%. Soul Cleave increases the duration of Sigil of Flame on your primary target by 2.0 sec.",
      "Immolation Aura and Sigil of Spite have 100% increased damage against targets affected by your Sigil of Flame."
     ],
     "fr": [
      "Sigil de feu inflige 50 % de dégâts sur la durée supplémentaires. Division de l’âme augmente la durée de Sigil de feu sur votre cible principale de 2.0 s.",
      "Aura d’immolation et Cachet de dépit infligent 100 % de dégâts supplémentaires contre les cibles affectées par votre Sigil de feu."
     ],
     "de": [
      "Der regelmäßige Schaden von 'Zeichen der Flamme' ist um 50% erhöht. 'Seelenspalter' erhöht die Dauer von 'Zeichen der Flamme' bei Eurem Primärziel um 2.0 Sek.",
      "'Feuerbrandaura' und 'Zeichen der Bosheit' verursachen um 100% erhöhten Schaden bei Zielen, die von Eurem 'Zeichen der Flamme' betroffen sind."
     ],
     "es": [
      "El daño en el tiempo de Sigilo de llamas aumenta un 50%. Rajar alma aumenta 2.0 s la duración de Sigilo de llamas en tu objetivo principal.",
      "Aura de inmolación y Sigilo de maldad infligen un 100% más de daño contra los objetivos afectados por tu Sigilo de llamas."
     ]
    },
    "devourer": {
     "en": [
      "Harvesting 4 or more Soul Fragments with Reap has a 20% chance to cause your next Consume to be instant cast and explode in a Soulburst, dealing (600% of Spell Power) Cosmic damage to nearby enemies.",
      "Soulburst generates 2 Soul Fragments and grants Moment of Craving. Reap deals 10% increased damage."
     ],
     "fr": [
      "En récupérant au moins 4 fragments d’âme avec Fauchage, votre prochaine Ingestion a 20 % de chances d’être instantanée et d’engendrer une Explosion d’âme, infligeant (600% de la puissance des sorts) points de dégâts cosmiques aux adversaires proches.",
      "Explosion d’âme génère 2 fragments d’âme et confère Période de fringale. Fauchage inflige 10 % de dégâts supplémentaires."
     ],
     "de": [
      "Wenn mit 'Ernten' 4 oder mehr Seelenfragmente entzogen werden, besteht eine Chance von 20%, dass Euer nächster Einsatz von 'Verschlingen' zu einem Spontanzauber wird und eine 'Seelenexplosion' auslöst, die Gegnern in der Nähe (600% der Zaubermacht) kosmischen Schaden zufügt.",
      "'Seelenexplosion' erzeugt 2 Seelenfragmente und gewährt einen 'Moment des Verlangens'. 'Ernten' verursacht 10% mehr Schaden."
     ],
     "es": [
      "Al cosechar 4 o más trozos de alma con Segar, hay un 20% de probabilidades de que tu siguiente Consumir sea instantáneo y estalle en forma de Ráfaga de almas para infligir (600% del poder con hechizos) p. de daño Cósmico a los enemigos cercanos.",
      "Ráfaga de almas genera 2 trozos de alma y otorga Momento de ansia. Segar inflige un 10% más de daño."
     ]
    }
   }
  },
  "druid": {
   "set": 2057,
   "name": {
    "en": "Bark of the Enigmatic Dreamwatcher",
    "fr": "Écorce de garde-rêve énigmatique",
    "de": "Borke des geheimnisvollen Traumbehüters",
    "es": "Ladrido de vigía de los sueños enigmático"
   },
   "items": [
    {
     "slot": "head",
     "id": 271528,
     "icon": "inv_helm_leather_raiddruidulatek_d_01",
     "stats": [
      36,
      40
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271526,
     "icon": "inv_shoulder_leather_raiddruidulatek_d_01",
     "stats": [
      32,
      49
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271531,
     "icon": "inv_robe_leather_raiddruidulatek_d_01",
     "stats": [
      32,
      36
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271529,
     "icon": "inv_glove_leather_raiddruidulatek_d_01",
     "stats": [
      40,
      49
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271527,
     "icon": "inv_pant_leather_raiddruidulatek_d_01",
     "stats": [
      36,
      32
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "balance": {
     "en": [
      "Starsurge damage increased by 20%. Starfall also deals (30.4% of Spell Power) Astral damage instantly to all valid enemies in range when cast.",
      "Your damage is increased by 10% while in any Eclipse. This bonus wanes to 2% at the midpoint of the Eclipse, then waxes back to 10% at the end."
     ],
     "fr": [
      "Éruption stellaire inflige 20 % de dégâts supplémentaires. Météores inflige également (30.4% de la puissance des sorts) points de dégâts des astres instantanément à l’ensemble des adversaires valides à portée au moment de l’incantation.",
      "Vos dégâts sont augmentés de 10 % pendant toute Éclipse. Ce bonus décroît jusqu’à 2 % au milieu de l’Éclipse, puis croît jusqu’à 10 % à sa fin."
     ],
     "de": [
      "Schaden von 'Sternensog' um 20% erhöht. 'Sternenregen' verursacht außerdem (30.4% der Zaubermacht) Astralschaden zu und tötet beim Einsatz alle gültigen Gegner in der Nähe sofort.",
      "Euer Schaden ist während einer beliebigen Finsternis um 10% erhöht Dieser Bonus fällt zur Mitte der Finsternis auf 2% ab und steigt dann zum Ende wieder auf 10% an."
     ],
     "es": [
      "Daño de Oleada de estrellas aumentado un 20%. Lluvia de estrellas también inflige (30.4% del poder con hechizos) p. de daño Astral al instante a todos los enemigos válidos al alcance cuando se lanza.",
      "Tu daño aumenta un 10% durante Eclipse. Este bonus mengua hasta el 2% a la mitad de Eclipse y luego vuelve a crecer hasta el 10% al final."
     ]
    },
    "feral": {
     "en": [
      "When Incarnation: Avatar of Ashamane / Berserk ends, you deal 10% increased damage for Incarnation: Avatar of Ashamane: 0.75 sec for each combo point spent during Incarnation: Avatar of Ashamane / Berserk.",
      "Incarnation: Avatar of Ashamane / Berserk lasts 10 sec longer."
     ],
     "fr": [
      "À la fin Incarnation : avatar d’Ashamane: d’Incarnation : avatar d’Ashamane / de Berserk, vous infligez 10 % de dégâts supplémentaires pendant Incarnation : avatar d’Ashamane: 0.75 s pour chaque point de combo dépensé pendant Incarnation : avatar d’Ashamane / Berserk.",
      "Incarnation : avatar d’Ashamane / Berserk dure 10 s supplémentaires."
     ],
     "de": [
      "Wenn Inkarnation: Avatar von Ashamane: 'Inkarnation: Avatar von Ashamane' / 'Berserker' abläuft, wird Euer verursachter Schaden für jeden während Inkarnation: Avatar von Ashamane: 'Inkarnation: Avatar von Ashamane' / 'Berserker' verbrauchten Combopunkt für Inkarnation: Avatar von Ashamane: 0.75 Sek. um 10% erhöht.",
      "Inkarnation: Avatar von Ashamane: 'Inkarnation: Avatar von Ashamane' / 'Berserker' hält 10 Sek. länger an."
     ],
     "es": [
      "Cuando acaba Encarnación: Avatar de Crinceniza / Rabia, infliges un 10% más de daño durante Encarnación: Avatar de Crinceniza: 0.75 s por cada punto de combo gastado durante Encarnación: Avatar de Crinceniza / Rabia.",
      "Encarnación: Avatar de Crinceniza / Rabia dura 10 s más."
     ]
    },
    "guardian": {
     "en": [
      "Thrash has a 20% chance to make your next Mangle deal 100% increased damage.",
      "Thrash calls up 3 thorns, each impaling a target for (54% of Attack Power) Nature damage and dealing (27% of Attack Power) additional Nature damage to up to 5 nearby enemies, and extends the duration of Incarnation: Guardian of Ursoc / Berserk by 0.5 sec, up to 5.0 sec."
     ],
     "fr": [
      "Rosser a 20 % de chances de permettre à votre prochaine Mutilation d’infliger 100 % de dégâts supplémentaires.",
      "Rosser invoque 3 épines qui empalent chacune une cible, infligeant (54% de la puissance d’attaque) points de dégâts de nature, ainsi que (27% de la puissance d’attaque) points de dégâts de nature supplémentaires à un maximum de 5 adversaires proches, et prolonge la durée Incarnation : Gardien d’Ursoc: d’Incarnation : Gardien d’Ursoc / de Berserk de 0.5 s, jusqu’à un maximum de 5.0 s."
     ],
     "de": [
      "'Hauen' führt mit einer Chance von 20% dazu, dass Euer nächster Einsatz von 'Zerfleischen' um 100% erhöhten Schaden verursacht.",
      "'Hauen' lässt bis zu 3 Dornen hervorbrechen, die jeweils ein Ziel durchbohren und ihm (54% der Angriffskraft) Naturschaden sowie bis zu 5 Gegnern in der Nähe (27% der Angriffskraft) Naturschaden zufügen. Dornen erhöhen die Dauer von Inkarnation: Wächter von Ursoc: 'Inkarnation: Wächter von Ursoc' / 'Berserker' jeweils um 0.5 Sek., bis maximal 5.0 Sek."
     ],
     "es": [
      "Vapulear tiene un 20% de probabilidades de hacer que tu siguiente Destrozar inflija un 100% más de daño.",
      "Vapulear invoca 3 espinas, cada una de las cuales empala al objetivo para infligirle (54% del poder de ataque) p. de daño de Naturaleza en el momento y (27% del poder de ataque) p. de daño de Naturaleza más a un máximo de 5 enemigos cercanos. Además, las espinas prolongan 0.5 s la duración de Encarnación: Guardián de Ursoc / Rabia, hasta un máximo de 5.0 s."
     ]
    },
    "restoration": {
     "en": [
      "Rejuvenation has a 15% chance to grant Genesis, causing all your heal over time effects to heal for 15% more for 8 sec. Multiple applications may overlap.",
      "Nature's Swiftness, Tranquility, and Incarnation: Tree of Life / Convoke the Spirits have a 100% chance to grant Genesis, and Genesis duration is increased by 8 sec."
     ],
     "fr": [
      "Récupération a 15 % de chances de conférer Genèse, ce qui augmente de 15 % l’efficacité de vos soins sur la durée pendant 8 s. Cet effet peut être appliqué plusieurs fois simultanément.",
      "Rapidité de la nature, Tranquillité et Incarnation : Arbre de vie / Convoquer les esprits ont 100 % de chances de conférer Genèse, et la durée de Genèse est augmentée de 8 s."
     ],
     "de": [
      "'Verjüngung' hat eine Chance von 15%, 'Genesis' zu verleihen, wodurch alle Eure regelmäßigen Heileffekte 8 Sek. lang 15% erhöhte Heilung hervorrufen. Mehrere Anwendungen können überlappen.",
      "'Schnelligkeit der Natur', 'Gelassenheit' und Inkarnation: Baum des Lebens: 'Inkarnation: Baum des Lebens' / 'Konvokation der Geister' haben eine Chance von 100%, 'Genesis' zu verleihen, und die Dauer von 'Genesis' wird um 8 Sek. verlängert."
     ],
     "es": [
      "Rejuvenecimiento tiene un 15% de probabilidades de otorgar Génesis, lo que hará que todos tus efectos de sanación en el tiempo sean un 15% más potentes durante 8 s. Se pueden solapar varias aplicaciones.",
      "Presteza de la Naturaleza, Tranquilidad y Encarnación: Árbol de vida / Convocar a los espíritus tienen un 100% de probabilidades de otorgar Génesis. Además, la duración de Génesis aumenta 8 s."
     ]
    }
   }
  },
  "evoker": {
   "set": 2058,
   "name": {
    "en": "Echo of Calamity",
    "fr": "Écho de calamité",
    "de": "Echo des Unheils",
    "es": "Eco de calamidad"
   },
   "items": [
    {
     "slot": "head",
     "id": 271501,
     "icon": "inv_helm_mail_raidevokerulatek_d_01",
     "stats": [
      36,
      40
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271499,
     "icon": "inv_shoulder_mail_raidevokerulatek_d_01",
     "stats": [
      32,
      40
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271504,
     "icon": "inv_chest_mail_raidevokerulatek_d_01",
     "stats": [
      32,
      49
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271502,
     "icon": "inv_glove_mail_raidevokerulatek_d_01",
     "stats": [
      36,
      49
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271500,
     "icon": "inv_pant_mail_raidevokerulatek_d_01",
     "stats": [
      32,
      36
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "devastation": {
     "en": [
      "Shattering Star's damage is increased by 50%, and it always casts as if you had reached maximum empower level.",
      "Causality reduces the remaining cooldown of your empower spells by an additional 0.1 sec each time the effect occurs. Eternity Surge deals 10% increased damage."
     ],
     "fr": [
      "Étoile fracassante inflige 50 % de dégâts supplémentaires et se lance toujours au niveau de renforcement maximum.",
      "Causalité réduit le temps de recharge restant de vos sorts renforcés de 0.1 s supplémentaire chaque fois que l’effet se déclenche. Afflux d’éternité inflige 10 % de dégâts supplémentaires."
     ],
     "de": [
      "Der Schaden von 'Zerschmetternder Stern' ist um 50% erhöht und er wird immer gewirkt, als hättet Ihr die maximale Ermächtigungsstufe erreicht.",
      "'Kausalität' verringert die verbleibenden Abklingzeiten Eurer Zauber jedes Mal um zusätzlich 0.1 Sek., wenn der Effekt auftritt. 'Ewigkeitswoge' verursacht um 10% erhöhten Schaden."
     ],
     "es": [
      "El daño de Estrella devastadora aumenta un 50%, y siempre se lanza como si tuvieses el máximo nivel de potenciación.",
      "Causalidad reduce 0.1 s más el tiempo de reutilización restante de tus hechizos de potenciación cada vez que ocurre el efecto. Oleada de eternidad inflige un 10% más de daño."
     ]
    },
    "preservation": {
     "en": [
      "Consuming Essence Burst sends forth a Living Flame at your target at 100% effectiveness, or a nearby injured target if they are full health.",
      "Green spells restore 5% more health, and Verdant Embrace has a 100% chance to grant Essence Burst."
     ],
     "fr": [
      "La consommation d’Explosion d’essence projette une Flamme vivante sur votre cible à 100 % d’efficacité, ou sur une cible blessée proche si elle a tous ses points de vie.",
      "Les sorts verts rendent 5 % de points de vie supplémentaires, et Étreinte verdoyante a 100 % de chances de conférer Explosion d’essence."
     ],
     "de": [
      "Wenn 'Essenzexplosion' verbraucht wird, verschießt eine 'Lebende Flamme' mit 100% Effektivität auf Euer Ziel oder, falls es volle Gesundheit besitzt, auf ein verwundetes Ziel in der Nähe.",
      "Grüne Zauber stellen 5% mehr Gesundheit wieder her und 'Tiefgrüne Umarmung' hat eine Chance von 100%, 'Essenzexplosion' zu gewähren."
     ],
     "es": [
      "Al consumir Explosión de esencia, se lanza una Llama viva a un objetivo con un 100% de efectividad. Si ese objetivo tiene la salud al completo, se envía a un objetivo herido cercano.",
      "Los hechizos verdes restauran un 5% más de salud, y Abrazo verde tiene un 100% de probabilidades de otorgar Explosión de esencia."
     ]
    },
    "augmentation": {
     "en": [
      "Upheaval's cooldown is reduced by 10 sec.",
      "Upheaval magnifies your Fate Mirror effects for 8 sec, increasing the amount of damage echoed to 45%."
     ],
     "fr": [
      "Le temps de recharge de Soulèvement est réduit de 10 s.",
      "Soulèvement amplifie les effets de votre Miroir de destin pendant 8 s, portant le montant de dégâts reproduits à 45 %."
     ],
     "de": [
      "Abklingzeit von 'Emporstoßen' um 10 Sek. verringert.",
      "'Emporstoßen' verstärkt die Effekte Eures Schicksalsspiegels für 8 Sek., was dessen Schadensecho um 45% erhöht."
     ],
     "es": [
      "El tiempo de reutilización de Agitación se reduce 10 s.",
      "Agitación magnifica tus efectos de Espejo del destino durante 8 s, lo que aumenta al 45% el daño del eco."
     ]
    }
   }
  },
  "hunter": {
   "set": 2059,
   "name": {
    "en": "Skulking Viper's Ambush",
    "fr": "Embuscade de la vipère en maraude",
    "de": "Hinterhalt der lauernden Viper",
    "es": "Emboscada de víbora merodeadora"
   },
   "items": [
    {
     "slot": "head",
     "id": 271492,
     "icon": "inv_helm_mail_raidhunterulatek_d_01",
     "stats": [
      36,
      49
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271490,
     "icon": "inv_shoulder_mail_raidhunterulatek_d_01",
     "stats": [
      36,
      32
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271495,
     "icon": "inv_chest_mail_raidhunterulatek_d_01",
     "stats": [
      49,
      36
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271493,
     "icon": "inv_glove_mail_raidhunterulatek_d_01",
     "stats": [
      36,
      40
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271491,
     "icon": "inv_pant_mail_raidhunterulatek_d_01",
     "stats": [
      49,
      36
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "beastmastery": {
     "en": [
      "Barbed Shot causes your pets to stomp one additional time at 50% effectiveness.",
      "Stomp causes your next Cobra Shot to either benefit from Beast Cleave at 30% effectiveness, or strike your primary target for 20% additional damage, stacking up to 4 times."
     ],
     "fr": [
      "Tir acéré permet à vos familiers d’effectuer un piétinement supplémentaire à 50 % d’efficacité.",
      "Piétinement permet à votre prochain Tir du cobra de bénéficier d’Enchaînement bestial à 30 % d’efficacité, ou d’infliger 20 % de dégâts supplémentaires à votre cible principale, cumulable jusqu’à 4 fois."
     ],
     "de": [
      "'Stachelpfeil' lässt Eure Begleiter ein zusätzliches Mal mit 50% aufstampfen.",
      "'Stampfen' lässt Euren nächsten Einsatz von 'Kobraschuss' entweder mit 30% Effektivität von 'Raubtierhiebe' profitieren, oder Euer Ziel mit 20% erhöhtem Schaden treffen. Dieser Effekt ist bis zu 4-mal stapelbar."
     ],
     "es": [
      "Disparo con púas hace que tus mascotas den un pisotón más, con un 50% de efectividad.",
      "Pisotón hace que tu siguiente Disparo de cobra se beneficie de Tajo de la bestia con un 30% de efectividad o golpee a tu objetivo principal para infligirle un 20% de daño adicional. Se acumula hasta 4 veces."
     ]
    },
    "marksmanship": {
     "en": [
      "Explosive Shot lasts 1.0 sec longer and deals 5% increased damage.",
      "Aimed Shot and Rapid Fire damage increased by 5%. Each time Explosive Shot causes a burst of damage, the cooldown of Aimed Shot and Rapid Fire is reduced by 0.5 sec."
     ],
     "fr": [
      "Tir explosif dure 1.0 s supplémentaire et inflige 5 % de dégâts supplémentaires.",
      "Les dégâts de Visée et Tir rapide sont augmentés de 5 %. Chaque fois que Tir explosif inflige des dégâts importants, les temps de recharge de Visée et Tir rapide sont réduits de 0.5 s."
     ],
     "de": [
      "'Explosivschuss' hält 1.0 Sek. länger an und verursacht um 5% erhöhten Schaden.",
      "Schaden von 'Gezielter Schuss' und 'Schnellfeuer' um 5% erhöht. Jedes Mal, wenn 'Explosivschuss' eine Schadensexplosion auslöst, wird die Abklingzeit von 'Gezielter Schuss' und 'Schnellfeuer' um 0.5 Sek. verringert."
     ],
     "es": [
      "Disparo explosivo dura 1.0 s más e inflige un 5% más de daño.",
      "Daño de Disparo de puntería y Fuego rápido aumentado un 5%. Cada vez que Disparo explosivo inflige una ráfaga de daño, el tiempo de reutilización de Disparo de puntería y Fuego rápido se reduce 0.5 s."
     ]
    },
    "survival": {
     "en": [
      "Mongoose Fury also increases the damage of Wildfire Bomb by 10%",
      "Each blast of Boomstick extends the duration of Mongoose Fury by 1.0 sec. Mongoose Fury effects are increased by 10%."
     ],
     "fr": [
      "Fureur de la mangouste augmente également les dégâts de Bombe de feu de brousse de 10 %.",
      "Chaque détonation de Bâton-boum prolonge Fureur de la mangouste de 1.0 s. Les effets de Fureur de la mangouste sont augmentés de 10 %."
     ],
     "de": [
      "'Zorn des Mungos' erhöht zusätzlich den Schaden von 'Lauffeuerbombe' um 10%",
      "Jeder Schuss mit 'Schrotbüchse' verlängert die Dauer von 'Zorn des Mungos' um 1.0 Sek. Die Effekte von 'Zorn des Mungos' sind um 10% erhöht."
     ],
     "es": [
      "Furia de mangosta también aumenta un 10% el daño de Bomba de fuego salvaje.",
      "Cada explosión de Bocarda prolonga 1.0 s la duración de Furia de mangosta. Los efectos de Furia de mangosta aumentan un 10%."
     ]
    }
   }
  },
  "mage": {
   "set": 2060,
   "name": {
    "en": "Primal Leywarden's Attire",
    "fr": "Costume de garde tellurique primordiale",
    "de": "Gewand des urweltlichen Leyhüters",
    "es": "Atuendo de celador Ley primigenio"
   },
   "items": [
    {
     "slot": "head",
     "id": 271564,
     "icon": "inv_helm_cloth_raidmageulatek_d_01",
     "stats": [
      36,
      49
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271562,
     "icon": "inv_shoulder_cloth_raidmageulatek_d_01",
     "stats": [
      32,
      36
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271567,
     "icon": "inv_robe_cloth_raidmageulatek_d_01",
     "stats": [
      32,
      36
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271565,
     "icon": "inv_glove_cloth_raidmageulatek_d_01",
     "stats": [
      49,
      36
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271563,
     "icon": "inv_pant_cloth_raidmageulatek_d_01",
     "stats": [
      40,
      32
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "arcane": {
     "en": [
      "Arcane Missiles fires 1 additional Missile and deals 5% increased damage.",
      "Each wave of Arcane Missiles increases the damage of your next Arcane Blast, Arcane Pulse, or Prismatic Bolt by 3%, up to 24%."
     ],
     "fr": [
      "Projectiles des arcanes tire 1 projectile supplémentaire et inflige 5 % de dégâts supplémentaires.",
      "Chaque vague de Projectiles des arcanes augmente les dégâts infligés par votre prochaine utilisation de Déflagration des arcanes, d’Impulsion arcanique ou de Trait prismatique de 3 %, jusqu’à un maximum de 24 %."
     ],
     "de": [
      "'Arkane Geschosse' feuert 1 zusätzliches Geschoss ab und verursacht um 5% erhöhten Schaden.",
      "Jede Welle von 'Arkane Geschosse' erhöht den Schaden Eures nächsten Einsatzes von 'Arkanbeschuss', 'Arkaner Puls' oder 'Prismatischer Blitz' um 3%, bis zu 24%."
     ],
     "es": [
      "Misiles Arcanos dispara 1 misil más e inflige un 5% más de daño.",
      "Cada oleada de Misiles Arcanos aumenta un 3% el daño de tu siguiente Explosión Arcana, Pulso Arcano o Descarga prismática, hasta un máximo del 24%."
     ]
    },
    "fire": {
     "en": [
      "Pyroclasm causes Flamestrike and Pyroblast to always critically strike.",
      "Pyroclasm reduces the cast time of Flamestrike and Pyroblast by 20% and its damage bonus is increased by 25%."
     ],
     "fr": [
      "Pyroclasme permet à Choc de flammes et Explosion pyrotechnique d’infliger systématiquement des coups critiques.",
      "Pyroclasme réduit les temps d’incantation de Choc de flammes et d’Explosion pyrotechnique de 20 % et son bonus de dégâts augmente de 25 %."
     ],
     "de": [
      "'Pyroklasmus' führt dazu, dass 'Flammenstoß' und 'Pyroschlag' immer kritisch treffen.",
      "'Pyroklasmus' verringert die Zauberzeit von 'Flammenstoß' und 'Pyroschlag' um 20% und erhöht deren Schadensbonus um 25%."
     ],
     "es": [
      "Piroestallido hace que Fogonazo y Piroexplosión siempre asesten golpes críticos.",
      "Piroestallido reduce un 20% el tiempo de lanzamiento de Fogonazo y Piroexplosión, y su daño adicional aumenta un 25%."
     ]
    },
    "frost": {
     "en": [
      "Each stack of Freezing Shattered has a 4% chance to generate an Icicle. Glacial Spike damage increased by 20%.",
      "Casting Glacial Spike has a chance to rapidly generate 5 Icicles over 1 sec. Shatter damage increased by 5%."
     ],
     "fr": [
      "Chaque charge de Gel fracassée a 4 % de chances de générer un Glaçon. Les dégâts de Pointe glaciaire sont augmentés de 20 %.",
      "Le lancement de Pointe glaciaire a une chance de générer rapidement 5 glaçons pendant 1 s. Les dégâts de Fracasser sont augmentés de 5 %."
     ],
     "de": [
      "Jeder zertrümmerte Stapel von 'Eingefroren' hat eine Chance von 4%, einen 'Eiszapfen' zu erzeugen. Schaden von 'Gletscherstachel' um 20% erhöht.",
      "Beim Einsatz von 'Gletscherstachel' besteht eine Chance, im Verlauf von 1 Sek. 5 Eiszapfen entstehen zu lassen. Schaden von 'Zertrümmern' um 5% erhöht."
     ],
     "es": [
      "Cada acumulación de Congelación que se trice tiene un 4% de probabilidades de generar un carámbano. Daño de Pica glacial aumentado un 20%.",
      "Al lanzar Pica glacial, existe la posibilidad de que se generen rápidamente 5 carámbanos durante 1 s. Daño de Trizar aumentado un 5%."
     ]
    }
   }
  },
  "monk": {
   "set": 2061,
   "name": {
    "en": "Guile of the Monkey King",
    "fr": "Fourberie du roi-singe",
    "de": "List des Affenkönigs",
    "es": "Astucia del Rey Mono"
   },
   "items": [
    {
     "slot": "head",
     "id": 271519,
     "icon": "inv_helm_leather_raidmonkulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271517,
     "icon": "inv_shoulder_leather_raidmonkulatek_d_01",
     "stats": [
      36,
      49
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271522,
     "icon": "inv_chest_leather_raidmonkulatek_d_01",
     "stats": [
      49,
      36
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271520,
     "icon": "inv_glove_leather_raidmonkulatek_d_01",
     "stats": [
      36,
      40
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271518,
     "icon": "inv_pant_leather_raidmonkulatek_d_01",
     "stats": [
      32,
      40
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "brewmaster": {
     "en": [
      "Breath of Fire ignites your next Keg Smash, causing it to explode on contact, dealing (50% of Attack Power) additional Flamestrike damage to its primary target and reduced damage to additional targets.",
      "Ignited Keg Smashes cause enemies struck to take 8% increased damage from your Physical abilities, and leave a patch of flames on the ground, dealing (25% of Attack Power) Fire damage each second for 5 sec."
     ],
     "fr": [
      "Souffle de feu embrase votre prochain Fracasse-tonneau, ce qui entraîne son explosion à l’impact, infligeant (50% de la puissance d’attaque) points de dégâts de Choc de flammes supplémentaires à sa cible principale ainsi que des dégâts réduits aux cibles supplémentaires.",
      "Les Fracasse-tonneaux embrasés augmentent de 8 % les dégâts que vos techniques physiques infligent aux personnages adverses touchés, et laissent une gerbe de flammes au sol, infligeant (25% de la puissance d’attaque) points de dégâts de feu chaque seconde pendant 5 s."
     ],
     "de": [
      "Der Einsatz von 'Feuerodem' entflammt Euren nächsten Einsatz von 'Fasshieb', was eine Explosion auslöst und dem Primärziel zusätzlich (50% der Angriffskraft) Flammenstoßschaden sowie weiteren Zielen verringerten Schaden zufügt.",
      "Entflammte Einsätze von 'Fasshieb' lassen getroffene Gegner um 8% erhöhten Schaden durch Eure körperlichen Fähigkeiten erleiden und hinterlassen ein Flammenfeld auf dem Boden, das 5 Sek. lang (25% der Angriffskraft) Feuerschaden pro Sekunde verursacht."
     ],
     "es": [
      "Aliento de Fuego prende tu siguiente Embate con barril para hacer que explote al contacto e inflija (50% del poder de ataque) p. de daño Pirofísico más a su objetivo principal y daño reducido a otros objetivos.",
      "Los Embates con barril prendidos hacen que los enemigos golpeados reciban un 8% más de daño de tus facultades físicas y dejan una zona de llamas en el suelo que inflige (25% del poder de ataque) p. de daño de Fuego cada segundo durante 5 s."
     ]
    },
    "windwalker": {
     "en": [
      "Fists of Fury strikes an additional time at the start of its channel at 50% effectiveness.",
      "Fists of Fury increases the damage of your next Rising Sun Kick by 10% or Spinning Crane Kick by 20% each time it strikes, stacking up to 6 times."
     ],
     "fr": [
      "Poings de fureur frappe une fois supplémentaire au début de sa canalisation à 50 % d’efficacité.",
      "À chaque frappe, Poings de fureur augmente les dégâts de votre prochain Coup de pied du soleil levant de 10 % ou ceux de votre prochain Coup tournoyant de la grue de 20 %, cumulable jusqu’à 6 fois."
     ],
     "de": [
      "'Furorfäuste' schlägt zu Beginn der Kanalisierung ein zusätzliches Mal mit 50% Effektivität zu.",
      "Jeder Treffer von 'Furorfäuste' erhöht den Schaden Eures nächsten Einsatzes von 'Tritt der aufgehenden Sonne' um 10% oder von 'Wirbelnder Kranichtritt' um 20%. Bis zu 6-mal stapelbar."
     ],
     "es": [
      "Puños de furia golpea una vez más al principio de su canalización con un 50% de efectividad.",
      "Puños de furia aumenta un 10% el daño de tu siguiente Patada del sol naciente o un 20% el de tu Patada giratoria de la grulla cada vez que golpea. Se acumula hasta 6 veces."
     ]
    },
    "mistweaver": {
     "en": [
      "Rising Sun Kick deals 30% increased damage and Rushing Wind Kick's healing is increased by 100%.",
      "Rising Sun Kick and Rushing Wind Kick have a chance to cause their next cast to ignore their cooldown and reduce their mana cost by 100%."
     ],
     "fr": [
      "Coup de pied du soleil levant inflige 30 % de dégâts supplémentaires et Coup de pied du vent impétueux rend 100 % de points de vie supplémentaires.",
      "Coup de pied du soleil levant et Coup de pied du vent impétueux ont une chance de permettre à leur prochaine utilisation d’ignorer leur temps de recharge tout en réduisant leur coût en mana de 100 %."
     ],
     "de": [
      "'Tritt der aufgehenden Sonne' verursacht um 30% erhöhten Schaden und die Heilung von 'Tritt des aufziehenden Windes' ist um 100% erhöht.",
      "Beim Einsatz von 'Tritt der aufgehenden Sonne' und 'Tritt des aufziehenden Windes' besteht eine Chance, das der nächste Einsatz die Abklingzeit ignoriert und 100% weniger Mana kostet."
     ],
     "es": [
      "Patada del sol naciente inflige un 30% más de daño, y la sanación de Patada del viento impetuoso aumenta un 100%.",
      "Existe la posibilidad de que Patada del sol naciente y Patada del viento impetuoso hagan que su siguiente lanzamiento ignore el tiempo de reutilización y reduzca un 100% su coste de maná."
     ]
    }
   }
  },
  "paladin": {
   "set": 2062,
   "name": {
    "en": "Radiance of the Consecrated Flame",
    "fr": "Radiance de la flamme consacrée",
    "de": "Strahlen der geweihten Flamme",
    "es": "Resplandor de la llama consagrada"
   },
   "items": [
    {
     "slot": "head",
     "id": 271465,
     "icon": "inv_helm_plate_raidpaladinulatek_d_01",
     "stats": [
      32,
      49
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271463,
     "icon": "inv_shoulder_plate_raidpaladinulatek_d_01",
     "stats": [
      32,
      49
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271468,
     "icon": "inv_chest_plate_raidpaladinulatek_d_01",
     "stats": [
      49,
      36
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271466,
     "icon": "inv_glove_plate_raidpaladinulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271464,
     "icon": "inv_pant_plate_raidpaladinulatek_d_01",
     "stats": [
      36,
      32
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "holy": {
     "en": [
      "Infusion of Light increases the healing of Flash of Light by an additional 100% and the absorb from Greater Judgment by an additional 100%.",
      "Judgment now has a 20% chance to grant Infusion of Light. Holy Light now has a 100% chance to grant Infusion of Light, but its mana cost is increased by 50%."
     ],
     "fr": [
      "Imprégnation de lumière augmente les soins d’Éclair lumineux de 100 % supplémentaires et l’absorption de Jugement supérieur de 100 % supplémentaires.",
      "Jugement a désormais 20 % de chances de conférer Imprégnation de lumière. Lumière sacrée a désormais 100 % de chances de conférer Imprégnation de lumière, mais son coût en mana est augmenté de 50 %."
     ],
     "de": [
      "'Lichtinfusion' erhöht die Heilung von 'Lichtblitz' zusätzlich um 100% und den Absorptionswert von 'Großes Richturteil' um zusätzlich 100%.",
      "'Richturteil' hat jetzt eine Chance von 20%, 'Lichtinfusion' zu gewähren. 'Heiliges Licht' hat jetzt eine Chance von 100%, 'Lichtinfusion' zu gewähren, wobei dessen Manakosten um 50% erhöht werden."
     ],
     "es": [
      "Infusión de Luz aumenta un 100% más la sanación de Destello de Luz y un 100% más la absorción de Sentencia superior.",
      "Ahora, Sentencia tiene un 20% de probabilidades de otorgar Infusión de Luz. Además, Luz Sagrada tiene un 100% de probabilidades de otorgar Infusión de Luz, pero su coste de maná aumenta un 50%."
     ]
    },
    "protection": {
     "en": [
      "Consecration is 30% larger and enemies within your Consecration are illuminated, increasing the chance for your abilities to critically strike them by 5%.",
      "Enemies struck by Judgment or Blessed Hammer Hammer of the Righteous / Crusader Strike take 20% additional Holy damage. If they are struck by a critical strike the additional damage is increased by 100%."
     ],
     "fr": [
      "La zone de Consécration est 30 % plus étendue et les adversaires se trouvant à l’intérieur sont victimes d’illumination, ce qui augmente de 5 % les chances que vos techniques leur infligent un coup critique.",
      "Les personnages adverses touchés par Jugement ou Marteau béni Marteau du vertueux / Frappe du croisé subissent 20 % de dégâts du sacré supplémentaires. En cas de coup critique, les dégâts supplémentaires sont augmentés de 100 %."
     ],
     "de": [
      "Der Effektbereich von 'Weihe' ist um 30% größer und Gegner darin werden erleuchtet, was die kritische Trefferchance Eurer Fähigkeiten gegen sie um 5% erhöht.",
      "Gegner, die von 'Richturteil' oder Gesegneter Hammer: 'Gesegneter Hammer' Hammer der Rechtschaffenen: 'Hammer der Rechtschaffenen' / 'Kreuzfahrerstoß' getroffen werden, erleiden 20% zusätzlichen Heiligschaden. Wenn sie einen kritischen Treffer erleiden, wird der zusätzliche Schaden um 100% erhöht."
     ],
     "es": [
      "Consagración es un 30% más grande, y los enemigos en su interior quedan iluminados, lo que aumenta un 5% la probabilidad de que tus facultades asesten golpes críticos.",
      "Los enemigos golpeados por Sentencia o Martillo bendito Martillo del honrado / Golpe de cruzado reciben un 20% más de daño Sagrado. Si reciben un golpe crítico, el daño adicional aumenta un 100%."
     ]
    },
    "retribution": {
     "en": [
      "Divine Purpose has an additional 10% chance to activate, and consuming it grants Divine Power, increasing Holy damage done by 10% for 12 sec.",
      "Consuming Divine Purpose grants Divine Arbiter, empowering your other Holy Power spenders to unleash an arbiter of light at their primary target, dealing (1012.5% of Attack Power) Holy damage and (472.5% of Attack Power) Holy damage to enemies within 8 yds. Cannot occur while Divine Arbiter is active."
     ],
     "fr": [
      "Dessein divin a 10 % de chances supplémentaires de se déclencher et sa consommation confère Pouvoir divin, ce qui augmente les dégâts du sacré infligés de 10 % pendant 12 s.",
      "La consommation de Dessein divin confère Arbitre divin, permettant à vos autres sorts dépensant de la puissance sacrée de déchaîner Arbitre de Lumière sur leur cible principale, infligeant (1012.5% de la puissance d’attaque) points de dégâts du sacré ainsi que (472.5% de la puissance d’attaque) aux adversaires à moins de 8 m. Ne peut pas se produire tant qu’Arbitre divin est actif."
     ],
     "de": [
      "'Göttliche Bestimmung' hat eine um 10% erhöhte Auslösechance und das Verbrauchen gewährt 'Göttliche Macht', was den verursachten Heiligschaden 12 Sek. lang um 10% erhöht.",
      "Der Verbrauch von 'Göttliche Bestimmung' gewährt 'Göttlicher Richter', der Eure anderen Heilige Kraft verbrauchenden Fähigkeiten ermächtigt, um einen Richter des Lichts auf Euer Primärziel zu entfesseln, der (1012.5% der Angriffskraft) Heiligschaden verursacht und Gegnern innerhalb von 8 Metern (472.5% der Angriffskraft) Heiligschaden zufügt. Kann nicht auftreten, während 'Göttlicher Richter' aktiv ist."
     ],
     "es": [
      "Propósito divino tiene un 10% más de probabilidad de activarse. Además, al consumir la facultad, se obtiene Poder divino, que aumenta un 10% el daño Sagrado infligido durante 12 s.",
      "Consumir Propósito divino otorga Enjuiciador divino, lo que potencia tus otras facultades que consumen poder sagrado para que desaten un enjuiciador de Luz contra su objetivo principal, lo que inflige (1012.5% del poder de ataque) p. de daño Sagrado y (472.5% del poder de ataque) p. de daño Sagrado a los enemigos en un radio de 8 m. No puede ocurrir si Enjuiciador divino está activa."
     ]
    }
   }
  },
  "priest": {
   "set": 2063,
   "name": {
    "en": "Cosmic Penitent's Raiment",
    "fr": "Grande tenue de la pénitence cosmique",
    "de": "Gewandung des kosmischen Büßers",
    "es": "Vestiduras de penitente cósmico"
   },
   "items": [
    {
     "slot": "head",
     "id": 271555,
     "icon": "inv_helm_cloth_raidpriestulatek_d_01",
     "stats": [
      32,
      49
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271553,
     "icon": "inv_shoulder_cloth_raidpriestulatek_d_01",
     "stats": [
      32,
      36
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271558,
     "icon": "inv_robe_cloth_raidpriestulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271556,
     "icon": "inv_glove_cloth_raidpriestulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271554,
     "icon": "inv_pant_cloth_raidpriestulatek_d_01",
     "stats": [
      36,
      40
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "discipline": {
     "en": [
      "Penance damage and healing increased by 20%. Casting Penance reduces the cooldown of Mind Blast by 2.0 sec.",
      "After casting Mind Blast, your next Power Word: Shield or Void Shield absorbs 25% more damage."
     ],
     "fr": [
      "Dégâts et soins de Pénitence augmentés de 20 %. le lancement de Pénitence réduit le temps de recharge d’Attaque mentale de 2.0 s.",
      "Après le lancement d’Attaque mentale, votre prochain Mot de pouvoir : Bouclier ou Bouclier du Vide absorbe 25 % de dégâts supplémentaires."
     ],
     "de": [
      "Schaden und Heilung von 'Sühne' um 20% erhöht. Das Wirken von 'Sühne' verringert die Abklingzeit von 'Gedankenschlag' um 2.0 Sek.",
      "Nach dem Wirken von 'Gedankenschlag' absorbiert Euer nächster Einsatz von 'Machtwort: Schild' oder 'Leerenschild' 25% mehr Schaden."
     ],
     "es": [
      "Daño y sanación de Penitencia aumentados un 20%. Al lanzar Penitencia, se reduce 2.0 s el tiempo de reutilización de Explosión mental.",
      "Tras lanzar Explosión mental, tu próximo Escudo del Vacío o Palabra de poder: escudo absorbe un 25% más de daño."
     ]
    },
    "holy": {
     "en": [
      "Each target affected by your Renew increases the critical strike chance of your spells and abilities by 2%, up to 6%.",
      "Renew healing increased by 10%. Light's Resurgence now has a 100% chance to leave a Renew on the first target Prayer of Mending heals."
     ],
     "fr": [
      "Chaque cible affectée par votre Rénovation augmente les chances de coup critique de vos sorts et techniques de 2 %, jusqu’à un maximum de 6 %.",
      "Les soins de Rénovation sont augmentés de 10 %. Résurgence de la Lumière a désormais 100 % de chances d’appliquer Rénovation à la première cible soignée par Prière de guérison."
     ],
     "de": [
      "Jedes Ziel, das von Eurer 'Erneuerung' betroffen ist, erhöht die kritische Trefferchance Eurer Zauber und Fähigkeiten um 2%, bis maximal 6%.",
      "Heilung von 'Erneuerung' um 10% erhöht. 'Rückkehr des Lichts' hat jetzt eine Chance von 100%, eine 'Erneuerung' auf dem ersten Ziel zu hinterlassen, das von 'Gebet der Besserung' geheilt wird."
     ],
     "es": [
      "Cada objetivo afectado por tu Renovar aumenta un 2% la probabilidad de golpe crítico de tus hechizos y facultades, hasta un máximo del 6%.",
      "Sanación de Renovar aumentada un 10%. Ahora, Resurgimiento de la Luz tiene un 100% de probabilidades de otorgar Renovar al primer objetivo al que sane Rezo de alivio."
     ]
    },
    "shadow": {
     "en": [
      "Tentacle Slam's cooldown is reduced by 3 sec and its damage is increased by 100%.",
      "Tentacle Slam has a 100% chance to grant a free use of Void Volley at 100% effectiveness."
     ],
     "fr": [
      "Le temps de recharge de Frappe tentaculaire est réduit de 3 s et ses dégâts sont augmentés de 100 %.",
      "Frappe tentaculaire a 100 % de chances de vous permettre de lancer Salve du Vide sans coût à 100 % d’efficacité."
     ],
     "de": [
      "Verringert die Abklingzeit von 'Tentakelschlag' um 3 Sek. und erhöht den Schaden um 100%.",
      "'Tentakelschlag' hat eine Chance von 100%, einen kostenlosen Einsatz von 'Leerensalve' mit 100% Effektivität zu gewähren."
     ],
     "es": [
      "El tiempo de reutilización de Embate de tentáculo se reduce 3 s, y su daño aumenta un 100%.",
      "Embate de tentáculo tiene un 100% de probabilidades de otorgar un uso gratis de Salva del Vacío con un 100% de efectividad."
     ]
    }
   }
  },
  "rogue": {
   "set": 2064,
   "name": {
    "en": "Chosen Bloodslayer's Hexweave",
    "fr": "Trame-sort de l’occision d’élite",
    "de": "Hexgeflecht des auserkorenen Blutschlächters",
    "es": "Tejido de maleficio de cercenacastas elegido"
   },
   "items": [
    {
     "slot": "head",
     "id": 271510,
     "icon": "inv_helm_leather_raidrogueulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271508,
     "icon": "inv_shoulder_leather_raidrogueulatek_d_01",
     "stats": [
      40,
      36
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271513,
     "icon": "inv_chest_leather_raidrogueulatek_d_01",
     "stats": [
      36,
      40
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271511,
     "icon": "inv_glove_leather_raidrogueulatek_d_01",
     "stats": [
      32,
      49
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271509,
     "icon": "inv_pant_leather_raidrogueulatek_d_01",
     "stats": [
      36,
      32
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "assassination": {
     "en": [
      "Envenom damage increased by 10% and it increases your damage dealt by 3%.",
      "Deadly Poison increases your bleed damage on the target by 10%. Auto-attacks to targets with your Amplifying Poison deal 3% increased damage per stack. Wound Poison hits a second time."
     ],
     "fr": [
      "Envenimer inflige 10 % de dégâts supplémentaires et augmente les dégâts que vous infligez de 3 %.",
      "Poison mortel augmente les dégâts de saignement que vous infligez à la cible de 10 %. Les attaques automatiques sur les cibles victimes de votre Poison amplifiant infligent 3 % de dégâts supplémentaires par cumul. Poison douloureux frappe une deuxième fois."
     ],
     "de": [
      "Verursachter Schaden von 'Vergiften' um 10% erhöht, außerdem erhöht es Euren verursachten Schaden um 3%.",
      "'Tödliches Gift' erhöht Euren beim Ziel verursachten Blutungsschaden um 10%. Automatische Angriffe gegen Ziele, die von Eurem 'Verstärkenden Gift' betroffen sind, verursachen 3% mehr Schaden pro Stapel. 'Wundgift' trifft ein zweites Mal."
     ],
     "es": [
      "Daño de Envenenar aumentado un 10%. Además, aumenta un 3% el daño que infliges.",
      "Veneno mortal aumenta un 10% tu daño de sangrado contra el objetivo. Los ataques automáticos a objetivos con tu Veneno amplificador infligen un 3% más de daño por acumulación. Veneno hiriente golpea una segunda vez."
     ]
    },
    "outlaw": {
     "en": [
      "Dispatch damage increased by 15%.",
      "Sinister Strike and Ambush have a 20% chance to cause your next Dispatch to be free and deal damage as if you spent the maximum combo points."
     ],
     "fr": [
      "Dégâts de Couperet augmentés de 15 %.",
      "Attaque pernicieuse et Embuscade ont 20 % de chances de permettre à votre prochain Couperet d’être gratuit et d’infliger des dégâts correspondant au maximum de points de combo possible."
     ],
     "de": [
      "Schaden von 'Tötung' um 15% erhöht.",
      "'Finsterer Stoß' und 'Hinterhalt' haben eine Chance von 20%, dass Euer nächster Einsatz von 'Tötung' kostenlos ist und Schaden verursacht, als hättet Ihr maximale Combopunkte ausgegeben."
     ],
     "es": [
      "Daño de Despachar aumentado un 15%.",
      "Golpe siniestro y Emboscada tienen un 20% de probabilidades de hacer que tu siguiente Despachar sea gratis e inflija daño como si gastases el máximo de puntos de combo."
     ]
    },
    "subtlety": {
     "en": [
      "Backstab costs 10 less Energy and has 100% increased damage. Shuriken Storm costs 5 less Energy and has 60% increased damage.",
      "Lingering Shadow now also benefits Eviscerate and Black Powder at 60% effectiveness."
     ],
     "fr": [
      "Attaque sournoise coûte 10 points d’énergie en moins et inflige 100 % de dégâts supplémentaires. Tempête de shurikens coûte 5 points d’énergie en moins et inflige 60 % de dégâts supplémentaires.",
      "Éviscération et Poudre noire bénéficient désormais de l’effet d’Ombre persistante à 60 % d’efficacité."
     ],
     "de": [
      "'Meucheln' kostet 10 Energie weniger und hat eine Chance von 100%, erhöhten Schaden zu verursachen. 'Shurikensturm' kostet 5 Energie weniger und hat eine Chance von 60%, erhöhten Schaden zu verursachen.",
      "'Verweilender Schatten' wirkt sich jetzt mit 60% Effektivität auch auf 'Ausweiden' und 'Schwarzpulver' aus."
     ],
     "es": [
      "Puñalada cuesta 10 p. de energía menos e inflige un 100% más de daño. Tormenta de shuriken cuesta 5 p. de energía menos e inflige un 60% más de daño.",
      "Ahora, Sombra persistente también se beneficia de Eviscerar y Pólvora negra con un 60% de efectividad."
     ]
    }
   }
  },
  "shaman": {
   "set": 2065,
   "name": {
    "en": "Ophidian Oracle's Prophecy",
    "fr": "Prophétie d’oracle ophidien",
    "de": "Prophezeiung des Schlangenorakels",
    "es": "Profecía de oráculo ofidio"
   },
   "items": [
    {
     "slot": "head",
     "id": 271483,
     "icon": "inv_helm_mail_raidshamanulatek_d_01",
     "stats": [
      36,
      32
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271481,
     "icon": "inv_shoulder_mail_raidshamanulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271486,
     "icon": "inv_robe_mail_raidshamanulatek_d_01",
     "stats": [
      32,
      36
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271484,
     "icon": "inv_glove_mail_raidshamanulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271482,
     "icon": "inv_pant_mail_raidshamanulatek_d_01",
     "stats": [
      40,
      36
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "elemental": {
     "en": [
      "Earth Shock, Earthquake, and Elemental Blast damage increased by 25%.",
      "When Stormkeeper or Ascendance fade, your next 2 Lightning Bolts, Chain Lightnings, or Lava Bursts deal 25% increased damage and cause your next Earthquake, Earth Shock, or Elemental Blast to cost 100% less Maelstrom."
     ],
     "fr": [
      "Dégâts de Horion de terre, de Séisme et d’Explosion élémentaire augmentés de 25 %.",
      "À la fin de l’effet de Gardien des tempêtes ou d’Ascendance, 2 prochaines utilisations d’Éclair, de Chaîne d’éclairs ou d’Explosion de lave infligent 25 % de dégâts supplémentaires en plus de réduire de 100 % le coût en maelström du prochain Séisme, du prochain Horion de terre ou de la prochaine Explosion élémentaire."
     ],
     "de": [
      "Schaden von 'Erdschock', 'Erdbeben' und 'Elementarschlag' um 25% erhöht.",
      "Wenn 'Sturmhüter' oder 'Aszendenz' ablaufen, wird der Schaden Eures nächsten Einsatzes:Eurer nächsten 2 Einsätze; von $l'Blitzschlag', $l'Kettenblitzschlag' oder $l'Lavaeruption' um 25% erhöht und Euer nächster Einsatz von 'Erdbeben', 'Erdschock' oder 'Elementarschlag' kostet 100% weniger Mahlstrom."
     ],
     "es": [
      "Daño de Choque de tierra, Terremoto y Explosión elemental aumentado un 25%.",
      "Quando o Guardião da Tempestade ou a Ascendência se dissipam, 2 execuções subsequentes de Raio, Cadeia de Raios ou Estouro de Lava causam 25% a mais de dano, fazendo o seu próximo Terremoto, Choque Terreno ou Impacto Elemental custar menos 100% de Voragem."
     ]
    },
    "enhancement": {
     "en": [
      "Voltaic Blaze causes your primary target to erupt in a Fire Nova every 2 sec for 6 sec. Fire Nova deals 200% increased damage to the primary target of your Voltaic Blaze.",
      "Fire Nova reduces the cooldown of Crash Lightning by 2.0 sec and increases the damage of your next Crash Lightning by 8%, stacking up to 5 times."
     ],
     "fr": [
      "Brasier voltaïque provoque l’embrasement de votre cible principale en Nova de feu toutes les 2 s pendant 6 s. Nova de feu inflige 200 % de dégâts supplémentaires à la cible principale de votre Brasier voltaïque.",
      "Nova de feu réduit le temps de recharge d’Impact foudroyant de 2.0 s et augmente les dégâts de votre prochain Impact foudroyant de 8 %, cumulable jusqu’à 5 fois."
     ],
     "de": [
      "'Voltaiklohe' lässt Euer Primärziel 6 Sek. lang alle 2 Sek. in einer Feuernova ausbrechen. 'Feuernova' fügt dem Primärziel 200% mehr Schaden Eurer 'Voltaiklohe' zu.",
      "'Feuernova' reduziert die Abklingzeit von 'Tobende Blitze' um 2.0 Sek. und erhöht den Schaden Eures nächsten Einsatzes von 'Tobende Blitze' um 8%. Bis zu 5-mal stapelbar."
     ],
     "es": [
      "Llamarada voltaica hace que tu objetivo principal estalle en una Nova de Fuego cada 2 s durante 6 s. Nova de Fuego inflige un 200% más de daño al objetivo principal de tu Llamarada voltaica.",
      "Nova de Fuego reduce 2.0 s el tiempo de reutilización de Estallido de relámpagos y aumenta un 8% el daño de tu siguiente Estallido de relámpagos. Se acumula hasta 5 veces."
     ]
    },
    "restoration": {
     "en": [
      "Healing Wave and Chain Heal have a chance to create a Healing Rain at the target's location for 8.0 sec.",
      "Every 1 sec, 1 ally inside of Healing Rain gains a watery shield that absorbs 0 damage for 10 sec."
     ],
     "fr": [
      "Vague de soins et Salve de guérison ont une chance de créer une Pluie guérisseuse à l’emplacement de la cible pendant 8.0 s.",
      "Toutes les 1 s, 1 personnage allié à l’intérieur de la Pluie guérisseuse obtient un bouclier aqueux qui absorbe 0 points de dégâts pendant 10 s."
     ],
     "de": [
      "'Welle der Heilung' und 'Kettenheilung' haben eine Chance, für 8.0 Sek. einen 'Heilenden Regen' an der Position des Ziels auszulösen.",
      "Alle 1 Sek. erhält 1 Verbündeter im Effektbereich von 'Heilender Regen' einen Wasserschild, der 10 Sek. lang 0 Schaden absorbiert."
     ],
     "es": [
      "Existe la posibilidad de que Ola de sanación y Sanación en cadena creen una Lluvia de sanación en la ubicación del objetivo durante 8.0 s.",
      "Cada 1 s, 1 aliado en el interior de Lluvia de sanación obtiene un escudo acuoso que absorbe 0 p. de daño durante 10 s."
     ]
    }
   }
  },
  "warlock": {
   "set": 2066,
   "name": {
    "en": "Damned Necrolyte's Shattered Restraints",
    "fr": "Entraves brisées de nécrolyte damnée",
    "de": "Gesprengte Fesseln des verdammten Nekrolythen",
    "es": "Ataduras destrozadas de necrólito condenado"
   },
   "items": [
    {
     "slot": "head",
     "id": 271546,
     "icon": "inv_helm_cloth_raidwarlockulatek_d_01",
     "stats": [
      49,
      40
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271544,
     "icon": "inv_shoulder_cloth_raidwarlockulatek_d_01",
     "stats": [
      40,
      36
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271549,
     "icon": "inv_robe_cloth_raidwarlockulatek_d_01",
     "stats": [
      36,
      49
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271547,
     "icon": "inv_glove_cloth_raidwarlockulatek_d_01",
     "stats": [
      36,
      32
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271545,
     "icon": "inv_pant_cloth_raidwarlockulatek_d_01",
     "stats": [
      36,
      49
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "affliction": {
     "en": [
      "Wither / Corruption damage increased by 25%. Agony damage increased by 15%.",
      "Each active Unstable Affliction increases your damage dealt by your spells and abilities by 2%, up to 6%. Seed of Corruption applies Unstable Affliction at 20% effectiveness to your target."
     ],
     "fr": [
      "Dégâts de Flétrissement / Corruption augmentés de 25 %. Dégâts d’Agonie augmentés de 15 %.",
      "Chaque Affliction instable active augmente les dégâts infligés par vos sorts et techniques de 2 % jusqu’à un maximum de 6 %. Graine de Corruption applique Affliction instable à 20 % d’efficacité à votre cible."
     ],
     "de": [
      "Der Schaden von Welken: 'Welken' / 'Verderbnis' wird um 25% erhöht. Der Schaden von 'Agonie' wird um 15% erhöht.",
      "Jedes aktive 'Instabiles Gebrechen' erhöht den verursachten Schaden Eurer Zauber und Fähigkeiten um 2%, bis maximal 6%. 'Saat der Verderbnis' belegt Euer Ziel mit einem 'Instabilen Gebrechen' mit 20% Effektivität."
     ],
     "es": [
      "Daño de Marchitar / Corrupción aumentado un 25%. Daño de Agonía aumentado un 15%.",
      "Cada Aflicción inestable activa aumenta un 2% el daño infligido de tus hechizos y facultades, hasta un máximo de un 6%. Semilla de corrupción le aplica a tu objetivo Aflicción inestable con un 20% de efectividad."
     ]
    },
    "demonology": {
     "en": [
      "Wild Imp damage increased by 10%. Implosion damage increased by 20%.",
      "When their energy depletes, Wild Imps have a 20% chance to fling themselves at their target and Implode at 350% effectiveness to their main target and 315% effectiveness to other targets."
     ],
     "fr": [
      "Dégâts de diablotin sauvage augmentés de 10 %. Dégâts d’Implosion augmentés de 20 %.",
      "Lorsque leur énergie s’épuise, les diablotins sauvages ont 20 % de chances de se jeter sur leur cible en implosant avec 350 % d’efficacité sur leur cible principale et 315 % d’efficacité sur les autres cibles."
     ],
     "de": [
      "Schaden von 'Wildwichtel' um 10% erhöht. Schaden von 'Implosion' um 20% erhöht.",
      "Wenn ihre Energie versiegt, haben Wildwichtel eine Chance von 20%, sich auf ihr Ziel zu stürzen und mit 350% gegen ihr Hauptziel und 315% gegen weitere Ziele zu implodieren."
     ],
     "es": [
      "Daño de diablillos salvajes aumentado un 10%. Daño de Implosión aumentado un 20%.",
      "Cuando la energía se agota, los diablillos salvajes tienen un 20% de probabilidades de arrojarse contra su objetivo y aplicar Implosión con un 350% de efectividad al objetivo principal y con un 315% de efectividad a los demás objetivos."
     ]
    },
    "destruction": {
     "en": [
      "Incinerate damage increased by 25% and Incinerate has a 10% increased chance to evoke an Echo of Sargeras.",
      "Targets damaged by Echo of Sargeras take 6% increased damage from your spells and abilities for 6 sec."
     ],
     "fr": [
      "Les dégâts d’Incinérer sont augmentés de 25 %, et Incinérer a 10 % de chances supplémentaires d’invoquer un Écho de Sargeras.",
      "Les cibles touchées par Écho de Sargeras subissent 6 % de dégâts supplémentaires de vos sorts et techniques pendant 6 s."
     ],
     "de": [
      "Schaden von 'Verbrennen' um 25% erhöht und 'Verbrennen' hat eine um 10% erhöhte Chance, ein 'Echo von Sargeras' hervorzurufen.",
      "Ziele, die Schaden durch 'Echo von Sargeras' erleiden, erleiden 6 Sek. lang 6% mehr Schaden durch Eure Zauber und Fähigkeiten."
     ],
     "es": [
      "Daño de Incinerar aumentado un 25%. Incinerar tiene un 10% más de probabilidades de crear un Eco de Sargeras.",
      "Los objetivos dañados por Eco de Sargeras reciben un 6% más de daño de tus hechizos y facultades durante 6 s."
     ]
    }
   }
  },
  "warrior": {
   "set": 2067,
   "name": {
    "en": "Jade Warlord's Dominion",
    "fr": "Domaine du seigneur de guerre de jade",
    "de": "Herrschaft des Jadekriegsfürsten",
    "es": "Dominio de señor de la guerra de jade"
   },
   "items": [
    {
     "slot": "head",
     "id": 271456,
     "icon": "inv_helm_plate_raidwarriorulatek_d_01",
     "stats": [
      32,
      36
     ],
     "boss": 2887
    },
    {
     "slot": "shoulder",
     "id": 271454,
     "icon": "inv_shoulder_plate_raidwarriorulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2894
    },
    {
     "slot": "chest",
     "id": 271459,
     "icon": "inv_chest_plate_raidwarriorulatek_d_01",
     "stats": [
      49,
      32
     ],
     "boss": 2882
    },
    {
     "slot": "hands",
     "id": 271457,
     "icon": "inv_glove_plate_raidwarriorulatek_d_01",
     "stats": [
      32,
      36
     ],
     "boss": 2874
    },
    {
     "slot": "legs",
     "id": 271455,
     "icon": "inv_pant_plate_raidwarriorulatek_d_01",
     "stats": [
      40,
      49
     ],
     "boss": 2871
    }
   ],
   "bonus": {
    "arms": {
     "en": [
      "Mortal Strike and Execute damage increased by 10% and when you Slam a target, Slam also deals (100% of Attack Power) damage to enemies within 8 yds of it. Deals reduced damage beyond 5 targets.",
      "Overpower damage increased by 15%. Mortal Strike and Overpower increase the damage of your next Slam by 20%, stacking up to 5 times."
     ],
     "fr": [
      "Les dégâts de Frappe mortelle et Exécution sont augmentés de 10 %, et lorsque vous touchez une cible avec Heurtoir, Heurtoir inflige également (100% de la puissance d’attaque) points de dégâts aux adversaires à moins de 8 m de cette dernière. Dégâts réduits au-delà de 5 cibles.",
      "Les dégâts de Fulgurance sont augmentés de 15 %. Frappe mortelle et Fulgurance augmentent les dégâts de votre prochain Heurtoir de 20 %, cumulable jusqu’à 5 fois."
     ],
     "de": [
      "Schaden von 'Tödlicher Stoß' und 'Hinrichten' um 10% erhöht. Wenn Ihr 'Zerschmettern' gegen ein Ziel einsetzt, erleiden Gegner innerhalb von 8 Metern ebenfalls (100% der Angriffskraft) Schaden. Verursacht nach dem 5. Ziel weniger Schaden.",
      "Schaden von 'Überwältigen' um 15% erhöht. Der Einsatz von 'Tödlicher Stoß' oder 'Überwältigen' erhöht den Schaden Eures nächsten Einsatzes von 'Zerschmettern' um 20%. Bis zu 5-mal stapelbar."
     ],
     "es": [
      "Daño de Golpe mortal y Ejecutar aumentado un 10%. Cuando usas Embate contra un objetivo, también inflige (100% del poder de ataque) p. de daño a los enemigos en un radio de 8 m. Inflige menos daño si afecta a más de 5 objetivos.",
      "Daño de Abrumar aumentado un 15%. Golpe mortal y Abrumar aumentan un 20% el daño de tu siguiente Embate. Este efecto se acumula hasta 5 veces."
     ]
    },
    "fury": {
     "en": [
      "Raging Blow damage increased by 15%. During Recklessness Raging Blow extends the duration of Recklessness by 2 sec, up to 6 sec.",
      "Bloodthirst damage increased by 10%. During Recklessness Bloodthirst increases the critical strike bonus of Recklessness by 3%, up to 6%."
     ],
     "fr": [
      "Les dégâts de Coup déchaîné sont augmentés de 15 %. Pendant Témérité, Coup déchaîné prolonge la durée de Témérité de 2 s, jusqu’à un maximum de 6 s.",
      "Les dégâts de Sanguinaire sont augmentés de 10 %. Pendant Témérité, Sanguinaire augmente le bonus aux chances de coup critique de Témérité de 3 %, jusqu’à un maximum de 6 %."
     ],
     "de": [
      "Schaden von 'Wütender Schlag' um 15% erhöht. Während 'Tollkühnheit' aktiv ist, erhöht 'Wütender Schlag' die Dauer von 'Tollkühnheit' um 2 Sek., bis maximal 6 Sek.",
      "Schaden von 'Blutdurst' um 10% erhöht. Während 'Tollkühnheit' aktiv ist, erhöht 'Blutdurst' den Bonus auf die kritische Trefferchance von 'Tollkühnheit' um 3%, bis maximal 6%."
     ],
     "es": [
      "Daño de Arremetida enfurecida aumentado un 15%. Durante Temeridad, Arremetida enfurecida prolonga 2 s la duración de Temeridad, hasta un máximo de 6 s.",
      "Daño de Sed de sangre aumentado un 10%. Durante Temeridad, Sed de sangre aumenta un 3% el bonus de golpe crítico de Temeridad, hasta un máximo de un 6%."
     ]
    },
    "protection": {
     "en": [
      "Your free Revenges deal 15% additional damage and cause your next Shield Slam to deal 20% additional damage.",
      "Ravager and your free Revenges cause all targets to bleed for (304.7% of Attack Power) damage over 12 sec. Ravager's cooldown is reduced by 30 sec."
     ],
     "fr": [
      "Vos Revanches gratuites infligent 15 % de dégâts supplémentaires et permettent à votre prochain Heurt de bouclier d’infliger 20 % de dégâts supplémentaires.",
      "Ravageur et vos Revanches gratuites font saigner toutes les cibles qui subissent (304.7% de la puissance d’attaque) points de dégâts en 12 s. Le temps de recharge de Ravageur est réduit de 30 s."
     ],
     "de": [
      "Eure kostenlosen Einsätze von 'Rache' verursachen 15% mehr Schaden und führen dazu, dass Euer nächster Einsatz von 'Schildschlag' 20% mehr Schaden verursacht.",
      "'Verheerer' und Eure kostenlosen Einsätze von 'Rache' lassen alle Ziele bluten, wodurch sie im Verlauf von 12 Sek. (304.745% der Angriffskraft) Schaden erleiden. Abklingzeit von 'Verheerer' um 30 Sek. verringert."
     ],
     "es": [
      "Tus Revanchas gratis infligen un 15% más de daño y hacen que tu siguiente Embate con escudo inflija un 20% más de daño.",
      "Devastador y tus Revanchas gratis hacen que todos los objetivos reciban (304.7% del poder de ataque) p. de daño de sangrado durante 12 s. El tiempo de reutilización de Devastador se reduce 30 s."
     ]
    }
   }
  }
 }
};
