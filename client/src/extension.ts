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
} from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

import {
  setupConfigCommmandHandler,
  setupVirtualDocumentCommandHandler,
} from "./helpers/commands";
import * as dotenv from "dotenv";
import {
  GoDefinitionProvider,
  VirtualDocumentProvider,
} from "./providers";

dotenv.config({ path: path.join(__dirname, "../.env") });

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js")
  );
  context.subscriptions.push(
    languages.registerDefinitionProvider(
      { scheme: "file", language: "ruby" },
      new GoDefinitionProvider()
    )
  );
  const myScheme = "fastlane-intellisense";
  context.subscriptions.push(
    workspace.registerTextDocumentContentProvider(
      myScheme,
      new VirtualDocumentProvider()
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
  const setupConfigCommand = setupConfigCommmandHandler();
  const virtualDocCommand = setupVirtualDocumentCommandHandler();
  context.subscriptions.push(
    commands.registerCommand(
      setupConfigCommand.command,
      setupConfigCommand.commandHandler
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      virtualDocCommand.command,
      virtualDocCommand.commandHandler
    )
  );
  client.start();
  window.showInformationMessage("My extension is now active!");
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
