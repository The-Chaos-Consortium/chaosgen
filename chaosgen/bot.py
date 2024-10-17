# bot.py
import logging
import os
from typing import Optional

import discord
from discord.ext import commands
from dotenv import load_dotenv

from chaosgen import bot_commands, character_class, dice
from chaosgen.character import Character

load_dotenv()
TOKEN = os.getenv("DISCORD_TOKEN")

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)
logging.basicConfig(level=logging.INFO)


@bot.event
async def on_ready():
    """print when connecting"""
    print(f"{bot.user.name} has connected to discord!")


@bot.command(
    name="chargen",
    help='Generates a random character or specific with !chargen "<background>"'
    + "(you can find a list of backgrounds with !chargen list)",
)
async def generate_random_character(ctx, background: Optional[str]):
    """Generates a random character"""
    if background == "list":
        await ctx.send(
            "**Available backgrounds**: "
            + ", ".join(bg for bg in list(character_class.BACKGROUND_BY_NAME.keys()))
        )
    else:
        await ctx.send(bot_commands.generate_character(background))


@bot.command(name="spell", help="Generates a random spell")
async def generate_random_spell(ctx):
    """Generates a random spell"""
    await ctx.send(bot_commands.random_spell())


bot.run(TOKEN)
