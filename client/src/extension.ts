/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

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

import * as dotenv from "dotenv";
import {
  DocHoverProvider,
  ActionDefinitionProvider,
  VirtualDocumentProvider,
} from "./providers";
import { CommandsManager } from "./logic/CommandsManager";

dotenv.config({ path: path.join(__dirname, "../.env") });

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const commandManagerInstance = new CommandsManager();
  commandManagerInstance.init();

  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js")
  );
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
  const myScheme = "fastlane-intellisense-doc";
  const virtualDocProvider = new VirtualDocumentProvider();
  // context.subscriptions.push(
  //   workspace.registerTextDocumentContentProvider(myScheme, virtualDocProvider)
  // );
  const virtualProviderRegistration = Disposable.from(
    workspace.registerTextDocumentContentProvider(myScheme, virtualDocProvider)
  );
  context.subscriptions.push(virtualDocProvider,virtualProviderRegistration);
  // virtualDocProvider.onDidChange((uri) => {
  //   const uriInfo = uri;
  //   console.log("On did change event fired");
  // });
  // virtualDocProvider.onDidChangeEmitter.fire(Uri.parse("test-fake-uri"));
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
