/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from "path";
import {
  workspace,
  ExtensionContext,
  languages,
  DocumentSymbolProvider,
  TextDocument,
  CancellationToken,
  SymbolInformation,
  SymbolKind,
  DefinitionProvider,
  Location,
  Position,
  Range,
} from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;
class GoDefinitionProvider implements DefinitionProvider {
  public provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Thenable<Location> {
    // const text_element = document.getText({
    //   start: { line: position.line,character:position.character },
    // } as Range);
    const text_element = document.getText();
    const test="hello";
    if (text_element !== "get_version_number") {
      return null;
    }
    // return Promise.resolve({
    //   range: { start: { line: 0 } },
    //   uri: {
    //     fsPath:
    //       "/Users/vikmanatus/.rvm/gems/ruby-2.7.5/gems/fastlane-2.212.1/fastlane/lib/fastlane/actions/get_version_number.rb",
    //   },
    // } as Location);
    return null;
  }
}
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

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
