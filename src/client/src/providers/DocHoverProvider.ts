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
  provideHover(
    document: TextDocument,
    position: Position,
    _token: CancellationToken
  ) {
    // const currentLine = document.lineAt(position.line).text;
    // console.log({currentLine});
    return null;
  }
}

export default DocHoverProvider;
