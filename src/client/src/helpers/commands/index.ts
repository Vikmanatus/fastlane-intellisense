import { Uri, ViewColumn, commands, window } from "vscode";
import path = require("path");
import { CommandHandlerType } from "../../logic/CommandsManager";

export const setupConfigCommmandHandler = (): CommandHandlerType => {
  const command = "fastlane-intellisense.setupConfig";

  const commandHandler = () => {
    const devRegex =
      /^(.*?[\\/])[a-zA-Z]:?[\\/]?[^\\/]*?[\\/]?fastlane-intellisense[\\/]/g;
    const prodRegex =
      /^(.*?[\\/])[a-zA-Z]:?[\\/]?[^\\/]*?[\\/]?vikmanatus\.fastlane-intellisense-.*?[\\/]/g;
    const regex = process.env.NODE_ENV === "development" ? devRegex : prodRegex;
    const matchPath = __dirname.match(regex);
    if (matchPath) {
      const scriptPath = path.join(
        __dirname,
        "../../../src/scripts/get_fastlane_actions.rb"
      );
      const terminal = window.createTerminal("Run Ruby Script");

      // Send the command to run the Ruby script
      terminal.sendText(`ruby ${scriptPath}`);

      // Show the terminal
      terminal.show();
    } else {
      window.showErrorMessage(
        "There seems to be an issue with your fastlane setup"
      );
    }
  };
  return { command, commandHandler };
};

export const setupVirtualDocumentCommandHandler = (): CommandHandlerType => {
  const command = "fastlane-intellisense.openTextDoc";
  const commandHandler = async (args?: { actionName: string }) => {
    const uri = Uri.parse(
      "fastlane-intellisense-doc:" + `fastlane-action-doc.md?${args.actionName}`
    );
    await commands.executeCommand(
      "markdown.showPreviewToSide",
      uri,
      ViewColumn.Beside
    );
  };
  return { command, commandHandler };
};
