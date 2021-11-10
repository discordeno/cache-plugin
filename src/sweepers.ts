import {
  Bot,
  Cache,
  DiscordenoChannel,
  DiscordenoGuild,
  DiscordenoMember,
  DiscordenoMessage,
} from "../deps.ts";

export function messageSweeper(_bot: Bot, message: DiscordenoMessage) {
  // DM messages aren't needed
  if (!message.guildId) return true;

  // Only delete messages older than 10 minutes
  return Date.now() - message.timestamp > 600000;
}

export function memberSweeper(bot: Bot, member: DiscordenoMember) {
  // Don't sweep the bot else strange things will happen
  if (member.id === bot.id) return false;

  // Only sweep members who were not active the last 30 minutes
  return Date.now() - member.cachedAt > 1800000;
}

export function guildSweeper(bot: Bot<Cache>, guild: DiscordenoGuild) {
  // Reset activity for next interval
  if (bot.cache.activeGuildIds.delete(guild.id)) return false;

  // This is inactive guild. Not a single thing has happened for atleast 30 minutes.
  // Not a reaction, not a message, not any event!
  bot.cache.dispatchedGuildIds.add(guild.id);

  return true;
}

export function channelSweeper(
  bot: Bot<Cache>,
  channel: DiscordenoChannel,
  key: bigint,
) {
  // If this is in a guild and the guild was dispatched, then we can dispatch the channel
  if (channel.guildId && bot.cache.dispatchedGuildIds.has(channel.guildId)) {
    bot.cache.dispatchedChannelIds.add(channel.id);
    return true;
  }

  // THE KEY DM CHANNELS ARE STORED BY IS THE USER ID. If the user is not cached, we dont need to cache their dm channel.
  if (!channel.guildId && !bot.cache.members.has(key)) return true;

  return false;
}
