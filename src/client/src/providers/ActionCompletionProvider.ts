import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  CompletionList,
  MarkdownString,
  Position,
  ProviderResult,
  SnippetString,
  TextDocument,
  TextEdit,
} from "vscode";

class ActionDefinitionProvider implements CompletionItemProvider {
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
    const parsedArgs = this.parseArgs(linePrefix);
    if (parsedArgs.length) {
      console.log({ parsedArgs });
    }
    if (!linePrefix.endsWith("slack(")) {
      return null;
    }

    // if it does, provide your completion items
    const basicArgs = [
      this.generateArgument("url"),
      this.generateArgument("message"),
    ];

    return basicArgs;
  }
  generateArgument(argName: string): CompletionItem {
    const arg = new CompletionItem(argName, CompletionItemKind.Property);
    arg.insertText = new SnippetString(
      argName + ': ${1:"your_' + argName + '"}'
    );
    arg.documentation = new MarkdownString("Inserts the url argument");
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

export default ActionDefinitionProvider;
