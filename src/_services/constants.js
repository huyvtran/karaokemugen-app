/*
 * Constants for KM (tags, langs, types, etc.).
 */

/** Regexps for validation. */
export const uuidRegexp = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
export const mediaFileRegexp = '^.+\\.(avi|mkv|mp4|webm|mov|wmv|mpg|ogg|m4a|mp3)$';
export const subFileRegexp = '^.+\\.ass$';
export const imageFileTypes = ['jpg', 'jpeg', 'png', 'gif'];

export const defaultGuestNames = [
	'Jean-Michel Normal',
	'Sakura du 93',
	'Dark Kirito 64',
	'Alex Teriyaki',
	'MC-kun',
	'Beauf-kun',
	'La Castafiore',
	'xXNarutoSasukeXx',
	'Lionel Shaoran',
	'Pico',
	'Coco',
	'Chico',
	'Dark Flame Master',
	'MAGI System',
	'MAMMUTH!',
	'NinaFMA',
	'Hokuto de Cuisine',
	'S€phir0th69',
	'Brigade SOS',
	'THE GAME',
	'Haruhi Suzumiya',
	'Char Aznable',
	'Kira "Jesus" Yamato',
	'Mahoro',
	'CLAMP Fanboy',
	'Laughing Man',
	'Anime was a mistake',
	'Dojinshi Police',
	'Norio Wakamoto',
	'Nanami Ando',
	'Ayako Suzumiya',
	'I love Emilia',
	'Keikaku-kun',
	'Random imouto',
	'Onii-chan',
	'Pedobear',
	'Le Respect',
	'Idolmaster > Love Live',
	'Love Live > Idolmaster',
	'Les yeux noisette d\'Asuna',
	'Lelouch',
	'Phantom Thieves',
	'Random Isekai MC',
	'Houonin Kyouma',
	'Miyazaki (retired)',
	'Blue Accordéon',
	'Yellow Baguette',
	'Pink A La Mode',
	'Red Fromage',
	'Black Beaujolais',
	'Silver Mousquetaire',
	'Kyonko',
	'My karaoke can\'t be this cute',
	'No bully please',
	'The guy with a white t-shirt over there',
	'David Goodenough',
	'Kiss-Shot Acerola-Orion Heart-Under-Blade',
	'BATMAN',
	'Great Mighty Poo',
	'Une simple rêveuse',
	'Kamel Deux Bâches',
	'Segata Sanshiro',
	'A mother with a braid on her shoulder',
	'El Psy Kongroo',
	'KuriGohan and Kamehameha',
	'Gihren Zabi did nothing wrong',
	'Tentacle-chan',
	'Dike Spies',
	'Sheryl > Ranka',
	'Ranka > Sheryl',
	'Urakawa Minori',
	'Tomino "Big Bald Man" Yoshiyuki',
	'Your waifu is shiiiiiiiiiit',
	'My Waifu > Your Waifu',
	'Hideaki Anno\'s depression',
	'Mon Voisin Rototo',
	'Kaaaaaneeeeedaaaaaaa',
	'Teeeeetsuuuuoooooooooo',
	'ANO NE ANO NE!',
	'Lina Inverse',
	'DIO BRANDO',
	'Goblin Slayer-kun',
	'Asuka > Rei',
	'Rei > Asuka',
	'Rin > Saber',
	'Saber > Rin',
	'Yamakan',
	'Giga Drill Breaker',
	'KIMI NO SEI',
	'Sailor Moon',
	'Ranma',
	'Goku',
	'Vegeta',
	'Gohan',
	'Yui Hirasawa',
	'Mio Akiyama',
	'Ritsu Tainaka',
	'Tsumugi Kotobuki',
	'Ui Hirasawa',
	'Azusa Nakano',
	'Bunny-girl sempai',
	'Maquia',
	'Zombie Number 0',
	'Zombie Number 1',
	'Zombie Number 2',
	'Zombie Number 3',
	'Zombie Number 4',
	'Zombie Number 5',
	'Zombie Number 6',
	'Batman Ninja',
	'Darling',
	'Yuri Katsuki',
	'Victor-kun',
	'Kumiko Ômae',
	'Silent Mobius DVD',
	'Utena',
	'Eren Jäger',
	'Mikasa Ackerman',
	'Mikasa es tu casa',
	'Armin Arlelt',
	'Livaï Ackerman',
	'Kaori Miyazono',
	'Kousei Arima',
	'Masa-san <3',
	'Hibiki Tachibana',
	'Tsubasa Kazanari',
	'Chris Yukine',
	'Mitsuha Miyamizu',
	'Taki Tachibana',
	'Rem > Ram',
	'Ram > Rem',
	'Holo',
	'Lawrence',
	'Yuki Nagato',
	'Mikuru Asahina',
	'Kyon-kun denwa',
	'Chika-Chika',
	'Giorgio Vanni <3',
	'Gungnir Datto !?',
	'Truck-kun',
	'Ore no Uta wo kike!',
	'BUT IT WAS ME, DIO!',
	'One Song Man',
	'Raphtalia > Holo'
];

export const initializationCatchphrases = [
	'"Karaoke Mugen is combat-ready!" --Nanami-chan',
	'"Karaoke Mugen, ikouzo!" --Nanami-chan',
	'"Smile! Sweet! Sister! Sadistic! Surprise! SING!" --The Karaoke Mugen Dev Team',
	'"Let us achieve world domination through karaoke!" --Axel Terizaki',
	'"Listen to my song!" --Every Macross Idol',
	'"DATABASE DATABASE WOW WOW" --MAN WITH A MISSION',
	'"Shinji, get in the f*cking karaoke room!" --Gendo Ikari',
	'"Everything is going according to the purerisuto. (Translator note : purerisuto means playlist)" --Bad Fansubs 101',
	'"Are people silent when they stop singing?" --Shirou',
	'"I am the handle of my mic. Rhythm is my body and lyrics are my blood. I have created over a thousand karaokes. Unknown to Silence, Nor known to Noise. Have withstood pain to create many Times. Yet, those hands will never hold anything. So as I sing, Unlimited Karaoke Works." --Archer',
	'"Take this microphone, mongrel, and let me judge if your voice is worth of joining that treasure of mine!" --Gilgamesh',
	'"You are already singing." --Kenshiro',
	'"Karaoke is not beautiful, and that is why it is beautiful." --Kino',
	'"Hey, want to become a karaoke maker?" --／人◕ ‿‿ ◕人＼',
	'"IT\'S JJ STYLE! --King J.J."',
	'"A microphone has no strength, unless the hand that holds it has courage --Link"',
	'"EXPLOSION!" --Megumin',
	'"I\'M A THE GREAT MAD SINGER, HOUHOUIN KYOMA !" --Okabe Rintaro',
	'"If you are not singing with you, sing with me who sings with you" --Kamina',
	'"Do you remember the number of songs you have sung in your life?" --Dio Brando',
	'"Let\'s make a strawberry parfait from this karaoke!" --Hoshimiya Ichigo',
	'"Karaoke... has changed" --Solid "Old" Snake',
	'"Karaoke Start!" --Yurippe',
	'"ALL HAIL KARAOKE MUGEN!" --Lelouch',
	'"It\'s over 9000!" --Someone in 2020 about the Karaoke Mugen database',
	'"This karaoke is corrupt!" --Il Palazzo-sama',
	'"Karaoke Mugen, launching!" --Amuro Ray',
	'"I am the man who makes the unsingable singable." --Mu la Fraga',
	'"Karaoke Mugen Standby, Ready" --Raising Heart',
	'"Not singing would tarnish the reputation of the Seto mermen!" --Sun Seto',
	'"I must not run away from karaoke" --Shinji Ikari',
	'"Karaoke is top priority!" --Mizuho Kazami',
	'"Darkness beyond twilight. Crimson beyond blood that flows. Buried in the flow of time. In thy great name, I pledge myself to darkness. Let all the fools who stand in our way be destroyed, by the power you and I possess... DRAGON SLAVE!" --Lina Inverse (after someone requested the song "Otome no Inori")',
	'"My microphone is the one that will pierce the heavens!" --Kamina',
	'"Karaoke is an insult to life itself." --Hayao Miyazaki'
];

export const karaTypes = Object.freeze({
	OP: {type: 'OP', dbType: 'TYPE_OP'},
	ED: {type: 'ED', dbType: 'TYPE_ED'},
	IN: {type: 'IN', dbType: 'TYPE_IN'},
	MV: {type: 'MV', dbType: 'TYPE_MV'},
	PV: {type: 'PV', dbType: 'TYPE_PV'},
	CM: {type: 'CM', dbType: 'TYPE_CM'},
	OT: {type: 'OT', dbType: 'TYPE_OT'},
	AMV: {type: 'AMV', dbType: 'TYPE_AMV'},
	LIVE: {type: 'LIVE', dbType: 'TYPE_LIVE'}
});

export const karaTypesArray = Object.freeze(Object.keys(karaTypes));

export const tagTypes = Object.freeze({
	singer: 2,
	songtype: 3,
	creator: 4,
	lang: 5,
	author: 6,
	misc: 7,
	songwriter: 8,
	group: 9
});

/** Map used for database generation */
export const karaTypesMap = Object.freeze(new Map([
	[karaTypes.OP.type, 'TYPE_OP,3'],
	[karaTypes.ED.type, 'TYPE_ED,3'],
	[karaTypes.IN.type, 'TYPE_IN,3'],
	[karaTypes.MV.type, 'TYPE_MV,3'],
	[karaTypes.PV.type, 'TYPE_PV,3'],
	[karaTypes.CM.type, 'TYPE_CM,3'],
	[karaTypes.OT.type, 'TYPE_OT,3'],
	[karaTypes.AMV.type, 'TYPE_AMV,3'],
	[karaTypes.LIVE.type, 'TYPE_LIVE,3'],
]));

/** Extracting type from a string */
export function getType(types) {
	return types.split(/\s+/).find(t => karaTypesArray.includes(t));
}

export const tags = [
	'3DS',
	'ANIME',
	'CREDITLESS',
	'COVER',
	'DRAMA',
	'DREAMCAST',
	'DUO',
	'DS',
	'GAMECUBE',
	'HUMOR',
	'IDOL',
	'HARDMODE',
	'LONG',
	'MAGICALGIRL',
	'MECHA',
	'MOBAGE',
	'MOVIE',
	'OVA',
	'ONA',
	'PARODY',
	'PC',
	'PS2',
	'PS3',
	'PS4',
	'PSP',
	'PSV',
	'PSX',
	'R18',
	'REAL',
	'REMIX',
	'SATURN',
	'SEGACD',
	'SHOUJO',
	'SHOUNEN',
	'SOUNDONLY',
	'SPECIAL',
	'SPOIL',
	'SWITCH',
	'TOKU',
	'TVSHOW',
	'VIDEOGAME',
	'VN',
	'VOCALOID',
	'WII',
	'WIIU',
	'YAOI',
	'YURI',
	'XBOX360',
	'XBOXONE'
];