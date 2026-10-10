'use strict';
// Generado por tools/build-bosses.mjs (se actualiza en vivo desde Raidbots cuando hay conexión)
const BOSSES_SNAPSHOT = {
 "season": "Midnight Season 2",
 "groups": [
  {
   "id": 1320,
   "name": "The Venomous Abyss",
   "bosses": [
    {
     "id": 2888,
     "name": "Nek'zali the Soulcoiler",
     "order": 1
    },
    {
     "id": 2874,
     "name": "Entombed Sentinels",
     "order": 2
    },
    {
     "id": 2894,
     "name": "The Lost Explorers",
     "order": 3
    },
    {
     "id": 2882,
     "name": "Vashnik the Malignant",
     "order": 4
    },
    {
     "id": 2871,
     "name": "Sszorak",
     "order": 5
    },
    {
     "id": 2887,
     "name": "The Twin Fangs",
     "order": 6
    },
    {
     "id": 2883,
     "name": "The Coiled Altar",
     "order": 7
    },
    {
     "id": 2895,
     "name": "Ula'tek",
     "order": 8
    }
   ]
  },
  {
   "id": 1317,
   "name": "The Tidebound Grotto",
   "bosses": [
    {
     "id": 2849,
     "name": "Nymrissa Wavecaller",
     "order": 0
    }
   ]
  }
 ],
 "names": {
  "1030": "Temple of Sethraliss",
  "1041": "Kings' Rest",
  "1202": "Ruby Life Pools",
  "1299": "Windrunner Spire",
  "1300": "Magisters' Terrace",
  "1304": "Murder Row",
  "1309": "The Blinding Vale",
  "1311": "Den of Nalorakk",
  "1313": "Voidscar Arena",
  "1315": "Maisara Caverns",
  "1316": "Nexus-Point Xenas",
  "1322": "Altar of Fangs",
  "2142": "Adderis and Aspix",
  "2143": "Merektha",
  "2144": "Galvazzt",
  "2145": "Avatar of Sethraliss",
  "2165": "The Golden Serpent",
  "2170": "The Council of Tribes",
  "2171": "Mchimba the Embalmer",
  "2172": "Dazar, The First King",
  "2485": "Kokia Blazehoof",
  "2488": "Melidrussa Chillworn",
  "2503": "Kyrakka and Erkhart Stormvein",
  "2655": "Emberdawn",
  "2656": "Derelict Duo",
  "2657": "Commander Kroluk",
  "2658": "The Restless Heart",
  "2659": "Arcanotron Custos",
  "2660": "Gemellus",
  "2661": "Seranel Sunlash",
  "2662": "Degentrius",
  "2679": "Kystia Manaheart",
  "2680": "Zaen Bladesorrow",
  "2681": "Xathuux the Annihilator",
  "2682": "Lithiel Cinderfury",
  "2711": "Rotmire",
  "2733": "Imperator Averzian",
  "2734": "Vorasius",
  "2735": "Vaelgor & Ezzorak",
  "2736": "Fallen-King Salhadaar",
  "2737": "Lightblinded Vanguard",
  "2738": "Crown of the Cosmos",
  "2739": "Belo'ren, Child of Al'ar",
  "2740": "Midnight Falls",
  "2769": "Lightblossom Trinity",
  "2770": "Ikuzz the Light Hunter",
  "2771": "Lightwarden Ruia",
  "2772": "Ziekket",
  "2776": "The Hoardmonger",
  "2777": "Sentinel of Winter",
  "2778": "Nalorakk",
  "2782": "Cragpine",
  "2791": "Taz'Rah",
  "2792": "Atroxus",
  "2793": "Charonus",
  "2795": "Chimaerus the Undreamt God",
  "2810": "Muro'jin and Nekraxx",
  "2811": "Vordaza",
  "2812": "Rak'tul, Vessel of Souls",
  "2813": "Chief Corewright Kasreth",
  "2814": "Corewarden Nysarra",
  "2815": "Lothraxion",
  "2827": "Lu'ashal",
  "2828": "Predaxas",
  "2829": "Thorm'belan",
  "2849": "Nymrissa Wavecaller",
  "2871": "Sszorak",
  "2874": "Entombed Sentinels",
  "2878": "Rav'i",
  "2879": "The Writhing Coil",
  "2880": "Zul'jan",
  "2882": "Vashnik the Malignant",
  "2883": "The Coiled Altar",
  "2887": "The Twin Fangs",
  "2888": "Nek'zali the Soulcoiler",
  "2894": "The Lost Explorers",
  "2895": "Ula'tek",
  "-43": "Alchemy",
  "-33": "Blacksmithing",
  "-34": "Enchanting",
  "-35": "Engineering",
  "-36": "Inscription",
  "-37": "Jewelcrafting",
  "-38": "Leatherworking",
  "-39": "Tailoring",
  "-87": "Catalyst - Midnight Season 1",
  "-100": "Catalyst - Midnight Season 2",
  "-84": "PVP Season 1 (Honor)",
  "-86": "PVP Season 1 (Bloody Tokens)",
  "-85": "PVP Season 1 (Conquest)",
  "-94": "PVP Season 2 (Honor)",
  "-96": "PVP Season 2 (Bloody Tokens)",
  "-95": "PVP Season 2 (Conquest)",
  "-93": "Prey Season 1",
  "-92": "Delves Season 1",
  "-99": "Prey Season 2",
  "-98": "Delves Season 2",
  "-97": "Trash Drop"
 },
 "inst": {
  "1030": {
   "n": "Temple of Sethraliss",
   "t": "dungeon"
  },
  "1041": {
   "n": "Kings' Rest",
   "t": "dungeon"
  },
  "1202": {
   "n": "Ruby Life Pools",
   "t": "dungeon"
  },
  "1299": {
   "n": "Windrunner Spire",
   "t": "dungeon"
  },
  "1300": {
   "n": "Magisters' Terrace",
   "t": "dungeon"
  },
  "1304": {
   "n": "Murder Row",
   "t": "dungeon"
  },
  "1305": {
   "n": "Sporefall",
   "t": "raid"
  },
  "1307": {
   "n": "The Voidspire",
   "t": "raid"
  },
  "1308": {
   "n": "March on Quel'Danas",
   "t": "raid"
  },
  "1309": {
   "n": "The Blinding Vale",
   "t": "dungeon"
  },
  "1311": {
   "n": "Den of Nalorakk",
   "t": "dungeon"
  },
  "1312": {
   "n": "World Bosses",
   "t": "raid"
  },
  "1313": {
   "n": "Voidscar Arena",
   "t": "dungeon"
  },
  "1314": {
   "n": "The Dreamrift",
   "t": "raid"
  },
  "1315": {
   "n": "Maisara Caverns",
   "t": "dungeon"
  },
  "1316": {
   "n": "Nexus-Point Xenas",
   "t": "dungeon"
  },
  "1317": {
   "n": "The Tidebound Grotto",
   "t": "raid"
  },
  "1320": {
   "n": "The Venomous Abyss",
   "t": "raid"
  },
  "1322": {
   "n": "Altar of Fangs",
   "t": "dungeon"
  },
  "-32": {
   "n": "Normal Dungeons",
   "t": "expansion-dungeon"
  },
  "-1": {
   "n": "Mythic+ Dungeons",
   "t": "mplus-chest"
  },
  "-90": {
   "n": "PVP Profession Items",
   "t": "professionMidnightPvp"
  },
  "-89": {
   "n": "Rare Profession Items",
   "t": "professionMidnightRare"
  },
  "-88": {
   "n": "Epic Profession Items",
   "t": "professionMidnightEpic"
  },
  "-87": {
   "n": "Catalyst Season 1",
   "t": "catalyst"
  },
  "-100": {
   "n": "Catalyst Season 2",
   "t": "catalyst"
  },
  "-84": {
   "n": "PVP Season 1 (Honor)",
   "t": "pvp-honor"
  },
  "-86": {
   "n": "PVP Season 1 (Bloody Tokens)",
   "t": "pvp-world"
  },
  "-85": {
   "n": "PVP Season 1 (Conquest)",
   "t": "pvp-conquest"
  },
  "-94": {
   "n": "PVP Season 2 (Honor)",
   "t": "pvp-honor"
  },
  "-96": {
   "n": "PVP Season 2 (Bloody Tokens)",
   "t": "pvp-world"
  },
  "-95": {
   "n": "PVP Season 2 (Conquest)",
   "t": "pvp-conquest"
  },
  "-93": {
   "n": "Prey Season 1",
   "t": "prey-mid1"
  },
  "-92": {
   "n": "Delves Season 1",
   "t": "delve-mid1"
  },
  "-99": {
   "n": "Prey Season 2",
   "t": "prey-mid2"
  },
  "-98": {
   "n": "Delves Season 2",
   "t": "delve-mid2"
  },
  "-91": {
   "n": "Season 1 Raids",
   "t": "raid"
  },
  "-102": {
   "n": "Season 2 Raids",
   "t": "raid"
  },
  "-101": {
   "n": "Bonus Rolls",
   "t": "bonus-roll"
  }
 }
};
