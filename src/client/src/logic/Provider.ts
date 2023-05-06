import { ExtensionContext, Range, TextDocument } from "vscode";

class Provider {
  public init(): Promise<boolean> | boolean {
    return true;
  }
  protected getBlockHeight(block: string): number {
    const matches = block.match(/\n/g);
    // If there are no matches, it means that the block is a single line,
    // so we return 1. Otherwise, we add 1 to the number of matches because
    // there is one more line than there are line breaks.
    return matches ? matches.length + 1 : 1;
  }
  protected matchMultilineSyntax(document: TextDocument, range: Range) {
    const text = document.getText(range);
    console.log(text);
    const regex =
      // eslint-disable-next-line no-useless-escape
      /^\s*[a-z_]+\s*\(\s*((?:\w+\s*:\s*(?:\[[^\]]*\]|\{[^\}]*\}|"[^"]*"|'[^']*'|%w\[[^\]]*\]|\S+)\s*,\s*)+)\s*\)$/gm;
    return text.match(regex);
  }

  public registerProvider(context: ExtensionContext) {
    // Nothing to do
  }
}

export default Provider;
