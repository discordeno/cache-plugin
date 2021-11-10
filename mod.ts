import { Bot } from "./deps.ts";

// PLUGINS MUST TAKE A BOT ARGUMENT WHICH WILL BE MODIFIED
export function enableCachePlugin(bot: Bot): Bot {
  // MARK THIS PLUGIN BEING USED
  bot.enabledPlugins.add("CACHE");

  // CUSTOMIZATION GOES HERE

  // Get the unmodified transformer.
  const { guild, user, member, channel, message, presence } = bot.transformers;
  // Override the transformer
  bot.transformers.guild = function (...args) {
    // Run the unmodified transformer
    const result = guild(...args);
    // Cache the result
    bot.cache.guilds.set(result.id, result);
    // Return the result
    return result;
  };

  // Override the transformer
  bot.transformers.user = function (...args) {
    // Run the unmodified transformer
    const result = user(...args);
    // Cache the result
    bot.cache.users.set(result.id, result);
    // Return the result
    return result;
  };

  // Override the transformer
  bot.transformers.member = function (...args) {
    // Run the unmodified transformer
    const result = member(...args);
    // Cache the result
    bot.cache.members.set(
      bot.transformers.snowflake(`${result.id}${result.guildId}`),
      result,
    );
    // Return the result
    return result;
  };

  // Override the transformer
  bot.transformers.channel = function (...args) {
    // Run the unmodified transformer
    const result = channel(...args);
    // Cache the result
    bot.cache.channels.set(result.id, result);
    // Return the result
    return result;
  };

  // Override the transformer
  bot.transformers.message = function (...args) {
    // Run the unmodified transformer
    const result = message(...args);
    // Cache the result
    bot.cache.messages.set(result.id, result);
    // Return the result
    return result;
  };

  // Override the transformer
  bot.transformers.presence = function (...args) {
    // Run the unmodified transformer
    const result = presence(...args);
    // Cache the result
    bot.cache.presences.set(result.user.id, result);
    // Return the result
    return result;
  };

  // PLUGINS MUST RETURN THE BOT
  return bot;
}
