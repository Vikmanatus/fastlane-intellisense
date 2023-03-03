import { languages, workspace } from "vscode";
import {
  DocHoverProvider,
  GoDefinitionProvider,
  VirtualDocumentProvider,
} from "./providers";

import { PROVIDERS, ProviderClassMap, ProvidersConfigMap } from './types';


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
    console.log("inside getProvider");
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
  private initializeEventHandlers(name:string){
    const instance = new this.providerClasses[name]();
    if(instance.initializeEventHandlers && typeof instance.initializeEventHandlers === "function"){
      instance.initializeEventHandlers();
    }
  }
  public init(): ProvidersConfigMap[] {
    const providersInstances: ProvidersConfigMap[] = [];
    // Nothing to do for the moment
    for (const providerName in this.providerClasses) {
      this.initializeEventHandlers(providerName);
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
