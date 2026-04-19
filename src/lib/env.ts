export interface BotEnv {
  discordToken?: string;
  discordApplicationId?: string;
  discordGuildId?: string;
  serviceUrl: string;
  serviceBotToken?: string;
  proxyUrl: string;
  proxyToken?: string;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): BotEnv {
  return {
    discordToken: readOptional(source.DISCORD_TOKEN),
    discordApplicationId: readOptional(source.DISCORD_APPLICATION_ID),
    discordGuildId: readOptional(source.CLASHMATE_DISCORD_GUILD_ID),
    serviceUrl:
      readOptional(source.CLASHMATE_SERVICE_URL) ?? 'http://localhost:3001',
    serviceBotToken: readOptional(source.CLASHMATE_SERVICE_BOT_TOKEN),
    proxyUrl: readOptional(source.CLASHMATE_PROXY_URL) ?? 'http://localhost:3002',
    proxyToken: readOptional(source.CLASHMATE_PROXY_TOKEN),
  };
}

export function validateRuntimeEnv(env: BotEnv): string[] {
  const issues: string[] = [];

  if (!env.discordToken) {
    issues.push('DISCORD_TOKEN is missing');
  }

  if (!env.serviceBotToken) {
    issues.push('CLASHMATE_SERVICE_BOT_TOKEN is missing');
  }

  if (!env.proxyToken) {
    issues.push('CLASHMATE_PROXY_TOKEN is missing');
  }

  if (!env.discordApplicationId) {
    issues.push('DISCORD_APPLICATION_ID is missing');
  }

  return issues;
}

function readOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
