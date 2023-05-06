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
  private actionName: string;
  constructor() {
    super();
    this.multilineBlockLength = 0;
    this.actionName = "";
  }
  public init(): boolean {
    console.log("Initializing ActionCompletionProvider");
    return true;
  }
  public registerProvider(context: ExtensionContext): void {
    context.subscriptions.push(
      languages.registerCompletionItemProvider(
        "ruby",
        this,
        ...["(", ",", "\n"]
      )
    );
  }
  private multilineSearch(
    document: TextDocument,
    position: Position,
    context: CompletionContext
  ) {
    const startingLine = position.line - this.multilineBlockLength;
    const endingLine = document.lineCount;
    const range = new Range(startingLine, 0, endingLine, 0);

    const matchMultilineInput = this.matchMultilineSyntax(
      document,
      range,
    );

    if (!matchMultilineInput) {
      return null;
    }

    const functionBlock = matchMultilineInput[0];
    const actionNameMatch = functionBlock.match(/^\s*([a-z_]+)/i);
    const actionName = actionNameMatch ? actionNameMatch[1] : null;

    if (!actionName) {
      return null;
    }

    const multilineArgs = this.parseMultilineArgs(functionBlock);
    // TODO: fix to do - Issue with text range
    this.multilineBlockLength = this.getBlockHeight(functionBlock);
    const isLineBreakRequired = context.triggerCharacter === "," ? true : false;

    return this.getCompletionItems(
      actionName,
      multilineArgs,
      isLineBreakRequired
    );
  }
  private getCompletionItems(
    actionName: string,
    existingArgs: string[],
    isLineBreakRequired = false
  ) {
    const actionElement = this.findActionByName(actionName);

    if (!actionElement) {
      return null;
    }

    const actionArgs = actionElement.args;
    if (!actionArgs) {
      return null;
    }
    const remainingArgs = actionArgs.filter(
      (arg) => !existingArgs.includes(arg.key)
    );
    const completionItems = remainingArgs.map((arg) =>
      this.generateArgument(arg, isLineBreakRequired)
    );
    return completionItems;
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
    this.actionName = extractedActionName;

    this.multilineBlockLength = existingArgs.length;
    return this.getCompletionItems(extractedActionName, existingArgs);
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
  private handleConfigDefaultValue(
    configItem: FastlaneConfigType,
    lineBreakRequired = false
  ) {
    const lineBreak = lineBreakRequired ? "\n" : "";
    let defaultValue =
      lineBreak + configItem.key + ': ${1:"your_' + configItem.key + '"}';

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
            lineBreak +
            configItem.key +
            ': ${1:"' +
            configItem.default_value +
            '"}';
        }
        break;
      case "Fastlane::Boolean":
      case "Integer":
        if (typeof configItem.default_value !== "undefined") {
          defaultValue =
            lineBreak +
            configItem.key +
            ": ${1:" +
            configItem.default_value +
            "}";
        }
        break;
      case "Array":
        if (Array.isArray(configItem.default_value)) {
          const defaultValueArray = configItem.default_value
            .map((value: string) => `"${value}"`)
            .join(", ");
          defaultValue =
            lineBreak + configItem.key + ": ${1:[" + defaultValueArray + "]}";
          break;
        }
        defaultValue = lineBreak + configItem.key + ": ${1:[]}";
        break;
    }
    return new SnippetString(defaultValue);
  }
  generateArgument(
    fastalneArg: FastlaneConfigType,
    lineBreakRequired = false
  ): CompletionItem {
    // Issue with fastalneArg.data_type "String" when string template "your_value" is displayed the linebreak is not triggered
    const argName = fastalneArg.key;
    const arg = new CompletionItem(argName, CompletionItemKind.Property);
    const defaultValues = this.handleConfigDefaultValue(
      fastalneArg,
      lineBreakRequired
    );
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
