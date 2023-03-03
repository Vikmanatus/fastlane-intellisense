import {
  setupConfigCommmandHandler,
  setupVirtualDocumentCommandHandler,
} from "../helpers/commands";
import Manager from "./Manager";

export type CommandHandlerType = {
  command: string;
  commandHandler: () => void;
};

export class CommandsManager extends Manager {
  public commandList: CommandHandlerType[] = [];
  public init(): boolean {
    this.addCommand(setupConfigCommmandHandler());
    this.addCommand(setupVirtualDocumentCommandHandler());
    return true;
  }
  addCommand(item: CommandHandlerType) {
    this.commandList.push(item);
  }
  getCommandList(): CommandHandlerType[] {
    return this.commandList;
  }
}
