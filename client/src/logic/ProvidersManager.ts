import {
  DocHoverProvider,
  GoDefinitionProvider,
  VirtualDocumentProvider,
} from "../providers";
import Manager from "./Manager";
import Provider from './Provider';

interface ProviderClassMap {
  [key: string]: typeof Provider;
}
interface ProvidersTypes {
  docHover: DocHoverProvider;
  definition: GoDefinitionProvider;
  virtualDoc: VirtualDocumentProvider;
}

enum PROVIDERS {
  doc = "docHoverProvider",
  definition = "definitionProvider",
  virtualDoc = "virtualDocProvider",
}
// interface ProviderMap {
//   [key: string]: Manager;
// }
interface OnInitObject {
  resolved: boolean;
  promise?: Promise<void>;
  resolve?: () => void;
}

interface OnInitMap {
  [key: string]: OnInitObject;
}
class ProvidersManager {
  static _instance?: ProvidersManager | null = null;
  private readonly providerClasses: ProviderClassMap;
  constructor() {
    this.providerClasses = {
      [PROVIDERS.definition]:GoDefinitionProvider,

    };
  }
  public init(): void {
    // Nothing to do for the moment
  }

  static getInstance() {
    if (!ProvidersManager._instance) {
      ProvidersManager._instance = new ProvidersManager();
    }
    return ProvidersManager._instance;
  }
}

ProvidersManager._instance = null;

export default ProvidersManager;
