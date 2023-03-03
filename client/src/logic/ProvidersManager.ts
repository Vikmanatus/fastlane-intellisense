import { languages, workspace } from "vscode";
import {
  DocHoverProvider,
  GoDefinitionProvider,
  VirtualDocumentProvider,
} from "../providers";
import Manager from "./Manager";
import Provider from "./Provider";

interface ProviderClassMap {
  [key: string]: typeof Provider;
}
interface ProvidersTypes {
  docHover: DocHoverProvider;
  definition: GoDefinitionProvider;
  virtualDoc: VirtualDocumentProvider;
}

export enum PROVIDERS {
  doc = "docHoverProvider",
  definition = "definitionProvider",
  virtualDoc = "virtualDocProvider",
}
interface ProviderMap {
  [key: string]: Provider;
}
interface OnInitObject {
  resolved: boolean;
  promise?: Promise<void>;
  resolve?: () => void;
}
export type ProvidersInstances = {
  key: PROVIDERS;
  provider: Provider;
};
interface OnInitMap {
  [key: string]: OnInitObject;
}

type AnyFunction = (...args: any[]) => any;
type ProvidersConfigMap = {
  registerMethod: AnyFunction;
  providerKey: PROVIDERS;
  providerInstance: Provider;
  args?: any;
};
class ProvidersManager {
  static _instance?: ProvidersManager | null = null;
  private readonly providerClasses: ProviderClassMap;

  constructor() {
    this.providerClasses = {
      [PROVIDERS.definition]: GoDefinitionProvider,
      [PROVIDERS.doc]: DocHoverProvider,
      [PROVIDERS.virtualDoc]: VirtualDocumentProvider,
    };
  }
  getProvider(providerName: string): ProvidersConfigMap {
    const instance = new this.providerClasses[providerName]();
    switch (providerName) {
      case PROVIDERS.definition.toString():
        return {
          registerMethod: languages.registerDefinitionProvider,
          providerKey: PROVIDERS.definition,
          providerInstance: instance,
          args: { scheme: "file", language: "ruby" },
        };
      case PROVIDERS.doc.toString():
        return {
          registerMethod: languages.registerHoverProvider,
          providerKey: PROVIDERS.doc,
          providerInstance: instance,
          args: { language: "ruby", scheme: "file" },
        };
      case PROVIDERS.virtualDoc.toString():
        return {
          registerMethod: workspace.registerTextDocumentContentProvider,
          providerKey: PROVIDERS.virtualDoc,
          providerInstance: instance,
          args: "fastlane-intellisense-doc",
        };
    }
  }

  public init(): ProvidersConfigMap[] {
    const providersInstances: ProvidersConfigMap[] = [];
    // Nothing to do for the moment
    for (const providerName in this.providerClasses) {
      providersInstances.push(this.getProvider(providerName));
    }
    return providersInstances;
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
