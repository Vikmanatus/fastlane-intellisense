import {
  setupConfigCommmandHandler,
  setupVirtualDocumentCommandHandler,
} from "../helpers/commands";

export type CommandHandlerType = {
  command: string;
  commandHandler: () => void;
};

export class CommandsManager {
  public commandList: CommandHandlerType[] = [];

  init() {
    this.addCommand(setupConfigCommmandHandler());
    this.addCommand(setupVirtualDocumentCommandHandler());
  }
  addCommand(item: CommandHandlerType) {
    this.commandList.push(item);
  }
  getCommandList(): CommandHandlerType[] {
    return this.commandList;
  }
}
