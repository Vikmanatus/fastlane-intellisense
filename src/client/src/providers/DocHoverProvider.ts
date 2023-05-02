import {
  CancellationToken,
  ExtensionContext,
  HoverProvider,
  MarkdownString,
  Position,
  TextDocument,
  Uri,
  languages,
} from "vscode";
import Provider from "../logic/Provider";
import { actions_list } from "@/shared/src/config";

export class DocHoverProvider extends Provider implements HoverProvider {
  public init(): boolean {
    console.log("Initializing DocHoverProvider");

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
  provideHover(
    document: TextDocument,
    position: Position,
    _token: CancellationToken
  ) {
    const range = document.getWordRangeAtPosition(position);
    const word = document.getText(range).trim();
    const args = [{ actionName: word }];
    const matchWord = actions_list.filter(
      (element) => element.action_name === word
    );
    if (matchWord.length) {
      const searchCommandUri = Uri.parse(
        `command:fastlane-intellisense.openTextDoc?${encodeURIComponent(
          JSON.stringify(args)
        )}`
      );
      const contents = new MarkdownString(
        `[Open doc for: ${word}](${searchCommandUri})`
      );
      contents.isTrusted = true;
      return {
        contents: [contents],
        range,
      };
    }
    return null;
  }
}

export default DocHoverProvider;
