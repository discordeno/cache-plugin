import { Bot, Collection } from "./deps.ts";
import {
  channelSweeper,
  guildSweeper,
  memberSweeper,
  messageSweeper,
} from "./src/sweepers.ts";

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
    
    const channels = payload.guild.channels || [];

    channels.forEach(async (channel) => {
      const chnl = bot.transformers.channel(bot, { channel, guildId: result.id });
      await bot.cache.channels.set(chnl.id, chnl);
    });
    
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

/** Enables sweepers for your bot but will require, enabling cache first. */
export function enableCacheSweepers(bot: Bot) {
  // @ts-ignore TODO: see if we can fix this type
  bot.cache.guilds = new Collection([], {
    // @ts-ignore TODO: more cache issues
    sweeper: { filter: guildSweeper, interval: 3660000, bot },
  });
  // @ts-ignore TODO: see if we can fix this type
  bot.cache.channels = new Collection([], {
    // @ts-ignore TODO: more cache issues
    sweeper: { filter: channelSweeper, interval: 3660000, bot },
  });
  // @ts-ignore TODO: see if we can fix this type
  bot.cache.members = new Collection([], {
    sweeper: { filter: memberSweeper, interval: 300000, bot },
  });
  // @ts-ignore TODO: see if we can fix this type
  bot.cache.messages = new Collection([], {
    sweeper: { filter: messageSweeper, interval: 300000, bot },
  });
  // @ts-ignore TODO: see if we can fix this type
  bot.cache.presences = new Collection([], {
    sweeper: { filter: () => true, interval: 300000, bot },
  });

  // DISPATCH REQUIREMENTS
  const handleDiscordPayloadOld = bot.gateway.handleDiscordPayload;
  bot.gateway.handleDiscordPayload = async function (_, data, shardId) {
    // RUN DISPATCH CHECK
    await bot.events.dispatchRequirements(bot, data, shardId);
    // RUN OLD HANDLER
    handleDiscordPayloadOld(_, data, shardId);
  };
}

export default enableCachePlugin;
