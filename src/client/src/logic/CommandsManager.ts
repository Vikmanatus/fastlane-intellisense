import {
  setupConfigCommmandHandler,
  setupVirtualDocumentCommandHandler,
} from "./commands";
import Manager from "./Manager";

export type CommandHandlerType = {
  command: string;
  commandHandler: () => void;
};

export class CommandsManager extends Manager {
  public commandList: CommandHandlerType[] = [];
  public init(): void {
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
