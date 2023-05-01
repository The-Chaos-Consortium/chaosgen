# c-c-character-generator
Python based character generator for the Chaos &amp; Conquest TTRPG.
# Usage
## Command
```sh
python -m chaosgen.generate_pdf class="{class}" num="{num}"
```
If both parameters are left out, a single random class sheet will be generated.

`class` can be one of the below options, left out for the default value `random`, or set to `all`. `all` will generate 1 of each class, a total of 20 sheets.

`num` can be any value from `1-20`, or `all`.
## Class Options
```
roadwarden
ranger
bounty hunter
outlaw
soldier
knight
duelist
slayer
exorcist
warpriest
initiate
charlatan
wizards apprentice
warlock
alchemist
witch
rat catcher
beggar
grave robber
burglar
```