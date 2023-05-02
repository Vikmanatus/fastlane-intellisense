console.warn("EXTENSION FILE RUNNING");

import * as path from "path";
import {
  workspace,
  ExtensionContext,
  languages,
  window,
  commands,
  Disposable,
} from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

// import * as dotenv from "dotenv";
import {
  DocHoverProvider,
  ActionDefinitionProvider,
  VirtualDocumentProvider,
  ActionCompletionProvider
} from "./providers";
import { CommandsManager } from "./logic/CommandsManager";

// dotenv.config({ path: path.join(__dirname, "../.env") });

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const commandManagerInstance = new CommandsManager();
  commandManagerInstance.init();
  const serverPath = path.join("dist", "server.js");
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(serverPath);
  context.subscriptions.push(
    languages.registerDefinitionProvider(
      { scheme: "file", language: "ruby" },
      new ActionDefinitionProvider()
    )
  );
  context.subscriptions.push(
    languages.registerHoverProvider(
      { language: "ruby", scheme: "file" },
      new DocHoverProvider()
    )
  );

  const virtualDocProvider = new VirtualDocumentProvider();

  const virtualProviderRegistration = Disposable.from(
    workspace.registerTextDocumentContentProvider(
      VirtualDocumentProvider.scheme,
      virtualDocProvider
    )
  );
  context.subscriptions.push(virtualDocProvider, virtualProviderRegistration);
  const actionCompletionProvider = new ActionCompletionProvider();
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      "ruby",
      actionCompletionProvider,
      ...["(", ","]
    )
  );
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

  commandManagerInstance.getCommandList().forEach((element) => {
    context.subscriptions.push(
      commands.registerCommand(element.command, element.commandHandler)
    );
  });

  client.start();
  window.showInformationMessage("My extension is now active!");
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
