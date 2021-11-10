# cache-plugin

This is an official plugin maintained by Discordeno. This plugin provides
automatic caching. Remember Discordeno does not cache by default. This plugin is
NOT recommended for big bot developers but this is useful for smaller bots who
just want simple functionality.

## Usage

```ts
// MOVE TO DEPS.TS AND USE SPECIFIC VERSION
import enableCachePlugin from "https://deno.land/x/discordeno-cache-plugin/mod.ts";

// Create the bot object, THIS WILL NEED YOUR OPTIONS.
const bot = createBot({});
// Enables the cache plugin on this bot
enableCachePlugin(bot);
// Start your bot
await startBot(bot);
```
