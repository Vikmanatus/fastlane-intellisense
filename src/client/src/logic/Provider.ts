import { ExtensionContext } from "vscode";

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
  public registerProvider(context: ExtensionContext) {
    // Nothing to do
  }
}

export default Provider;
