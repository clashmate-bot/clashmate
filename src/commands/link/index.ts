import type { ChatInputCommandInteraction } from 'discord.js';

import type { LinkWorkflow } from '../../modules/link-workflow.js';
import { BaseCommand } from '../base-command.js';
import type { BaseSubcommand } from '../base-subcommand.js';
import { LinkCreateSubcommand } from './link-create.js';
import { LinkDeleteSubcommand } from './link-delete.js';
import { LinkListSubcommand } from './link-list.js';

class LinkCommand extends BaseCommand {
  private readonly subcommands: Map<string, BaseSubcommand>;

  constructor(workflow: LinkWorkflow) {
    super({
      name: 'link',
      description: 'Manage Clash links and the signed /links dashboard',
      category: 'link',
      guildOnly: true,
      defer: true,
      ephemeral: true,
    });

    const subcommands: BaseSubcommand[] = [
      new LinkListSubcommand(workflow),
      new LinkCreateSubcommand(workflow),
      new LinkDeleteSubcommand(workflow),
    ];

    this.subcommands = new Map(
      subcommands.map((subcommand) => [subcommand.name, subcommand])
    );

    for (const subcommand of subcommands) {
      subcommand.register(this.data);
    }
  }

  protected async run(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const subcommand = this.subcommands.get(
      interaction.options.getSubcommand(true)
    );

    if (!subcommand) {
      await interaction.editReply({
        content: 'Unsupported /link subcommand.',
      });
      return;
    }

    await subcommand.execute(interaction);
  }
}

export function createLinkCommand(workflow: LinkWorkflow): LinkCommand {
  return new LinkCommand(workflow);
}
