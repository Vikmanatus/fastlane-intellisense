import {
  CancellationToken,
  DefinitionProvider,
  EventEmitter,
  Hover,
  HoverProvider,
  Location,
  Position,
  Range,
  TextDocument,
  TextDocumentContentProvider,
  Uri,
  commands,
  workspace,
} from "vscode";
import { convertToClassName, fileExists } from "../helpers/index";
import path = require("path");

export class DocHoverProvider implements HoverProvider {
  provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Hover {
    const range = document.getWordRangeAtPosition(position);
    const word = document.getText(range).trim();
    return {
      contents: [{ value: word, language: "ruby" }],
      range,
    };
  }
}

export class GoDefinitionProvider implements DefinitionProvider {
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
export class VirtualDocumentProvider implements TextDocumentContentProvider {
  onDidChangeEmitter = new EventEmitter<Uri>();
  onDidChange = this.onDidChangeEmitter.event;
  provideTextDocumentContent() {
    return path.join(__dirname, "./extension.ts");
  }
}
