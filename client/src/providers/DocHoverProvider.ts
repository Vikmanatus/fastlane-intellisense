import {
  CancellationToken,
  HoverProvider,
  MarkdownString,
  Position,
  TextDocument,
  Uri,
} from "vscode";
import Provider from "../logic/Provider";
import actions_list from "../actions_list.json";
export class DocHoverProvider extends Provider implements HoverProvider {
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
