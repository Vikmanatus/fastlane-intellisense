import {
  CancellationToken,
  DefinitionProvider,
  Event,
  EventEmitter,
  Hover,
  HoverProvider,
  Location,
  MarkdownString,
  Position,
  Range,
  TextDocument,
  TextDocumentContentProvider,
  Uri,
  workspace,
} from "vscode";
import { convertToClassName, fileExists } from "../../helpers/index";
import Provider from "../Provider";

export class DocHoverProvider extends Provider implements HoverProvider {
  provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Hover {
    const range = document.getWordRangeAtPosition(position);
    const word = document.getText(range).trim();
    const searchCommandUri = Uri.parse(
      `command:fastlane-intellisense.openTextDoc`
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

export class GoDefinitionProvider
  extends Provider
  implements DefinitionProvider
{
  private findFunctionDefinition(
    document: TextDocument,
    actionName: string
  ): Position {
    const regex = new RegExp(`\\b${actionName}\\b`, "i");
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const match = line.text.match(regex);
      if (match) {
        return new Position(i, match.index);
      }
    }
    return null;
  }
  public async provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<Location> {
    // TODO: need to escape parenthesis inside text_element
    const range = document.lineAt(position).range;
    const text_element = document.getText(range).trim();

    const targetPath = `/Users/vikmanatus/.rvm/gems/ruby-2.7.5/gems/fastlane-2.212.1/fastlane/lib/fastlane/actions/${text_element}.rb`;
    const file_exists = fileExists(targetPath);

    if (file_exists) {
      const targetDocument = await workspace.openTextDocument(targetPath);
      const targetPosition = this.findFunctionDefinition(
        targetDocument,
        convertToClassName(text_element)
      );
      return Promise.resolve(
        new Location(
          Uri.file(targetPath),
          new Range(targetPosition, targetPosition)
        )
      );
    }
    return null;
  }
}
export class VirtualDocumentProvider
  extends Provider<Uri>
  implements TextDocumentContentProvider
{
  onDidChangeEmitter = new EventEmitter<Uri>();
  onDidChange = this.onDidChangeEmitter.event;
  initializeEventHandlers() {
    this.onDidChange((uri) => {
      //
      console.log("Document has changed");
    });
  }
  provideTextDocumentContent() {
    const dummyText = "# Loading documentation...";
    return dummyText;
  }
}
