import { REST, Routes, type ChatInputCommandInteraction } from 'discord.js';

import type { BotCommand } from '../commands/types.js';

export class CommandRegistry {
  readonly commands: Map<string, BotCommand>;

  constructor(commands: BotCommand[]) {
    this.commands = new Map();

    for (const command of commands) {
      if (this.commands.has(command.name)) {
        throw new Error(`Duplicate command registered: ${command.name}`);
      }

      this.commands.set(command.name, command);
    }
  }

  async register(input: {
    applicationId: string;
    token: string;
    guildId?: string;
  }): Promise<void> {
    const rest = new REST({ version: '10' }).setToken(input.token);
    const payload = [...this.commands.values()].map((command) =>
      command.data.toJSON()
    );

    if (input.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(input.applicationId, input.guildId),
        {
          body: payload,
        }
      );
      console.log(
        `Registered ${payload.length} guild command(s) for ${input.guildId}`
      );
      return;
    }

    await rest.put(Routes.applicationCommands(input.applicationId), {
      body: payload,
    });
    console.log(`Registered ${payload.length} global command(s)`);
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this.commands.get(interaction.commandName);

    if (!command) {
      await interaction.reply({
        content: `Unknown command: ${interaction.commandName}`,
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: `ClashMate failed to complete the request: ${message}`,
        });
        return;
      }

      await interaction.reply({
        content: `ClashMate failed to complete the request: ${message}`,
        ephemeral: true,
      });
    }
  }
}
