import { FastlaneConfigType, actions_list } from "@/shared/src/config";
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
    const slackPattern = /slack\s*\(\s*([^)]*)$/;
    const match = linePrefix.match(slackPattern);

    if (!match) {
      return null;
    }

    const existingArgsLine = match[1];
    const existingArgs = this.parseArgs(existingArgsLine);
    console.log({ existingArgs });
    const actionPattern =
      /(\b[a-z]+(?:_[a-z]+)*\b)(?=\s*\(|\s*\(\s*\)|\s*\(\s*\w+\s*:\s*\w+\s*(?:,\s*\w+\s*:\s*\w+\s*)*\)|$)/;

    const matchActionName = actionPattern.exec(linePrefix.trim());
    if (!matchActionName || matchActionName.length < 1) {
      console.log({ matchActionName });
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
    console.log("returning items", completionItems);
    return completionItems;
  }
  private handleConfigDefaultValue(
    configItem: FastlaneConfigType
  ): SnippetString {
    switch (configItem.data_type) {
      case "String":
        if (configItem.default_value) {
          return new SnippetString(
            configItem.key + ': ${1:"' + configItem.default_value + '"}'
          );
        }
        return new SnippetString(
          configItem.key + ': ${1:"your_' + configItem.key + '"}'
        );

      default:
        return new SnippetString(
          configItem.key + ': ${1:"your_' + configItem.key + '"}'
        );
    }
  }
  generateArgument(fastalneArg: FastlaneConfigType): CompletionItem {
    const argName = fastalneArg.key;
    const arg = new CompletionItem(argName, CompletionItemKind.Property);
    if (fastalneArg.data_type) {
      arg.insertText = this.handleConfigDefaultValue(fastalneArg);
    } else {
      arg.insertText = new SnippetString(
        argName + ': ${1:"your_' + argName + '"}'
      );
    }

    if (fastalneArg.description) {
      arg.documentation = new MarkdownString(fastalneArg.description);
    }

    //arg.sortText = '00' + argName; // this will put your arguments first
    arg.filterText = argName + ': ${1:"your_' + argName + '"}';

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
