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

class Manager {
	protected connection: Connection;
	protected documentsManager: TextDocuments<TextDocument>;
	protected hasConfigurationCapability: boolean;
	protected hasWorkspaceFolderCapability: boolean;
	protected hasDiagnosticRelatedInformationCapability: boolean;
}

export default Manager;