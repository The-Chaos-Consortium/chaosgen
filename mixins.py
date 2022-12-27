import random

import characterclass
from dice import d, xdy


class BasicAttributesMixin():
    """
    Generates the basic attributes of a D&D character: STR, INT, DEX, CON, WIS,
    CHA. The scores are rolled using 3d6 in order.
    """

    def __init__(self, *args, **kwargs):
        self.attributes = self.roll_attribute_scores()

        # attribute map to ease display in template
        self.attr = dict((attr, self.with_bonus(attr, value))
                        for attr, value in self.attributes)

    @property
    def STR(self): return self.attributes[characterclass.STR][1]

    @property
    def INT(self): return self.attributes[characterclass.INT][1]

    @property
    def DEX(self): return self.attributes[characterclass.DEX][1]

    @property
    def CON(self): return self.attributes[characterclass.CON][1]

    @property
    def WIS(self): return self.attributes[characterclass.WIS][1]

    @property
    def CHA(self): return self.attributes[characterclass.CHA][1]

    def roll_attribute_scores(self):
        """
        Rolls the attribute scores: 3d6 in order, as one would expect.
        """
        return [(attribute, xdy(3, 6)) for attribute in characterclass.ATTRIBUTES]

    def get_bonus(self, attr, val):
        """
        Return the bonus for the given attribute (the Moldvay D&D attribute
        bonuses.) Most sub-classes will override. Bonuses on attributes differ
        from edition to edition.
        """
        if val <= 3:
            bonus = -3
        elif 4 <= val <= 5:
            bonus = -2
        elif 6 <= val <= 8:
            bonus = -1
        elif 9 <= val <= 12:
            bonus = 0
        elif 13 <= val <= 15:
            bonus = 1
        elif 16 <= val <= 17:
            bonus = 2
        else:
            bonus = 3
        return bonus

    def with_bonus(self, attr, val):
        """
        Return attribute value with bonus attached, for display.
        """
        bonus = self.get_bonus(attr, val)
        if bonus:
            return "%d (%+d)" % (val, bonus)
        return "%d" % val


class NameMixin():
    """
    Generate a random name for this character.
    """
    @property
    def name(self):
        race = "Human"
        gender = self.appearance.split(", ")[0]

        if gender not in ["Male", "Female"]:
            gender = random.choice(["Male", "Female"])

        return '%s %s' % (random.choice(characterclass.NAMES[race][gender]), random.choice(characterclass.NAMES[race]["Last"]))


class AppearanceMixin():
    """
    Display the appearance of the character. This is the best part of this
    generator. It's all ugly murderhobo children.
    """
    def get_appearance(self):
        return ', '.join(random.choice(feature) for feature in characterclass.APPEARANCE)
