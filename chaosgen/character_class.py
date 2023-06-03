"""
Attributes and general information about the C&C Character Classes.
"""
import random
import chaosgen.dice as d

# The 3 attributes, in order.
ATTRIBUTES = ["STR", "DEX", "WIL"]

# Indexes into ATTRIBUTES
STR, DEX, WIL = range(3)

# The character classes

PATHFINDER = {
    "Roadwarden": {
        "archetype": "Pathfinder",
        "equipment": [
            "Polearm - d10 dmg, two hands, 3 slots",
            "------",
            "------",
            "Crossbow - d8 dmg, two hands, 3 slots",
            "------",
            "------",
            "Ammo",
        ],
        "retainer": None,
        "mount": {
            "name": "Riding Horse",
            "HD": 2,
            "Skill": 8,
            "ML": 7,
            "Slots": "5/15",
            "equipment": [
                "Small tent & cooking gear",
                "Writ that shows your powers and legal rights.",
            ],
        },
    },
    "Ranger": {
        "archetype": "Pathfinder",
        "equipment": [
            "Longbow - d8 dmg, two hands, 3 slots",
            "------",
            "------",
            "Ammo",
            "Sword - d8 dmg, 2 slots",
            "------",
            "------",
            "Trap - d6 dmg, on failed STR save stuck",
        ],
        "retainer": None,
        "mount": None,
    },
    "Bounty Hunter": {
        "archetype": "Pathfinder",
        "equipment": [
            "Pistol - d10 dmg, round to reload, loud, 2 slots",
            "------",
            "Ammo",
            "Sturdy Rope",
            "Manacles",
            f"{d.xdy(1, 3)} wanted posters",
        ],
        "retainer": None,
        "mount": None,
    },
    "Outlaw": {
        "archetype": "Pathfinder",
        "equipment": [
            random.choice(["Hooded Cloak", "Hat and Mask"]),
            "Shortbow - d6 dmg, two hands, 2 slots",
            "------",
            "Ammo",
        ],
        "retainer": None,
        "mount": None,
    },
}

FIGHTER = {
    "Soldier": {
        "archetype": "Fighter",
        "equipment": [
            "Suit of Mail - 2 Armor, 2 slots",
            "------",
            "Arming Sword - d8 dmg, 2 slots",
            "------",
            "Emblazoned Shield - can sunder to negate a hit",
        ],
        "retainer": None,
        "mount": None,
    },
    "Knight": {
        "archetype": "Fighter",
        "equipment": [
            "Heavy Plate Armor - 3 Armor, 3 slots",
            "------",
            "------",
            "Longsword - d10 dmg, two hands, 3 slots",
            "------",
            "------",
        ],
        "retainer": {
            "name": "Squire",
            "HD": 1,
            "Skill": 7,
            "ML": 9,
            "equipment": [
                "Spear - d6 dmg",
            ],
        },
        "mount": {
            "name": "War Horse",
            "HD": 3,
            "Skill": 9,
            "ML": 9,
            "Slots": "5/15",
            "equipment": None,
        },
    },
    "Duelist": {
        "archetype": "Fighter",
        "equipment": [
            random.choice(
                [
                    [
                        "Rapier - d8 dmg, 2 slots",
                        "------",
                    ],
                    [
                        "Pistol - d10 dmg, round to reload, loud, 2 slots",
                        "------",
                        "Ammo",
                    ],
                ]
            ),
            "Light armor - 1 Armor",
        ],
        "retainer": None,
        "mount": None,
    },
    "Slayer": {
        "archetype": "Fighter",
        "equipment": [
            "Kickass hat - 1 Armor",
            random.choice(
                ["String of Garlic", "Holy Water - undead take d8 dmg if doused in it"]
            ),
            random.choice(["Silver Knife - d6 dmg", "Stake of Hawthorn Wood"]),
        ],
        "retainer": None,
        "mount": None,
    },
}

CLERIC = {
    "Exorcist": {
        "archetype": "Cleric",
        "equipment": [
            "Necklace of Beads",
            "Holy Water - undead take d8 dmg if doused in it",
            "Scroll of Bless",
        ],
        "retainer": None,
        "mount": None,
    },
    "Warpriest": {
        "archetype": "Cleric",
        "equipment": [
            "Brigandine - 2 Armor, 2 slots",
            "------",
            "Warhammer - d10 dmg, two hands, 3 slots",
            "------",
            "------",
            "Scroll of Heal",
            "Holy Symbol",
        ],
        "retainer": None,
        "mount": None,
    },
    "Initiate": {
        "archetype": "Cleric",
        "equipment": [
            "Raiment of your Order - 1 Armor",
            "Book of Hymns or Prayers or Theology",
            "Bottle of Fine Trappist Beer",
        ],
        "retainer": None,
        "mount": None,
    },
    "Charlatan": {
        "archetype": "Cleric",
        "equipment": [
            "Tools for Divination",
            "Vials of Sugar Water",
            "Pack of Cards",
            f"{d.xdy(1, 6)} Counterfeit Silver Coins",
            "Club - d6 dmg",
        ],
        "retainer": None,
        "mount": None,
    },
}

MAGICUSER = {
    "Wizard's Apprentice": {
        "archetype": "Magic-User",
        "equipment": [
            "A Cloak with Magical Emblems so You Look the Part",
            "Staff - d6 dmg",
            "Books on Magical Theory",
            "Grimoire - 2 slots",
            "------",
        ],
        "retainer": None,
        "mount": None,
        "spells": True,
    },
    "Warlock": {
        "archetype": "Magic-User",
        "equipment": [
            "Eyes that Glow an Unnatural Color and Grant Night Vision",
            "Skull of a Demon",
            "Grimoire - 2 slots",
            "------",
        ],
        "retainer": None,
        "mount": None,
        "spells": True,
    },
    "Alchemist": {
        "archetype": "Magic-User",
        "equipment": [
            "Small Chest Containing Alchemy Equipment",
            "Tonic of Health - Heals d12 dmg and any affliction",
            "Grimoire - 2 slots",
            "------",
        ],
        "retainer": None,
        "mount": None,
        "spells": True,
    },
    "Witch": {
        "archetype": "Magic-User",
        "equipment": [
            "Candles, Herbs, Chalk, Needles",
            "Grimoire - 2 slots",
            "------",
        ],
        "retainer": {
            "name": "Animal Familiar",
            "HD": 1,
            "Skill": 6,
            "ML": 7,
            "equipment": [],
        },
        "mount": None,
        "spells": True,
    },
}

THIEF = {
    "Rat Catcher": {
        "archetype": "Thief",
        "equipment": [
            "A staff adorned with dead rats, the mark of your trade - d6 dmg",
            "Flute",
        ],
        "retainer": {
            "name": "Dinky & Ferocious Dog",
            "HD": 1,
            "Skill": 6,
            "ML": 8,
            "equipment": [
                "Bite - d6 dmg",
            ],
        },
        "mount": None,
    },
    "Beggar": {
        "archetype": "Thief",
        "equipment": [
            random.choice(["Tin Bowl", "Tin Cup"]),
            "Ragged Clothes",
            "Club - d6 dmg",
        ],
        "retainer": None,
        "mount": None,
    },
    "Grave Robber": {
        "archetype": "Thief",
        "equipment": [
            "Hooded Cloak",
            "Spade",
            "Crowbar",
            "Oversized Sack",
        ],
        "retainer": None,
        "mount": None,
    },
    "Burglar": {
        "archetype": "Thief",
        "equipment": [
            "Set of Lock-Picks",
            "Soft Shoes",
            "Hooded Cloak",
        ],
        "retainer": None,
        "mount": None,
    },
}


SPELLS = [
    "Animate Dead",
    "Arcane Eye",
    "Auditory Illusion",
    "Be Understood",
    "Beast Form",
    "Bless",
    "Bolt",
    "Charm",
    "Clairvoyance",
    "Command",
    "Control Weather",
    "Create Pit",
    "Darkness",
    "Detect Magic",
    "Earthquake",
    "Fear",
    "Fireball",
    "Freezing Touch",
    "Grease",
    "Greed",
    "Grow",
    "Haste",
    "Heal",
    "Invisibility",
    "Leap",
    "Light",
    "Magic Rope",
    "Miniaturize",
    "Mirror Image",
    "Pacify",
    "Read Mind",
    "Shield",
    "Sleep",
    "Spiritual Weapon",
    "Ward",
    "Web",
]

APPEARANCE = [
    ["Male", "Female"],
    ["Youth", "Adult", "Mature", "Old", "Decrepit"],
    [
        "Messy Clothing",
        "Scant Clothing",
        "Immaculate Clothing",
        "Formal Attire",
        "Threadbare Clothing",
        "Elaborate Attire",
        "Drab Clothing",
        "in Uniform",
    ],
    ["Obese", "Scrawny", "Muscular", "Bald", "Hairy", "Tall", "Short", "Ugly"],
]


PERSONALITY = [
    "Accusative",
    "Active",
    "Adventurous",
    "Affable",
    "Aggressive",
    "Agreeable",
    "Aimless",
    "Aloof",
    "Altruistic",
    "Analytical",
    "Angry",
    "Animated",
    "Annoying",
    "Anxious",
    "Apathetic",
    "Apologetic",
    "Apprehensive",
    "Argumentative",
    "Arrogant",
    "Articulate",
    "Attentive",
    "Bigoted",
    "Bitter",
    "Blustering",
    "Boastful",
    "Bookish",
    "Bossy",
    "Braggart",
    "Brash",
    "Brave",
    "Bullying",
    "Callous",
    "Calm",
    "Candid",
    "Cantankerous",
    "Capricious",
    "Careful",
    "Careless",
    "Caring",
    "Casual",
    "Catty",
    "Cautious",
    "Cavalier",
    "Charming",
    "Chaste",
    "Chauvinistic",
    "Cheeky",
    "Cheerful",
    "Childish",
    "Chivalrous",
    "Clueless",
    "Clumsy",
    "Cocky",
    "Comforting",
    "Communicative",
    "Complacent",
    "Condescending",
    "Confident",
    "Conformist",
    "Confused",
    "Conscientious",
    "Conservative",
    "Contentious",
    "Contrary",
    "Contumely",
    "Conventional",
    "Cooperative",
    "Courageous",
    "Courteous",
    "Cowardly",
    "Coy",
    "Crabby",
    "Cranky",
    "Critical",
    "Cruel",
    "Cultured",
    "Curious",
    "Cynical",
    "Daring",
    "Deceitful",
    "Deceptive",
    "Defensive",
    "Defiant",
    "Deliberate",
    "Deluded",
    "Depraved",
    "Discreet",
    "Discreet",
    "Dishonest",
    "Disingenuous",
    "Disloyal",
    "Disrespectful",
    "Distant",
    "Distracted",
    "Distraught",
    "Docile",
    "Doleful",
    "Dominating",
    "Dramatic",
    "Drunkard",
    "Dull",
    "Earthy",
    "Eccentric",
    "Elitist",
    "Emotional",
    "Energetic",
    "Enigmatic",
    "Enthusiastic",
    "Epicurean",
    "Excited",
    "Expressive",
    "Extroverted",
    "Faithful",
    "Fanatical",
    "Fastidious",
    "Fatalistic",
    "Fearful",
    "Fearless",
    "Feral",
    "Fierce",
    "Feisty",
    "Flamboyant",
    "Flippant",
    "Flirtatious",
    "Foolhardy",
    "Foppish",
    "Forgiving",
    "Friendly",
    "Frightened",
    "Frivolous",
    "Frustrated",
    "Funny",
    "Furtive",
    "Generous",
    "Genial",
    "Gentle",
    "Gloomy",
    "Goofy",
    "Gossip",
    "Graceful",
    "Gracious",
    "Grave",
    "Gregarious",
    "Grouchy",
    "Groveling",
    "Gruff",
    "Gullible",
    "Happy",
    "Harsh",
    "Hateful",
    "Helpful",
    "Honest",
    "Hopeful",
    "Hostile",
    "Humble",
    "Humorless",
    "Humorous",
    "Idealistic",
    "Idiosyncratic",
    "Imaginative",
    "Imitative",
    "Impatient",
    "Impetuous",
    "Implacable",
    "Impractical",
    "Impulsive",
    "Inattentive",
    "Incoherent",
    "Indifferent",
    "Indiscreet",
    "Individualist",
    "Indolent",
    "Indomitable",
    "Industrious",
    "Inexorable",
    "Inexpressive",
    "Insecure",
    "Insensitive",
    "Instructive",
    "Intolerant",
    "Intransigent",
    "Introverted",
    "Irreligious",
    "Irresponsible",
    "Irreverent",
    "Irritable",
    "Jealous",
    "Jocular",
    "Joking",
    "Jolly",
    "Joyous",
    "Judgmental",
    "Jumpy",
    "Kind",
    "Know-it-all",
    "Languid",
    "Lazy",
    "Lethargic",
    "Lewd",
    "Liar",
    "Likable",
    "Lippy",
    "Listless",
    "Loquacious",
    "Loving",
    "Loyal",
    "Lust",
    "Madcap",
    "Magnanimous",
    "Malicious",
    "Maudlin",
    "Mean",
    "Meddlesome",
    "Melancholy",
    "Melodramatic",
    "Merciless",
    "Merry",
    "Meticulous",
    "Mischievous",
    "Miscreant",
    "Miserly",
    "Modest",
    "Moody",
    "Moralistic",
    "Morbid",
    "Morose",
    "Mournful",
    "Mousy",
    "Mouthy",
    "Mysterious",
    "Naive",
    "Narrow-minded",
    "Needy",
    "Nefarious",
    "Nervous",
    "Nettlesome",
    "Neurotic",
    "Noble",
    "Nonchalant",
    "Nurturing",
    "Obdurate",
    "Obedient",
    "Oblivious",
    "Obnoxious",
    "Obsequious",
    "Obsessive",
    "Obstinate",
    "Obtuse",
    "Odd",
    "Ornery",
    "Optimistic",
    "Organized",
    "Ostentatious",
    "Outgoing",
    "Overbearing",
    "Paranoid",
    "Passionate",
    "Pathological",
    "Patient",
    "Peaceful",
    "Pensive",
    "Pertinacious",
    "Pessimistic",
    "Philanderer",
    "Philosophical",
    "Phony",
    "Pious",
    "Playful",
    "Pleasant",
    "Poised",
    "Polite",
    "Pompous",
    "Pondering",
    "Pontificating",
    "Practical",
    "Prejudiced",
    "Pretentious",
    "Preoccupied",
    "Promiscuous",
    "Proper",
    "Proselytizing",
    "Proud",
    "Prudent",
    "Prudish",
    "Prying",
    "Puerile",
    "Pugnacious",
    "Quiet",
    "Quirky",
    "Racist",
    "Rascal",
    "Rash",
    "Realistic",
    "Rebellious",
    "Reckless",
    "Refined",
    "Repellent",
    "Reserved",
    "Respectful",
    "Responsible",
    "Restless",
    "Reticent",
    "Reverent",
    "Rigid",
    "Risk-taking",
    "Rude",
    "Sadistic",
    "Sarcastic",
    "Sardonic",
    "Sassy",
    "Savage",
    "Scared",
    "Scolding",
    "Secretive",
    "Self-effacing",
    "Selfish",
    "Selfless",
    "Senile",
    "Sensible",
    "Sensitive",
    "Sensual",
    "Sentimental",
    "Serene",
    "Serious",
    "Servile",
    "Sexist",
    "Sexual",
    "Shallow",
    "Shameful",
    "Shameless",
    "Shifty",
    "Shrewd",
    "Shy",
    "Sincere",
    "Slanderous",
    "Sly",
    "Smug",
    "Snobbish",
    "Sober",
    "Sociable",
    "Solemn",
    "Solicitous",
    "Solitary",
    "Solitary",
    "Sophisticated",
    "Spendthrift",
    "Spiteful",
    "Stern",
    "Stingy",
    "Stoic",
    "Stubborn",
    "Submissive",
    "Sultry",
    "Superstitious",
    "Surly",
    "Suspicious",
    "Sybarite",
    "Sycophantic",
    "Sympathetic",
    "Taciturn",
    "Tactful",
    "Tawdry",
    "Teetotaler",
    "Temperamental",
    "Tempestuous",
    "Thorough",
    "Thrifty",
    "Timid",
    "Tolerant",
    "Transparent",
    "Treacherous",
    "Troublemaker",
    "Trusting",
    "Truthful",
    "Uncommitted",
    "Understanding",
    "Unfriendly",
    "Unhinged",
    "Uninhibited",
    "Unpredictable",
    "Unruly",
    "Unsupportive",
    "Vague",
    "Vain",
    "Vapid",
    "Vengeful",
    "Vigilant",
    "Violent",
    "Vivacious",
    "Vulgar",
    "Wanton",
    "Wasteful",
    "Weary",
    "Whimsical",
    "Whiny",
    "Wicked",
    "Wisecracking",
    "Wistful",
    "Witty",
    "Zealous",
]


NAMES = {
    "Human": {
        "Male": [
            "Anlow",
            "Arando",
            "Bram",
            "Cale",
            "Dalkon",
            "Daylen",
            "Dodd",
            "Dungarth",
            "Dyrk",
            "Eandro",
            "Falken",
            "Feck",
            "Fenton",
            "Gryphero",
            "Hagar",
            "Jeras",
            "Krynt",
            "Lavant",
            "Leyten",
            "Madian",
            "Malfier",
            "Markus",
            "Meklan",
            "Namen",
            "Navaren",
            "Nerle",
            "Nilus",
            "Ningyan",
            "Norris",
            "Quentin",
            "Semil",
            "Sevenson",
            "Steveren",
            "Talfen",
            "Tamond",
            "Taran",
            "Tavon",
            "Tegan",
            "Vanan",
            "Vincent",
        ],
        "Female": [
            "Azura",
            "Anya",
            "Brey",
            "Hallan",
            "Kasaki",
            "Lorelei",
            "Mirabel",
            "Pharana",
            "Remora",
            "Rosalyn",
            "Sachil",
            "Saidi",
            "Tanika",
            "Tura",
            "Tylsa",
            "Vencia",
            "Xandrilla",
        ],
        "Last": [
            "Arkalis",
            "Armanci",
            "Bilger",
            "Blackstrand",
            "Brightwater",
            "Carnavon",
            "Caskajaro",
            "Coldshore",
            "Coyle",
            "Cresthill",
            "Cuttlescar",
            "Daargen",
            "Dalicarlia",
            "Danamark",
            "Donoghan",
            "Drumwind",
            "Dunhall",
            "Ereghast",
            "Falck",
            "Fallenbridge",
            "Faringray",
            "Fletcher",
            "Fryft",
            "Goldrudder",
            "Grantham",
            "Graylock",
            "Gullscream",
            "Hindergrass",
            "Iscalon",
            "Kreel",
            "Kroft",
            "Lamoth",
            "Leerstrom",
            "Lynchfield",
            "Moonridge",
            "Netheridge",
            "Oakenheart",
            "Pyncion",
            "Ratley",
            "Redraven",
            "Revenmar",
            "Roxley",
            "Sell",
            "Seratolva",
            "Shanks",
            "Shattermast",
            "Shaulfer",
            "Silvergraft",
            "Stavenger",
            "Stormchapel",
            "Strong",
            "Swiller",
            "Talandro",
            "Targana",
            "Towerfall",
            "Umbermoor",
            "Van Devries",
            "Van Gandt",
            "Van Hyden",
            "Varcona",
            "Varzand",
            "Voortham",
            "Vrye",
            "Webb",
            "Welfer",
            "Wilxes",
            "Wintermere",
            "Wygarthe",
            "Zatchet",
            "Zethergyll",
        ],
    }
}

ARCHETYPE_DESCRIPTIONS = {
    "Pathfinder": "A Pathfinder is considered skilled at tasks related to surviving in the world, or navigation. "
    "Gain a Buff on relevant saves.",
    "Fighter": "A Fighter is considered skilled at all tasks related to endurance, fighting, and combat. "
    "Gain a Buff on relevant saves.",
    "Cleric": "A Cleric is considered skilled at tasks related to religious activities, or church. "
    "Gain a Buff on relevant saves.",
    "Magic-User": "A Magic-User is considered skilled at all tasks pertaining to magic, and arcane lore. "
    "Gain a Buff on relevant saves.",
    "Thief": "A Thief is considered skilled at all tasks pertaining to thievery, such as stealth, pick-pocketing, "
    "lock-picking, and so on. Gain a Buff on relevant saves.",
}

ARCHETYPES = [PATHFINDER, FIGHTER, CLERIC, MAGICUSER, THIEF]
VALID_BACKGROUND_NAMES = [
    background.lower().replace("'", "") for a in ARCHETYPES for background in a
]
ALL_BACKGROUNDS = []
for a in ARCHETYPES:
    for background, v in a.items():
        ALL_BACKGROUNDS.append(v)

BACKGROUND_BY_NAME = dict(zip(VALID_BACKGROUND_NAMES, ALL_BACKGROUNDS))
