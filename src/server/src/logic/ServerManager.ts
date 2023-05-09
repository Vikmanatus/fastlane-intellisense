import { TextDocument } from "vscode-languageserver-textdocument";
import {
  Connection,
  DidChangeConfigurationNotification,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocumentSyncKind,
  TextDocuments,
  createConnection,
} from "vscode-languageserver/node";

class ServerManager {
  private connection: Connection;
  private documentsManager: TextDocuments<TextDocument>;
  private hasConfigurationCapability: boolean;
  private hasWorkspaceFolderCapability: boolean;
  private hasDiagnosticRelatedInformationCapability: boolean;
  constructor() {
    this.connection = createConnection(ProposedFeatures.all);
    this.documentsManager = new TextDocuments(TextDocument);
    this.hasConfigurationCapability = false;
    this.hasWorkspaceFolderCapability = false;
    this.hasDiagnosticRelatedInformationCapability = false;
  }

  addServerHandlers() {}

  private onInitializeHandler() {
    this.connection.onInitialize((params: InitializeParams) => {
      const capabilities = params.capabilities;

      // Does the client support the `workspace/configuration` request?
      // If not, we fall back using global settings.
      this.hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
      );
      this.hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
      );
      this.hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
      );

      const result: InitializeResult = {
        capabilities: {
          textDocumentSync: TextDocumentSyncKind.Incremental,
          definitionProvider: true,
          // Tell the client that this server supports code completion.
          completionProvider: {
            resolveProvider: true,
          },
        },
      };
      if (this.hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
          workspaceFolders: {
            supported: true,
          },
        };
      }
      return result;
    });
    this.connection.onInitialized(() => {
      if (this.hasConfigurationCapability) {
        // Register for all configuration changes.
        this.connection.client.register(
          DidChangeConfigurationNotification.type,
          undefined
        );
      }
      if (this.hasWorkspaceFolderCapability) {
        this.connection.workspace.onDidChangeWorkspaceFolders((_event) => {
          this.connection.console.log(
            "Workspace folder change event received."
          );
        });
      }
    });
  }
}

export default ServerManager;
