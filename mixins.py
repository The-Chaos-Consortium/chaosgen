"""
Generate the attributes, name, and appearance.
"""
import random

import character_class
from dice import d


class BasicAttributesMixin:
    """
    Generates the basic attributes of a C&C character: STR, DEX, WIL. The scores are rolled using d3+5 in order.
    """

    def __init__(self):
        self.attributes = self.roll_attribute_scores()

    @property
    def STR(self):
        return self.attributes[character_class.STR][1]

    @property
    def DEX(self):
        return self.attributes[character_class.DEX][1]

    @property
    def WIL(self):
        return self.attributes[character_class.WIL][1]

    def roll_attribute_scores(self):
        """
        Rolls the attribute scores: d3+5 in order.
        """
        return [(attribute, d(3) + 5) for attribute in character_class.ATTRIBUTES]


class NameMixin:
    """
    Generate a random name for this character.
    """

    def get_name(self):
        race = "Human"
        gender = self.appearance.split(", ")[0]

        if gender not in ["Male", "Female"]:
            gender = random.choice(["Male", "Female"])

        return "%s %s" % (
            random.choice(character_class.NAMES[race][gender]),
            random.choice(character_class.NAMES[race]["Last"]),
        )


class AppearanceMixin:
    """
    Display the appearance of the character. This is the best part of this
    generator. It's all ugly murderhobo children.
    """

    def get_appearance(self):
        return ", ".join(random.choice(feature) for feature in character_class.APPEARANCE)
