import operator
import random

import character_class
from mixins import BasicAttributesMixin, AppearanceMixin, NameMixin
from dice import d, xdy


class Character(BasicAttributesMixin, AppearanceMixin, NameMixin):
    def __init__(self, *args, **kwargs):
        classname = kwargs.pop('classname', None)
        testing = kwargs.pop('testing', False)

        super(Character, self).__init__(*args, **kwargs)

        self.character_class = self.get_character_class(classname)
        self.class_name = self.character_class['name']
        self.appearance = self.get_appearance()
        self.personality = self.get_personality()
        if testing:
            return
        self.equipment = self.get_equipment()
        self.hp = self.get_hp()
        if self.hp is not None and self.hp < 1:
            self.hp = 1
        self.spell = self.get_spell()
        self.notes = self.get_notes()

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

    @property
    def num_first_level_spells(self):
        return 12

    def get_character_class(self, classname=None):
        """
        We determine character class based on the given class name.
        """
        if classname:
            return character_class.CLASS_BY_NAME[classname]
    
    def get_equipment(self):
        return self.character_class['equipment']

    def get_hp(self):
        """
        Determine HP. Note: this value may be negative and that is handled by the caller.
        """
        return d(8)

    def get_spell(self):
        """
        Magic-Users begin with a single spell.
        """
        if self.character_class.has_key('spells'):
            spells = self.character_class['spells'][:self.num_first_level_spells]
            return [random.choice(spells)]
        return None

    def get_personality(self):
        return ', '.join(random.sample(character_class.PERSONALITY, 2))

    def get_notes(self):
        """
        Are there any additional notes about the character?
        """
        return []
        