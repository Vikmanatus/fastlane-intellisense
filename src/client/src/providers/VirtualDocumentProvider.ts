import {
  CancellationToken,
  Disposable,
  EventEmitter,
  TextDocumentContentProvider,
  Uri,
  workspace,
} from "vscode";
import DocumentationProvider from "./DocumentationProvider";
import Provider from "../logic/Provider";

class VirtualDocumentProvider
  extends Provider
  implements TextDocumentContentProvider
{
  static scheme = "fastlane-intellisense-doc";
  private _onDidChange = new EventEmitter<Uri>();
  private _subscriptions: Disposable;
  private _documents = new Map<string, DocumentationProvider>();

  constructor() {
    super();
    this._subscriptions = workspace.onDidCloseTextDocument((_doc) => {
      console.log("doc closed");
    });
  }
  public init(): boolean {
    console.log("Initializing VirtualDocumentProvider");

    return true;
  }
  dispose() {
    this._subscriptions.dispose();
    // this._documents.clear();
    this._onDidChange.dispose();
  }

  /**
   * Envent handler used to fetch the documentation of the fastlane action desired by the user
   */
  get onDidChange() {
    return this._onDidChange.event;
  }

  /**
   * Provide the text for the virtual document
   * @param uri
   * @returns A string containing a placeholder text while we fetch the documentation
   */
  provideTextDocumentContent(uri: Uri, _token: CancellationToken) {
    const doc = this._documents.get(uri.toString());
    if (doc) {
      return doc.value;
    }
    const documentationDoc = new DocumentationProvider(
      uri,
      this._onDidChange,
      uri.query
    );
    this._documents.set(uri.toString(), documentationDoc);
    return documentationDoc.value;
  }
}

export default VirtualDocumentProvider;
