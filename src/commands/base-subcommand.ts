import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';

export interface BaseSubcommandOptions {
  name: string;
  description: string;
  category: string;
}

export abstract class BaseSubcommand {
  readonly name: string;
  readonly description: string;
  readonly category: string;

  constructor(options: BaseSubcommandOptions) {
    this.name = options.name;
    this.description = options.description;
    this.category = options.category;
  }

  register(builder: SlashCommandBuilder): void {
    builder.addSubcommand((subcommand) => this.configure(subcommand));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.run(interaction);
  }

  protected configure(
    builder: SlashCommandSubcommandBuilder
  ): SlashCommandSubcommandBuilder {
    return builder.setName(this.name).setDescription(this.description);
  }

  protected abstract run(
    interaction: ChatInputCommandInteraction
  ): Promise<void>;
}
