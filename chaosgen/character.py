import random

import chaosgen.character_class as character_class
from chaosgen.mixins import BasicAttributesMixin, AppearanceMixin, NameMixin
from chaosgen.dice import d, xdy


class Character(BasicAttributesMixin, AppearanceMixin, NameMixin):
    def __init__(self, *args, **kwargs):
        self.classname = kwargs.pop("classname", None)

        super(Character, self).__init__(*args, **kwargs)

        self.character_class = self.get_character_class(self.classname)
        self.class_name = self.classname.title()
        self.archetype = self.get_archetype()
        self.appearance = self.get_appearance()
        self.name = self.get_name()
        self.personality = self.get_personality()
        self.equipment = self.get_equipment()
        self.mount = self.get_mount()
        self.retainer = self.get_retainer()
        self.hp = self.get_hp()
        if self.hp is not None and self.hp < 1:
            self.hp = 1
        self.spell = self.get_spell()
        self.notes = self.get_notes()
        self.sp = xdy(3, 6) * 5
        self.slots = max(10, self.STR)

    def to_dict(self):
        """
        We use vars to convert the object to a dictionary, and then replace
        the character_class attribute with it's name.
        """
        attributes = vars(self)
        attributes["class"] = attributes["class_name"]
        del attributes["character_class"]
        del attributes["class_name"]
        attributes["system"] = self.system
        return attributes

    @property
    def system(self):
        raise NotImplementedError()

    def get_character_class(self, classname=None):
        """
        We determine character class based on the given class name.
        """
        if classname:
            if classname == "random":
                self.classname = random.choice(
                    list(character_class.BACKGROUND_BY_NAME.keys())
                )
                print(f"A random class: {self.classname} has been chosen.")
                return character_class.BACKGROUND_BY_NAME[self.classname]
            return character_class.BACKGROUND_BY_NAME[classname]

    def get_archetype(self):
        return self.character_class["archetype"]

    def get_equipment(self):
        equip: list = self.character_class["equipment"]
        for item in equip:
            if isinstance(item, list):
                temp = item
                equip.remove(item)
                for i in temp:
                    equip.append(i)
        return equip + ["Dagger - d6 dmg", "Supply", "Supply"]

    def get_mount(self):
        return self.character_class["mount"]

    def get_retainer(self):
        return self.character_class["retainer"]

    def get_hp(self):
        """
        Determine HP. Note: this value may be negative and that is handled by the caller.
        """
        return d(8)

    def get_spell(self):
        """
        Magic-Users begin with a single spell.
        """
        if "spells" in self.character_class:
            spells = character_class.SPELLS
            return random.choice(spells)
        return ""

    def get_personality(self):
        return ", ".join(random.sample(character_class.PERSONALITY, 2))

    def get_notes(self):
        """
        Are there any additional notes about the character?
        """
        notes = (
            f"{self.archetype} Description: {character_class.ARCHETYPE_DESCRIPTIONS[self.archetype]}\n"
            f"Appearance: {self.appearance}\nPersonality: {self.personality}"
        )
        return notes
