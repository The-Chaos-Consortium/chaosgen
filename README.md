# c-c-character-generator
Python based character generator for the Chaos & Conquest TTRPG.
# Usage
## Command for PDF generation
```sh
python -m chaosgen.generate_pdf class="{class}" num="{num}"
```
If both parameters are left out, a single random class sheet will be generated.

`class` can be one of the below options, left out for the default value `random`, or set to `all`. `all` will generate 1 of each class, a total of 20 sheets.

`num` can be any value from `1-20`, or `all`.
### Class Options
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
## Discord Bot
### Setting up a Discord Application
Before we can invite Chaos Gen to our discord channel, we will first need to create a discord application, a bot account, and to note down the OAuth token. These steps can be found in the [documentation for discord.py](https://discordpy.readthedocs.io/en/stable/discord.html).
### Creating the Environment Variables
Copy the `.example_env` file to `.env` and modify it to include the OAuth token from the previous step. This file is used when running the scripts locally, and is passed into the docker container at runtime.
### Running locally
```bash
pip install -r requirements.txt --disable-pip-version-check
# Run bot
python -m chaosgen.bot
```
### Docker Container
A Dockerfile has been provided to automate the above build and execution processes.

#### Build the docker image
`docker build -t chaosgen .`

#### Run the container
`docker run --env-file .env -d chaosgen`
# Acknowledgements
Chaos & Conquest was created by Alex Gomez and licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)