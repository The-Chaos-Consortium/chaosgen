# Convert character generation code to discord bot output
import random

from chaosgen import character_class, dice
from chaosgen.character import Character


def generate_character(background=None):
    """Builds a random character."""
    if background is None:
        char = Character(classname="random")
    else:
        char = Character(classname=background)
    newline = "\n"
    data = (
        f"**Background**: {char.class_name} ({char.archetype})\n"
        + f"**STR**: {char.STR}\n"
        + f"**DEX**: {char.DEX}\n"
        + f"**WIL**: {char.WIL}\n"
        + f"**Max Stamina**: {char.stamina}\n"
        + "**Level**: 1\n"
        + f"**Shillings (S)**: {char.sp}\n"
        + f"**Spells**: {char.spell}\n"
        + f"**Notes**: \n{char.notes}\n\n"
        + f"**Slots**: {char.slots}\n"
        + f"**Equipment**: \n{newline.join(f'{index+1}. {equip}' for index, equip in enumerate(char.equipment))}\n"
        + f"**Talents**: {char.talents}\n"
    )
    if char.mount:
        data += (
            f"\n**Mount Type**: {char.mount['name']}\n"
            + f"**Mount Stamina**: {dice.xdy(char.mount['HD'], 8)}\n"
            + f"**Mount Skill**: {char.mount['Skill']}\n"
            + f"**Mount Morale**: {char.mount['ML']}\n"
            + f"**Mount Slots**: {char.mount['Slots']}\n"
        )
        if char.mount["equipment"]:
            data += f"**Mount Equipment**: \n{newline.join(f'{index+1}. {equip}' for index, equip in enumerate(char.mount['equipment']))}\n"
    if char.retainer:
        data += (
            f"\n**Retainer Type**: {char.retainer['name']}\n"
            + f"**Retainer Stamina**: {dice.xdy(char.retainer['HD'], 8)}\n"
            + f"**Retainer Skill**: {char.retainer['Skill']}\n"
            + f"**Retainer Morale**: {char.retainer['ML']}\n"
            + f"**Retainer Level**: 1\n"
            f"**Retainer Slots**: 10\n"
            f"**Retainer Equipment**: \n{newline.join(f'{index+1}. {equip}' for index, equip in enumerate(char.retainer['equipment']))}\n"
        )
    return data


def random_spell():
    """Generates a random spell."""
    spell = random.choice(character_class.SPELLS)
    return f"**Spell**: {spell}"
