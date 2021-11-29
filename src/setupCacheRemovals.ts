import {
  Channel,
  Collection,
  GuildBanAddRemove,
  GuildEmojisUpdate,
  GuildMemberRemove,
  GuildRoleDelete,
  MessageDelete,
  MessageDeleteBulk,
} from "../deps.ts";
import {
  Bot,
  Cache,
  SnakeCasedPropertiesDeep,
  UnavailableGuild,
} from "../deps.ts";

export function setupCacheRemovals(bot: Bot<Cache>) {
  const {
    CHANNEL_DELETE,
    GUILD_BAN_ADD,
    GUILD_DELETE,
    GUILD_EMOJIS_UPDATE,
    GUILD_MEMBER_REMOVE,
    GUILD_ROLE_DELETE,
    // MESSAGE_DELETE,
    MESSAGE_DELETE_BULK,
  } = bot.handlers;

  bot.handlers.GUILD_DELETE = function (_, data, shardId) {
    const payload = data.d as SnakeCasedPropertiesDeep<UnavailableGuild>;
    bot.cache.guilds.delete(bot.transformers.snowflake(payload.id));
    GUILD_DELETE(bot, data, shardId);
  };

  bot.handlers.CHANNEL_DELETE = function (_, data, shardId) {
    const payload = data.d as SnakeCasedPropertiesDeep<Channel>;
    // HANDLER BEFORE DELETING, BECAUSE HANDLER RUNS TRANSFORMER WHICH RECACHES
    CHANNEL_DELETE(bot, data, shardId);
    bot.cache.channels.delete(bot.transformers.snowflake(payload.id));
  };

  bot.handlers.GUILD_MEMBER_REMOVE = function (_, data, shardId) {
    const payload = data.d as SnakeCasedPropertiesDeep<GuildMemberRemove>;
    bot.cache.members.delete(bot.transformers.snowflake(payload.user.id));
    GUILD_MEMBER_REMOVE(bot, data, shardId);
  };

  bot.handlers.GUILD_BAN_ADD = function (_, data, shardId) {
    const payload = data.d as SnakeCasedPropertiesDeep<GuildBanAddRemove>;
    bot.cache.members.delete(bot.transformers.snowflake(payload.user.id));
    GUILD_BAN_ADD(bot, data, shardId);
  };

  bot.handlers.GUILD_EMOJIS_UPDATE = function (_, data, shardId) {
    const payload = data.d as SnakeCasedPropertiesDeep<GuildEmojisUpdate>;
    const guild = bot.cache.guilds.get(
      bot.transformers.snowflake(payload.guild_id),
    );
    if (guild) {
      guild.emojis = new Collection(
        payload.emojis.map((
          emoji,
        ) => [bot.transformers.snowflake(emoji.id!), emoji]),
      );
    }

    GUILD_EMOJIS_UPDATE(bot, data, shardId);
  };

  bot.handlers.MESSAGE_DELETE = function (_, data) {
    const payload = data.d as SnakeCasedPropertiesDeep<MessageDelete>;
    const id = bot.transformers.snowflake(payload.id);
    const message = bot.cache.messages.get(id);
    bot.events.messageDelete(bot, {
      id,
      channelId: bot.transformers.snowflake(payload.channel_id),
      guildId: payload.guild_id
        ? bot.transformers.snowflake(payload.guild_id)
        : undefined,
    }, message);
    bot.cache.messages.delete(id);
    // MESSAGE_DELETE(bot, data, shardId);
  };

  bot.handlers.MESSAGE_DELETE_BULK = function (_, data, shardId) {
    const payload = data.d as SnakeCasedPropertiesDeep<MessageDeleteBulk>;
    payload.ids.forEach((id) =>
      bot.cache.messages.delete(bot.transformers.snowflake(id))
    );
    MESSAGE_DELETE_BULK(bot, data, shardId);
  };

  bot.handlers.GUILD_ROLE_DELETE = function (_, data, shardId) {
    const payload = data.d as SnakeCasedPropertiesDeep<GuildRoleDelete>;
    const guild = bot.cache.guilds.get(
      bot.transformers.snowflake(payload.guild_id),
    );
    if (guild) guild.roles.delete(bot.transformers.snowflake(payload.role_id));

    GUILD_ROLE_DELETE(bot, data, shardId);
  };
}
