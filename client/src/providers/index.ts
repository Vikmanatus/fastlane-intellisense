import {
  CancellationToken,
  DefinitionProvider,
  Disposable,
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
import { convertToClassName, fileExists } from "../helpers/index";
import Provider from "../logic/Provider";
// import DocumentationProvider from "./DocumentationProvider";

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
  extends Provider
  implements TextDocumentContentProvider
{
  private _onDidChange = new EventEmitter<Uri>();
  private _subscriptions: Disposable;
  // private _documents = new Map<string, DocumentationProvider>();
  private docContent: string[];

  constructor() {
    super();
    // this._subscriptions = workspace.onDidChangeTextDocument(doc => {
    //   const documentInfo = doc;
    //   console.log("doc closed");
    // });
    this.docContent = [];
    this.docContent.push("# Loading documentation");
  }
  dispose() {
    this._subscriptions.dispose();
    // this._documents.clear();
    this._onDidChange.dispose();
  }
  pauseForThreeSeconds(): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.docContent.push("Fake placeholder doc");
        resolve(this.docContent);
      }, 5000);
    });
  }

  /**
   * Envent handler used to fetch the documentation of the fastlane action desired by the user
   */
  get onDidChange() {
    return this._onDidChange.event((uri) => {
      console.log("_onDidChange event fired !");
      this.pauseForThreeSeconds().then(() => {
        console.log("fake promise should resolve");
        const parsedUri = uri.toString();
        return this.provideTextDocumentContent(
          uri,
          {} as CancellationToken,
          "UPDATE DOC"
        );
      });
    }).dispose;
  }

  /**
   * Provide the text for the virtual document
   * @param uri
   * @returns A string containing a placeholder text while we fetch the documentation
   */
  provideTextDocumentContent(
    uri: Uri,
    _token: CancellationToken,
    documentationInfo?: string
  ) {
    console.log("going to return value");
    return this.docContent.join("\n");
  }
}
