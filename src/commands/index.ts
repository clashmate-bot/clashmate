import { createLinkCommand } from './link/index.js';
import { createVerifyCommand } from './link/verify.js';
import type { BotCommand } from './types.js';
import type { LinkWorkflow } from '../modules/link-workflow.js';

export function createCommands(workflow: LinkWorkflow): BotCommand[] {
  return [createLinkCommand(workflow), createVerifyCommand(workflow)];
}
