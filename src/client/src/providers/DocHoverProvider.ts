import {
  CancellationToken,
  ExtensionContext,
  HoverProvider,
  MarkdownString,
  Position,
  TextDocument,
  Uri,
  languages,
  Range,
} from "vscode";
import Provider from "../logic/Provider";
import { FastlaneConfigType, actions_list } from "@/shared/src/config";

class DocHoverProvider extends Provider implements HoverProvider {
  private actionMap: Map<string, MarkdownString>;
  private argMap: Map<string, FastlaneConfigType>;
  constructor() {
    super();
    this.actionMap = new Map();
    this.argMap = new Map();
  }
  public init(): boolean {
    console.log("Initializing DocHoverProvider");
    if (actions_list.length > 0) {
      for (const action of actions_list) {
        const markdownString = this.generateActionLink(action.action_name);
        this.actionMap.set(action.action_name, markdownString);
        if (action.args) {
          for (const arg of action.args) {
            this.argMap.set(arg.key, arg);
          }
        }
      }
    }
    return true;
  }
  public registerProvider(context: ExtensionContext): void {
    context.subscriptions.push(
      languages.registerHoverProvider(
        { language: "ruby", scheme: "file" },
        this
      )
    );
  }
  private generateActionLink(actionName: string): MarkdownString {
    const args = [{ actionName: actionName }];
    const searchCommandUri = Uri.parse(
      `command:fastlane-intellisense.openTextDoc?${encodeURIComponent(
        JSON.stringify(args)
      )}`
    );
    const markdownString = new MarkdownString(
      `[Open doc for: ${actionName}](${searchCommandUri})`
    );
    markdownString.isTrusted = true;
    return markdownString;
  }
  private extractActionName(functionBlock: string) {
    const matchActionName = functionBlock.match(/^\s*([a-z_]+)/i);
    if (!matchActionName) {
      return null;
    }
    return matchActionName[1];
  }
  private findMatchInDocument(
    document: TextDocument,
    position: Position,
    regex: RegExp
  ): string | null {
    let startingLine = position.line;
    const endingLine = position.line +1;
    let functionBlock = null;

    while (startingLine >= 0) {
      const documentRange = new Range(startingLine, 0, endingLine, 0);
      const textBlock = document.getText(documentRange);
      const matchAction = textBlock.match(regex);

      if (matchAction) {
        functionBlock = matchAction[0];
        break;
      }

      startingLine--;
    }

    return functionBlock;
  }
  provideHover(
    document: TextDocument,
    position: Position,
    _token: CancellationToken
  ) {
    // const currentLine = document.lineAt(position.line).text;
    const regex = /[a-z_]+\s*\(\s*([^)]*)\s*\)?$/m;
    const matchAction = this.findMatchInDocument(document, position, regex);
    if (!matchAction) {
      return null;
    }
    const functionBlock = matchAction;
    const actionNameMatch = this.extractActionName(functionBlock);
    if (!actionNameMatch) {
      return null;
    }
    const range = document.getWordRangeAtPosition(position);
    const word = document.getText(range).trim();
    const isHoveredActionName = word === actionNameMatch ? true : false;
    if (isHoveredActionName) {
      // If we managed to get here, it means that the hovered word is contained into a fastlane action block and corresponds to the action name
      const matchAction = this.actionMap.get(word);
      if (!matchAction) {
        return null;
      }
      return {
        contents: [matchAction],
        range,
      };
    }
    // Need to check if the hovered word corresponds to the match
    const multilineArgs = this.parseMultilineArgs(functionBlock);

    const matchArg = multilineArgs.filter((element) => element === word);
    if (matchArg.length < 1) {
      return null;
    }
    // If we are here, it mean thaht the hovered word is matching one of the arguments of the action, so we can safely display the doc
    const arg = this.argMap.get(word);
    if (arg && arg.description) {
      const contents = new MarkdownString(
        arg.description + "\n\n" + "Action name: " + "`" + actionNameMatch + "`"
      );
      return {
        contents: [contents],
        range,
      };
    }

    // If we are here it means thaht the hovered term is not in an action with arguments

    return null;
  }
}

export default DocHoverProvider;
