import {
  GuildMemberAdd,
  GuildMemberRemove,
  SnakeCasedPropertiesDeep,
} from "../deps.ts";
import type { BotWithCache } from "./addCacheCollections.ts";

export function setupCacheEdits(bot: BotWithCache) {
  const { GUILD_MEMBER_ADD, GUILD_MEMBER_REMOVE } = bot.handlers;

  bot.handlers.GUILD_MEMBER_ADD = function (_, data, shardId) {
    const payload = data.d as SnakeCasedPropertiesDeep<GuildMemberAdd>;

    const guild = bot.guilds.get(bot.transformers.snowflake(payload.guild_id));

    if (guild) guild.memberCount++;

    GUILD_MEMBER_ADD(bot, data, shardId);
  };

  bot.handlers.GUILD_MEMBER_REMOVE = function (_, data, shardId) {
    const payload = data.d as SnakeCasedPropertiesDeep<GuildMemberRemove>;

    const guild = bot.guilds.get(bot.transformers.snowflake(payload.guild_id));

    if (guild) guild.memberCount--;

    GUILD_MEMBER_REMOVE(bot, data, shardId);
  };
}
