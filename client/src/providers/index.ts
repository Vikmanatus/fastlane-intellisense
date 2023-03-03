import {
  CancellationToken,
  DefinitionProvider,
  EventEmitter,
  Hover,
  HoverProvider,
  Location,
  MarkdownString,
  Position,
  Range,
  TextDocument,
  TextDocumentContentProvider,
  Uri,
  workspace,
} from "vscode";
import { convertToClassName, fileExists } from "../helpers/index";
import Provider from '../logic/Provider';

export class DocHoverProvider extends Provider implements HoverProvider {
  provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Hover {
    const range = document.getWordRangeAtPosition(position);
    const word = document.getText(range).trim();
    const searchCommandUri = Uri.parse(
      `command:fastlane-intellisense.openTextDoc`
    );
    const contents = new MarkdownString(
      `[Open doc for: ${word}](${searchCommandUri})`
    );
    contents.isTrusted = true;
    return {
      contents: [contents],
      range,
    };
  }
}

export class GoDefinitionProvider extends Provider implements DefinitionProvider {
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
export class VirtualDocumentProvider extends Provider implements TextDocumentContentProvider {
  onDidChangeEmitter = new EventEmitter<Uri>();
  onDidChange = this.onDidChangeEmitter.event;
  provideTextDocumentContent() {
    const dummyText = `
# Lorem ipsum

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris egestas sollicitudin nibh ut mollis. Vestibulum lacinia sapien sapien, id congue massa dictum in. Vivamus viverra condimentum justo, eget lacinia metus hendrerit vitae. Pellentesque pretium blandit lacus et laoreet. Nunc in mollis est, eu eleifend mauris. Quisque ultricies dictum libero, sit amet tempor augue viverra sit amet. Mauris imperdiet, odio eget sagittis ultricies, nisl orci faucibus nisi, in eleifend nunc purus nec eros. Vivamus sit amet mattis enim. Donec sodales felis sem, ac mollis orci laoreet at. Nulla sit amet arcu finibus, pretium justo eget, malesuada ex. Quisque porttitor ipsum eget justo luctus volutpat. Maecenas at tortor at mauris rhoncus laoreet. In porttitor vulputate dolor in blandit.

Sed sit amet ligula nisi. Nunc tincidunt arcu vitae efficitur pellentesque. Pellentesque condimentum hendrerit pellentesque. Nam vel tempor risus, non fringilla nulla. Proin mollis nisi eget elit aliquet posuere. Quisque eu sem dolor. Curabitur fermentum diam nisl, ac imperdiet nunc finibus eget. Nam gravida imperdiet justo. Duis varius nunc sit amet urna pulvinar dapibus. Nunc sapien nisi, molestie id odio nec, semper consequat diam. Sed purus mi, laoreet ullamcorper congue nec, dapibus vel elit. Curabitur sed eros vitae leo sodales bibendum.
`;
    return dummyText;
  }
}
