import { TextDocument } from "vscode-languageserver-textdocument";
import {
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Definition,
  MarkupKind,
  createConnection,
  Connection,
} from "vscode-languageserver/node";
import ServerHelper from "./ServerHelper";
export interface ExampleSettings {
  maxNumberOfProblems: number;
}
class Server extends ServerHelper {
  public connection: Connection | null;
  public hasConfigurationCapability: boolean | null;
  public hasWorkspaceFolderCapability: boolean | null;
  public hasDiagnosticRelatedInformationCapability: boolean | null;
  public documents: TextDocuments<TextDocument> | null;
  public globalSettings: ExampleSettings | null;
  public documentSettings: Map<string, Thenable<ExampleSettings>> | null;

  constructor() {
    super();
    this.connection = null;
    this.hasConfigurationCapability = null;
    this.hasWorkspaceFolderCapability = null;
    this.hasDiagnosticRelatedInformationCapability = null;
    this.documents = null;
    this.globalSettings = null;
    this.documentSettings = null;
  }

  public init(): boolean {
    this.connection = createConnection(ProposedFeatures.all);
    this.documents = new TextDocuments(TextDocument);
    this.globalSettings = { maxNumberOfProblems: 1000 };
    this.documentSettings =  new Map();
    return true;
  }
}

export default Server;
