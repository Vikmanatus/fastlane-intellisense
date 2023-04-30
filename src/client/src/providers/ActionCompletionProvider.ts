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
    if (!linePrefix.endsWith("slack(")) {
      return null;
    }
    // if it does, provide your completion items
    const arg1 = new CompletionItem("url", CompletionItemKind.Property);
    arg1.insertText = new SnippetString("url:${1:url}");
    arg1.documentation = new MarkdownString("Inserts the url argument");

    const arg2 = new CompletionItem("message", CompletionItemKind.Property);
    arg2.insertText = new SnippetString("message:${1:message}");
    arg2.documentation = new MarkdownString("Inserts the message argument");

    return [arg1, arg2];
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
