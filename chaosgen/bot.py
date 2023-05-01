# bot.py
import os
import logging

from typing import Optional
import discord
from discord.ext import commands
from dotenv import load_dotenv

from chaosgen.character import Character
from chaosgen import character_class
from chaosgen import dice
from chaosgen import bot_commands

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)
logging.basicConfig(level=logging.INFO)

@bot.event
async def on_ready():
    """print when connecting"""
    print(f"{bot.user.name} has connected to discord!")

@bot.command(name="chargen", help="generates a random character")
async def build_random_character(ctx):
    """builds a random character"""
    await ctx.send(bot_commands.random_character())

bot.run(TOKEN)
