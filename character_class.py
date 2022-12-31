"""
Attributes and general information about the A&A Character Classes.
"""

# The 3 attributes, in order.
ATTRIBUTES = ['STR', 'DEX', 'WIL']

# Indexes into ATTRIBUTES
STR, DEX, WIL = range(3)

# The character classes

PATHFINDER = {
    "Road Warden" : {
        "equipment" : [
            "Polearm - d10 dmg, two hands",
            "Polearm - d10 dmg, two hands",
            "Polearm - d10 dmg, two hands",
            "Crossbow - d8 dmg, two hands",
            "Crossbow - d8 dmg, two hands",
            "Crossbow - d8 dmg, two hands",
            "Ammo",
            "Small tent & cooking gear",
        ],
        "retainers" : {},
        "mount" : {
            "name" : "Riding Horse",
            "HD" : 2,
            "Skill" : 8,
            "ML" : 7,
            "Slots" : "5/15",
        },
    },
    "Ranger" : {
        "equipment" : [

        ],
        "retainers" : None,
        "mount" : None,
    },
    "Bounty Hunter" : {
        "equipment" : [

        ],
        "retainers" : None,
        "mount" : None,
    },
    "Outlaw" : {
        "equipment" : [

        ],
        "retainers" : None,
        "mount" : None,
    },
}

CLERIC = {
    
}

FIGHTER = {
    
}

MAGICUSER = {
    
}

THIEF = {
    
}


APPEARANCE = [
    ['Male', 'Female'],
    ['Youth', 'Adult', 'Mature', 'Old', 'Decrepit'],
    ['Messy Clothing', 'Scant Clothing', 'Immaculate Clothing',
    'Formal Attire', 'Threadbare Clothing', 'Elaborate Attire', 'Drab Clothing',
    'in Uniform'],
    ['Missing Limb', 'Obese', 'Scrawny', 'Muscular', 'Bald', 'Hairy', 'Tall',
    'Short', 'Ugly']
]


PERSONALITY = [
    'Accusative', 'Active', 'Adventurous', 'Affable', 'Aggressive',
    'Agreeable', 'Aimless', 'Aloof', 'Altruistic', 'Analytical', 'Angry',
    'Animated', 'Annoying', 'Anxious', 'Apathetic', 'Apologetic',
    'Apprehensive', 'Argumentative', 'Arrogant', 'Articulate', 'Attentive',
    'Bigoted', 'Bitter', 'Blustering', 'Boastful', 'Bookish', 'Bossy',
    'Braggart', 'Brash', 'Brave', 'Bullying', 'Callous', 'Calm', 'Candid',
    'Cantankerous', 'Capricious', 'Careful', 'Careless', 'Caring', 'Casual',
    'Catty', 'Cautious', 'Cavalier', 'Charming', 'Chaste', 'Chauvinistic',
    'Cheeky', 'Cheerful', 'Childish', 'Chivalrous', 'Clueless', 'Clumsy',
    'Cocky', 'Comforting', 'Communicative', 'Complacent', 'Condescending',
    'Confident', 'Conformist', 'Confused', 'Conscientious', 'Conservative',
    'Contentious', 'Contrary', 'Contumely', 'Conventional', 'Cooperative',
    'Courageous', 'Courteous', 'Cowardly', 'Coy', 'Crabby', 'Cranky',
    'Critical', 'Cruel', 'Cultured', 'Curious', 'Cynical', 'Daring',
    'Deceitful', 'Deceptive', 'Defensive', 'Defiant', 'Deliberate', 'Deluded',
    'Depraved', 'Discreet', 'Discreet', 'Dishonest', 'Disingenuous',
    'Disloyal', 'Disrespectful', 'Distant', 'Distracted', 'Distraught',
    'Docile', 'Doleful', 'Dominating', 'Dramatic', 'Drunkard', 'Dull',
    'Earthy', 'Eccentric', 'Elitist', 'Emotional', 'Energetic', 'Enigmatic',
    'Enthusiastic', 'Epicurean', 'Excited', 'Expressive', 'Extroverted',
    'Faithful', 'Fanatical', 'Fastidious', 'Fatalistic', 'Fearful', 'Fearless',
    'Feral', 'Fierce', 'Feisty', 'Flamboyant', 'Flippant', 'Flirtatious',
    'Foolhardy', 'Foppish', 'Forgiving', 'Friendly', 'Frightened', 'Frivolous',
    'Frustrated', 'Funny', 'Furtive', 'Generous', 'Genial', 'Gentle', 'Gloomy',
    'Goofy', 'Gossip', 'Graceful', 'Gracious', 'Grave', 'Gregarious',
    'Grouchy', 'Groveling', 'Gruff', 'Gullible', 'Happy', 'Harsh', 'Hateful',
    'Helpful', 'Honest', 'Hopeful', 'Hostile', 'Humble', 'Humorless',
    'Humorous', 'Idealistic', 'Idiosyncratic', 'Imaginative', 'Imitative',
    'Impatient', 'Impetuous', 'Implacable', 'Impractical', 'Impulsive',
    'Inattentive', 'Incoherent', 'Indifferent', 'Indiscreet', 'Individualist',
    'Indolent', 'Indomitable', 'Industrious', 'Inexorable', 'Inexpressive',
    'Insecure', 'Insensitive', 'Instructive', 'Intolerant', 'Intransigent',
    'Introverted', 'Irreligious', 'Irresponsible', 'Irreverent', 'Irritable',
    'Jealous', 'Jocular', 'Joking', 'Jolly', 'Joyous', 'Judgmental', 'Jumpy',
    'Kind', 'Know-it-all', 'Languid', 'Lazy', 'Lethargic', 'Lewd', 'Liar',
    'Likable', 'Lippy', 'Listless', 'Loquacious', 'Loving', 'Loyal', 'Lust',
    'Madcap', 'Magnanimous', 'Malicious', 'Maudlin', 'Mean', 'Meddlesome',
    'Melancholy', 'Melodramatic', 'Merciless', 'Merry', 'Meticulous',
    'Mischievous', 'Miscreant', 'Miserly', 'Modest', 'Moody', 'Moralistic',
    'Morbid', 'Morose', 'Mournful', 'Mousy', 'Mouthy', 'Mysterious', 'Naive',
    'Narrow-minded', 'Needy', 'Nefarious', 'Nervous', 'Nettlesome', 'Neurotic',
    'Noble', 'Nonchalant', 'Nurturing', 'Obdurate', 'Obedient', 'Oblivious',
    'Obnoxious', 'Obsequious', 'Obsessive', 'Obstinate', 'Obtuse', 'Odd',
    'Ornery', 'Optimistic', 'Organized', 'Ostentatious', 'Outgoing',
    'Overbearing', 'Paranoid', 'Passionate', 'Pathological', 'Patient',
    'Peaceful', 'Pensive', 'Pertinacious', 'Pessimistic', 'Philanderer',
    'Philosophical', 'Phony', 'Pious', 'Playful', 'Pleasant', 'Poised',
    'Polite', 'Pompous', 'Pondering', 'Pontificating', 'Practical',
    'Prejudiced', 'Pretentious', 'Preoccupied', 'Promiscuous', 'Proper',
    'Proselytizing', 'Proud', 'Prudent', 'Prudish', 'Prying', 'Puerile',
    'Pugnacious', 'Quiet', 'Quirky', 'Racist', 'Rascal', 'Rash', 'Realistic',
    'Rebellious', 'Reckless', 'Refined', 'Repellent', 'Reserved', 'Respectful',
    'Responsible', 'Restless', 'Reticent', 'Reverent', 'Rigid', 'Risk-taking',
    'Rude', 'Sadistic', 'Sarcastic', 'Sardonic', 'Sassy', 'Savage', 'Scared',
    'Scolding', 'Secretive', 'Self-effacing', 'Selfish', 'Selfless', 'Senile',
    'Sensible', 'Sensitive', 'Sensual', 'Sentimental', 'Serene', 'Serious',
    'Servile', 'Sexist', 'Sexual', 'Shallow', 'Shameful', 'Shameless',
    'Shifty', 'Shrewd', 'Shy', 'Sincere', 'Slanderous', 'Sly', 'Smug',
    'Snobbish', 'Sober', 'Sociable', 'Solemn', 'Solicitous', 'Solitary',
    'Solitary', 'Sophisticated', 'Spendthrift', 'Spiteful', 'Stern', 'Stingy',
    'Stoic', 'Stubborn', 'Submissive', 'Sultry', 'Superstitious', 'Surly',
    'Suspicious', 'Sybarite', 'Sycophantic', 'Sympathetic', 'Taciturn',
    'Tactful', 'Tawdry', 'Teetotaler', 'Temperamental', 'Tempestuous',
    'Thorough', 'Thrifty', 'Timid', 'Tolerant', 'Transparent', 'Treacherous',
    'Troublemaker', 'Trusting', 'Truthful', 'Uncommitted', 'Understanding',
    'Unfriendly', 'Unhinged', 'Uninhibited', 'Unpredictable', 'Unruly',
    'Unsupportive', 'Vague', 'Vain', 'Vapid', 'Vengeful', 'Vigilant',
    'Violent', 'Vivacious', 'Vulgar', 'Wanton', 'Wasteful', 'Weary',
    'Whimsical', 'Whiny', 'Wicked', 'Wisecracking', 'Wistful', 'Witty',
    'Zealous'
]


NAMES = {
    'Human': {
        "Male": [
            'Anlow', 'Arando', 'Bram', 'Cale', 'Dalkon', 'Daylen', 'Dodd',
            'Dungarth', 'Dyrk', 'Eandro', 'Falken', 'Feck', 'Fenton',
            'Gryphero', 'Hagar', 'Jeras', 'Krynt', 'Lavant', 'Leyten', 'Madian',
            'Malfier', 'Markus', 'Meklan', 'Namen', 'Navaren', 'Nerle', 'Nilus',
            'Ningyan', 'Norris', 'Quentin', 'Semil', 'Sevenson', 'Steveren',
            'Talfen', 'Tamond', 'Taran', 'Tavon', 'Tegan', 'Vanan', 'Vincent'
        ],
        "Female": [
            'Azura', 'Brey', 'Hallan', 'Kasaki', 'Lorelei', 'Mirabel',
            'Pharana', 'Remora', 'Rosalyn', 'Sachil', 'Saidi', 'Tanika', 'Tura',
            'Tylsa', 'Vencia', 'Xandrilla'
        ],
        "Last": [
            'Arkalis', 'Armanci', 'Bilger', 'Blackstrand', 'Brightwater',
            'Carnavon', 'Caskajaro', 'Coldshore', 'Coyle', 'Cresthill',
            'Cuttlescar', 'Daargen', 'Dalicarlia', 'Danamark', 'Donoghan',
            'Drumwind', 'Dunhall', 'Ereghast', 'Falck', 'Fallenbridge',
            'Faringray', 'Fletcher', 'Fryft', 'Goldrudder', 'Grantham',
            'Graylock', 'Gullscream', 'Hindergrass', 'Iscalon', 'Kreel',
            'Kroft', 'Lamoth', 'Leerstrom', 'Lynchfield', 'Moonridge',
            'Netheridge', 'Oakenheart', 'Pyncion', 'Ratley', 'Redraven',
            'Revenmar', 'Roxley', 'Sell', 'Seratolva', 'Shanks', 'Shattermast',
            'Shaulfer', 'Silvergraft', 'Stavenger', 'Stormchapel', 'Strong',
            'Swiller', 'Talandro', 'Targana', 'Towerfall', 'Umbermoor',
            'Van Devries', 'Van Gandt', 'Van Hyden', 'Varcona', 'Varzand',
            'Voortham', 'Vrye', 'Webb', 'Welfer', 'Wilxes', 'Wintermere',
            'Wygarthe', 'Zatchet', 'Zethergyll'
        ]
    }
}

ARCHETYPES = [PATHFINDER, FIGHTER, CLERIC, MAGICUSER, THIEF]
VALID_BACKGROUND_NAMES = [background.lower().replace("'", "") for a in ARCHETYPES for background in a]
ALL_BACKGROUNDS = []
for a in ARCHETYPES:
    for background, v in a.items():
        ALL_BACKGROUNDS.append(v)

BACKGROUND_BY_NAME = dict(zip(VALID_BACKGROUND_NAMES, ALL_BACKGROUNDS))
