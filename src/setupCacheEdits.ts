import type {
  Bot,
  Emoji,
  GuildMemberAdd,
  GuildMemberRemove,
  MessageReactionAdd,
  MessageReactionRemove,
  MessageReactionRemoveAll,
  SnakeCasedPropertiesDeep,
} from "../deps.ts";
import type { BotWithCache } from "./addCacheCollections.ts";

export function setupCacheEdits<B extends Bot>(bot: BotWithCache<B>) {
  const {
    GUILD_MEMBER_ADD,
    GUILD_MEMBER_REMOVE,
    MESSAGE_REACTION_ADD,
    MESSAGE_REACTION_REMOVE,
    MESSAGE_REACTION_REMOVE_ALL,
  } = bot.handlers;

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

  bot.handlers.MESSAGE_REACTION_ADD = function (_, data, _shardId) {
    const payload = data.d as SnakeCasedPropertiesDeep<MessageReactionAdd>;

    const messageId = bot.transformers.snowflake(payload.message_id)
    const message = bot.messages.get(messageId);

    // if the message is cached
    if (message) {
      const reactions = message.reactions?.map((r) => r.emoji);

      const toSet = {
        count: 1,
        me: bot.transformers.snowflake(payload.user_id) === bot.id,
        emoji: payload.emoji as Emoji & { id: bigint },
      };

      // if theres no reaction add it
      if (!reactions?.includes(toSet.emoji)) {
        message.reactions?.push(toSet);
      }
      // otherwise the reaction has already been added so +1 to the reaction count
      else {
        const current = message.reactions?.[reactions.indexOf(toSet.emoji)];

        if (current) {
          // rewrite
          if (message.reactions?.[message.reactions.indexOf(current)]) {
            message.reactions[message.reactions.indexOf(current)].count = current?.count + 1;
          }
        }
      }

      MESSAGE_REACTION_ADD(bot, data, _shardId);
    }

    bot.handlers.MESSAGE_REACTION_REMOVE = function (_, data, _shardId) {
      const payload = data.d as SnakeCasedPropertiesDeep<MessageReactionRemove>;

      const messageId = bot.transformers.snowflake(payload.message_id)
      const message = bot.messages.get(messageId);

      // if the message is cached
      if (message) {
        const reactions = message.reactions?.map((r) => r.emoji);

        if (reactions?.indexOf(payload.emoji as Emoji & { id: bigint }) !== undefined) {
          const current = message.reactions?.[reactions?.indexOf(payload.emoji as Emoji & { id: bigint })];

          if (current) {
            if (current.count > 0) {
              current.count = current.count - 1;
            }
            else {
              message.reactions?.splice(message.reactions?.indexOf(current), 0);
            }
          // when someone deleted a reaction that doesn't exist in the cache just pass
          } else {
            // pass
          }
        }
      }

      MESSAGE_REACTION_REMOVE(bot, data, _shardId);
    }

    bot.handlers.MESSAGE_REACTION_REMOVE_ALL = function (_, data, shardId) {
      const payload = data.d as SnakeCasedPropertiesDeep<MessageReactionRemoveAll>;

      const messageId = bot.transformers.snowflake(payload.message_id);
      const message = bot.messages.get(messageId);

      if (message) {
        // when an admin deleted all the reactions of a message
        message.reactions = undefined;
      }

      MESSAGE_REACTION_REMOVE_ALL(bot, data, shardId);
    }
  }
}
