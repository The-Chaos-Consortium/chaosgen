# Convert character generation code to discord bot output
from chaosgen.character import Character
from chaosgen import character_class
from chaosgen import dice

def random_character():
    """Builds a random characte."""
    char = Character(classname="random")
    newline = "\n"
    data = (
        f"**Background**: {char.class_name} ({char.archetype})\n" +
        f"**STR**: {char.STR}\n" +
        f"**DEX**: {char.DEX}\n" +
        f"**WIL**: {char.WIL}\n" +
        f"**Max HP**: {char.hp}\n" +
        "**Level**: 1\n" +
        f"**SP**: {char.sp}\n" +
        f"**Spells**: {char.spell}\n" +
        f"**Notes**: \n{char.notes}\n\n" +
        f"**Slots**: {char.slots}\n" +
        f"**Equipment**: \n{newline.join(f'{index+1}. {equip}' for index, equip in enumerate(char.equipment))}\n"
    )
    return data
