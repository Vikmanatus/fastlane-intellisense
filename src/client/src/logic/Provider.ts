import { ExtensionContext } from "vscode";

class Provider {
  public init(): Promise<boolean> | boolean {
    return true;
  }

  public registerProvider(context: ExtensionContext) {
    // Nothing to do
  }
}

export default Provider;
