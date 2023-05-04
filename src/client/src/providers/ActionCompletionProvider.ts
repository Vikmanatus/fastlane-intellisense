import { FastlaneConfigType, actions_list } from "@/shared/src/config";
import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  CompletionItemTag,
  CompletionList,
  ExtensionContext,
  MarkdownString,
  Position,
  ProviderResult,
  Range,
  SnippetString,
  TextDocument,
  languages,
} from "vscode";
import Provider from "../logic/Provider";

class ActionCompletionProvider
  extends Provider
  implements CompletionItemProvider
{
  private multilineBlockLength: number;
  constructor() {
    super();
    this.multilineBlockLength = 0;
  }
  public init(): boolean {
    console.log("Initializing ActionCompletionProvider");
    return true;
  }
  public registerProvider(context: ExtensionContext): void {
    context.subscriptions.push(
      languages.registerCompletionItemProvider("ruby", this, ...["(", ",", "\n"])
    );
  }
  private multilineSearch(document: TextDocument, position: Position, context: CompletionContext) {
    const actionNameTest = "slack";
    const regex = new RegExp(
      `\\b${actionNameTest}\\s*\\(\\s*([\\s\\S]*?)\\)`,
      "gm"
    );
    //Math.max(0, position.line - 1)
    // TODO: fix to do - Issue with text range
    const matchMulti = document
      .getText(
        new Range(
          position.line - this.multilineBlockLength,
          0,
          document.lineCount,
          0
        )
      )
      .match(regex);
    console.log({ matchMulti });
    if (!matchMulti) {
      return null;
    }

    const functionBlock = matchMulti[0];
    console.log({ functionBlock });
    const actionNameMatch = functionBlock.match(/^\s*([a-z_]+)/i);
    const actionName = actionNameMatch ? actionNameMatch[1] : null;
    console.log({ actionName });
    if (!actionName) {
      return null;
    }

    const multilineArgs = this.parseMultilineArgs(functionBlock);
    console.log({ multilineArgs });
    const blockHeight = this.getBlockHeight(functionBlock);
    this.multilineBlockLength = blockHeight;
    console.log({ blockHeight });
    const actionElement = actions_list.filter(
      (element) => element.action_name === actionName
    );
    if (!actionElement.length) {
      return null;
    }
    console.log("FOUND MATCHING ELEMENT");
    const actionArgs = actionElement[0].args;
    if (!actionArgs) {
      return null;
    }
    const remainingArgs = actionArgs.filter(
      (arg) => !multilineArgs.includes(arg.key)
    );
    console.log({remainingArgs});
    const completionItems = remainingArgs.map((arg) =>
      this.generateArgument(arg)
    );
      if(context.triggerCharacter){
        console.log("CHARACTER TRIGGERED");
        console.log({triggerCharacter:context.triggerCharacter });
      }
    return completionItems;
  }
  private getBlockHeight(block: string): number {
    const matches = block.match(/\n/g);
    // If there are no matches, it means that the block is a single line,
    // so we return 1. Otherwise, we add 1 to the number of matches because
    // there is one more line than there are line breaks.
    return matches ? matches.length + 1 : 1;
  }
  private singleLineSearch(searchItem: string) {
    const matchAction = /[a-z_]+\s*\(\s*([^)]*)$/;
    const match = searchItem.match(matchAction);

    if (!match) {
      return null;
    }

    const existingArgsLine = match[1];
    const existingArgs = this.parseArgs(existingArgsLine);
    const actionPattern =
      /(\b[a-z]+(?:_[a-z]+)*\b)(?=\s*\(|\s*\(\s*\)|\s*\(\s*\w+\s*:\s*\w+\s*(?:,\s*\w+\s*:\s*\w+\s*)*\)|$)/;

    const matchActionName = actionPattern.exec(searchItem.trim());
    if (!matchActionName || matchActionName.length < 1) {
      return null;
    }
    const extractedActionName = matchActionName[1];
    const actionElement = actions_list.filter(
      (element) => element.action_name === extractedActionName
    );
    if (!actionElement.length) {
      return null;
    }
    const actionArgs = actionElement[0].args;
    if (!actionArgs) {
      return null;
    }
    const remainingArgs = actionArgs.filter(
      (arg) => !existingArgs.includes(arg.key)
    );

    const completionItems = remainingArgs.map((arg) =>
      this.generateArgument(arg)
    );
    console.log({ existingArgs });
    this.multilineBlockLength = existingArgs.length;
    return completionItems;
  }
  provideCompletionItems(
    document: TextDocument,
    position: Position,
    token: CancellationToken,
    context: CompletionContext
  ): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
    // get all text until the `position` and check if it reads `console.`
    // and if so then complete if `log`, `warn`, and `error`
    const linePrefix = document
      .lineAt(position)
      .text.substring(0, position.character);
      let completionItems = this.singleLineSearch(linePrefix);

      if (!completionItems) {
        console.log("going for multiline search");
        completionItems = this.multilineSearch(document, position, context);
      }
    
      // Ensure that we always return an array
      return completionItems ?? [];
  }
  private isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }
  private generateRubyHash(configItem: FastlaneConfigType): string {
    const entries = Object.entries(configItem.default_value as object)
      .map(([key, value]) => `"${key}" => "${value}"`)
      .join(", ");
    return `${configItem.key}: { ${entries} }`;
  }
  private handleConfigDefaultValue(configItem: FastlaneConfigType, lineBreakRequired = false) {
    const lineBreak = lineBreakRequired ? '\n' : '';
    let defaultValue = lineBreak + configItem.key + ': ${1:"your_' + configItem.key + '"}';

    switch (configItem.data_type) {
      case "String":
      case "Hash":
        if (configItem.default_value) {
          if (typeof configItem.default_value === "object") {
            if (this.isEmpty(configItem.default_value)) {
              defaultValue = lineBreak + configItem.key + ": ${1:{}}";
              break;
            }
            defaultValue = lineBreak + this.generateRubyHash(configItem);
            break;
          }
          defaultValue =
          lineBreak + configItem.key + ': ${1:"' + configItem.default_value + '"}';
        }
        break;
      case "Fastlane::Boolean":
      case "Integer":
        if (typeof configItem.default_value !== "undefined") {
          defaultValue =
          lineBreak + configItem.key + ": ${1:" + configItem.default_value + "}";
        }
        break;
      case "Array":
        if (Array.isArray(configItem.default_value)) {
          const defaultValueArray = configItem.default_value
            .map((value: string) => `"${value}"`)
            .join(", ");
          defaultValue = lineBreak + configItem.key + ": ${1:[" + defaultValueArray + "]}";
          break;
        }
        defaultValue = lineBreak + configItem.key + ": ${1:[]}";
        break;
    }
    return new SnippetString(defaultValue);
  }
  generateArgument(fastalneArg: FastlaneConfigType, lineBreakRequired = false): CompletionItem {
    // Issue with fastalneArg.data_type "String" when string template "your_value" is displayed the linebreak is not triggered
    const argName = fastalneArg.key;
    const arg = new CompletionItem(argName, CompletionItemKind.Property);
    const defaultValues = this.handleConfigDefaultValue(fastalneArg, lineBreakRequired);
    arg.insertText = defaultValues;
    if (fastalneArg.description) {
      arg.documentation = new MarkdownString(fastalneArg.description);
      if (fastalneArg.description.match(/\*\*DEPRECATED!\*\*/)) {
        arg.tags = [CompletionItemTag.Deprecated];
      }
    }
    arg.filterText = defaultValues.value;
    return arg;
  }
  parseMultilineArgs(functionBlock: string) {
    const argPattern = /(\w+)\s*:/g;
    let match;
    const args = [];
    while ((match = argPattern.exec(functionBlock)) !== null) {
      args.push(match[1]);
    }
    return args;
  }
  parseArgs(linePrefix: string) {
    const argPattern = /(\w+):/g;
    let match;
    const args = [];
    while ((match = argPattern.exec(linePrefix)) !== null) {
      args.push(match[1]);
    }
    return args;
  }
}

export default ActionCompletionProvider;
