import * as path from "path";
import { workspace, ExtensionContext, window } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

// import * as dotenv from "dotenv";
import ProvidersManager from "./logic/ProvidersManager";

// dotenv.config({ path: path.join(__dirname, "../.env") });

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const serverPath = path.join("dist", "server.js");
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(serverPath);

  const providersManager = new ProvidersManager();

  providersManager
    .init()
    .then(() => {
      providersManager.registerProviders(context);
      // If the extension is launched in debug mode then the debug server options are used
      // Otherwise the run options are used
      const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
          module: serverModule,
          transport: TransportKind.ipc,
        },
      };
      // Options to control the language client
      const clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: "file", language: "ruby" }],
        synchronize: {
          // Notify the server about file changes to '.clientrc files contained in the workspace
          fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
        },
      };

      // Create the language client and start the client.
      client = new LanguageClient(
        "languageServerExample",
        "Language Server Example",
        serverOptions,
        clientOptions
      );

      client.start();
      window.showInformationMessage("My extension is now active!");
    })
    .catch((err) => {
      window.showErrorMessage("Extension failed to load.");
      client.stop();
    });
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
