import { Client, Events, GatewayIntentBits } from 'discord.js';

import { createCommands } from './commands/index.js';
import { ServiceClient } from './integrations/service/client.js';
import { ProxyClient } from './integrations/proxy/client.js';
import { CommandRegistry } from './lib/command-registry.js';
import { loadEnv, validateRuntimeEnv } from './lib/env.js';
import { LinkWorkflow } from './modules/link-workflow.js';

function createWorkflow(env: {
  serviceUrl: string;
  serviceBotToken: string;
  proxyUrl: string;
  proxyToken: string;
}): LinkWorkflow {
  return new LinkWorkflow({
    serviceClient: new ServiceClient({
      baseUrl: env.serviceUrl,
      botToken: env.serviceBotToken,
    }),
    proxyClient: new ProxyClient({
      baseUrl: env.proxyUrl,
      authToken: env.proxyToken,
    }),
  });
}

export async function main() {
  const env = loadEnv();
  const issues = validateRuntimeEnv(env);

  if (issues.length > 0) {
    console.log('clashmate bot is in dry-run mode. Missing runtime config:');
    for (const issue of issues) {
      console.log(`- ${issue}`);
    }
    return;
  }

  const workflow = createWorkflow({
    serviceUrl: env.serviceUrl,
    serviceBotToken: env.serviceBotToken!,
    proxyUrl: env.proxyUrl,
    proxyToken: env.proxyToken!,
  });
  const registry = new CommandRegistry(createCommands(workflow));

  await registry.register({
    applicationId: env.discordApplicationId!,
    token: env.discordToken!,
    guildId: env.discordGuildId,
  });

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`clashmate bot ready as ${readyClient.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    await registry.execute(interaction);
  });

  await client.login(env.discordToken);
}

void main();
