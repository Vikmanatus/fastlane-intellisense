import {
  CancellationToken,
  DefinitionProvider,
  ExtensionContext,
  Location,
  Position,
  Range,
  TextDocument,
  Uri,
  languages,
  workspace,
} from "vscode";
import Provider from "../logic/Provider";
import { convertToClassName } from "../helpers";
import { actions_list } from "@/shared/src/config";

class ActionDefinitionProvider extends Provider implements DefinitionProvider {
  private actionDefinitionMap: Map<string, string>;

  constructor() {
    super();
    this.actionDefinitionMap = new Map();
  }
  public init(): boolean {
    console.log("Initializing ActionDefinitionProvider");
    if (actions_list.length > 0) {
      for (const action of actions_list) {
        this.actionDefinitionMap.set(action.action_name, action.file_path);
      }
    }

    return true;
  }
  public registerProvider(context: ExtensionContext): void {
    context.subscriptions.push(
      languages.registerDefinitionProvider(
        { scheme: "file", language: "ruby" },
        this
      )
    );
  }
  private findFunctionDefinition(document: TextDocument, actionName: string) {
    const regex = new RegExp(`\\b${actionName}\\b`, "i");
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const match = line.text.match(regex);
      if (match?.index) {
        return new Position(i, match.index);
      }
    }
    return null;
  }
  public async provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ) {
    // TODO: need to escape parenthesis inside text_element
    const range = document.lineAt(position).range;
    const text_element = document.getText(range).trim();
    // TODO: Fix path handling with path provided in actions list
    const actionPath = this.actionDefinitionMap.get(text_element);

    if (actionPath) {
      const targetDocument = await workspace.openTextDocument(actionPath);
      const targetPosition = this.findFunctionDefinition(
        targetDocument,
        convertToClassName(text_element)
      );
      if (!targetPosition) {
        return null;
      }
      return Promise.resolve(
        new Location(
          Uri.file(actionPath),
          new Range(targetPosition, targetPosition)
        )
      );
    }
    return null;
  }
}

export default ActionDefinitionProvider;
