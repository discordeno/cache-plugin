import type { Bot } from "./deps.ts";

// PLUGINS MUST TAKE A BOT ARGUMENT WHICH WILL BE MODIFIED
export function enableSyncCachePlugin(bot: Bot) {
  // MARK THIS PLUGIN BEING USED
  if (bot.enabledPlugins) bot.enabledPlugins.add("CACHE");
  else bot.enabledPlugins = new Set(["CACHE"]);

  // CUSTOMIZATION GOES HERE

  const caches = [
    "guilds",
    "users",
    "members",
    "channels",
    "messages",
    "presences",
  ];

  for (const key in caches) {
    // Get the unmodified transformer.
    const oldTransformer = bot.transformers[key];
    // Override the transformer
    bot.transformers[key] = function (...args) {
      // Run the unmodified transformer
      const result = oldTransformer(...args);
      // Cache the result
      bot.cache[key].set(result.id, result);
      // Return the result
      return result;
    };
  }

  // PLUGINS MUST RETURN THE BOT
  return bot;
}

// PLUGINS MUST TAKE A BOT ARGUMENT WHICH WILL BE MODIFIED
export async function enableAsyncCachePlugin(bot: Bot) {
  // MARK THIS PLUGIN BEING USED
  if (bot.enabledPlugins) bot.enabledPlugins.add("CACHE");
  else bot.enabledPlugins = new Set(["CACHE"]);

  // CUSTOMIZATION GOES HERE

  const caches = [
    "guilds",
    "users",
    "members",
    "channels",
    "messages",
    "presences",
  ];

  for (const key in caches) {
    // Get the unmodified transformer.
    const oldTransformer = bot.transformers[key];
    // Override the transformer
    bot.transformers[key] = function (...args) {
      // Run the unmodified transformer
      const result = oldTransformer(...args);
      // Cache the result
      await bot.cache[key].set(result.id, result);
      // Return the result
      return result;
    };
  }

  // PLUGINS MUST RETURN THE BOT
  return bot;
}
