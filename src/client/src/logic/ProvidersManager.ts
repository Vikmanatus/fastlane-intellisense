import { ExtensionContext, languages } from "vscode";
import {
  ActionCompletionProvider,
  ActionDefinitionProvider,
  DocHoverProvider,
  VirtualDocumentProvider,
} from "../providers";
import Provider from "./Provider";

interface ProviderClassesInterface {
  [key: string]: typeof Provider;
}

interface ProviderTypes {
  actionCompletion: ActionCompletionProvider;
  docHover: DocHoverProvider;
  actionDefinition: ActionDefinitionProvider;
  virtualDocument: VirtualDocumentProvider;
}

interface ProviderInterface {
  [key: string]: Provider;
}

export enum PROVIDERS {
  actionCompletion = "actionCompletion",
  docHover = "docHover",
  actionDefinition = "actionDefinition",
  virtualDocument = "virtualDocument",
}

class ProvidersManager {
  static _instance?: ProvidersManager | null = null;
  private readonly providerClasses: ProviderClassesInterface;
  private readonly providers: ProviderInterface;
  constructor() {
    this.providerClasses = {
      [PROVIDERS.actionCompletion]: ActionCompletionProvider,
      [PROVIDERS.actionDefinition]: ActionDefinitionProvider,
      [PROVIDERS.docHover]: DocHoverProvider,
      [PROVIDERS.virtualDocument]: VirtualDocumentProvider,
    };
    this.providers = {};
  }

  static getInstance() {
    if (!ProvidersManager._instance) {
      ProvidersManager._instance = new ProvidersManager();
    }
    return ProvidersManager._instance;
  }

  getProviders(...services: PROVIDERS[]): ProviderTypes {
    return Object.values(services).reduce((acc, serviceName: string) => {
      const service = this.getProvider(serviceName);
      if (service) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        acc[serviceName] = service;
      }

      return acc;
    }, {} as ProviderTypes);
  }

  getProvider(key: string) {
    let instance = this.providers[key];
    if (instance) {
      return instance;
    }

    if (key in this.providerClasses) {
      instance = new this.providerClasses[key]();
      this.providers[key] = instance;
      return instance;
    }

    return null;
  }

  initProvider(providerName: string): Promise<boolean> | boolean {
    const provider = this.getProvider(providerName);

    if (!provider) {
      return false;
    }
    const promise = provider.init();
    return promise;
  }
  registerProviders(context: ExtensionContext) {
    for (const providerName in this.providerClasses) {
      const provider = this.getProvider(providerName);
      if (provider) {
        provider.registerProvider(context);
      }
    }
  }
  public init() {
    const promises = [];
    // Firstly we will simply setup the providers
    // If they have an init method, it will be runned to setup all the required provider logic
    // After that, we will launch another function to setup and push the provider inside the context of the extension
    for (const providerName in this.providerClasses) {
      const provider = this.initProvider(providerName);
      if (provider !== false) {
        promises.push(provider);
      }
    }
    console.log("going to return promises");
    return Promise.all(promises).then((results) => {
      console.log({ results });
    });
  }
}

ProvidersManager._instance = null;

export default ProvidersManager;
