import {
  CancellationToken,
  Hover,
  HoverProvider,
  MarkdownString,
  Position,
  TextDocument,
  Uri,
} from "vscode";
import Provider from "../logic/Provider";

export class DocHoverProvider extends Provider implements HoverProvider {
  provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Hover {
    const range = document.getWordRangeAtPosition(position);
    const word = document.getText(range).trim();
    const args = [{ actionName:word }];
    const searchCommandUri = Uri.parse(
      `command:fastlane-intellisense.openTextDoc?${encodeURIComponent(JSON.stringify(args))}`
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
}

export default DocHoverProvider;
