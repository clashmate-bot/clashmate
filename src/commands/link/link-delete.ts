import type {
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from 'discord.js';

import type { LinkWorkflow } from '../../modules/link-workflow.js';
import { BaseSubcommand } from '../base-subcommand.js';

export class LinkDeleteSubcommand extends BaseSubcommand {
  constructor(private readonly workflow: LinkWorkflow) {
    super({
      name: 'delete',
      description: 'Delete an existing player link',
      category: 'link',
    });
  }

  protected override configure(
    builder: SlashCommandSubcommandBuilder
  ): SlashCommandSubcommandBuilder {
    return super.configure(builder).addStringOption((option) =>
      option
        .setName('player-tag')
        .setDescription('Player tag to unlink')
        .setRequired(true)
    );
  }

  protected async run(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const playerTag = interaction.options.getString('player-tag', true);
    const link = await this.workflow.deleteLink(playerTag);
    await interaction.editReply({
      content: `Deleted link for ${link.playerName} (${link.playerTag}).`,
    });
  }
}
