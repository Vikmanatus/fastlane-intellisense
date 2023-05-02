import {
  ActionCompletionProvider,
  ActionDefinitionProvider,
  DocHoverProvider,
} from "../providers";
import Provider from "./Provider";

interface ProviderClassesInterface {
  [key: string]: typeof Provider;
}

interface ProviderTypes {
  actionCompletion: ActionCompletionProvider;
  docHover: DocHoverProvider;
  actionDefinition: ActionDefinitionProvider;
}

interface ProviderInterface {
  [key: string]: Provider;
}

export enum PROVIDERS {
  actionCompletion = "actionCompletion",
  docHover = "docHover",
  actionDefinition = "actionDefinition",
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
    };
    this.providers = {};
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

  initProvider(serviceName: string): Promise<boolean> | boolean {
    const provider = this.getProvider(serviceName);

    if (!provider) {
      return false;
    }
    const promise = provider.init();
    return promise;
  }
  
  public init() {
    const promises = [];

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

  static getInstance() {
    if (!ProvidersManager._instance) {
      ProvidersManager._instance = new ProvidersManager();
    }
    return ProvidersManager._instance;
  }
}

ProvidersManager._instance = null;

export default ProvidersManager;
