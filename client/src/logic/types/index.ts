import {
  DocHoverProvider,
  GoDefinitionProvider,
  VirtualDocumentProvider,
} from "../../providers";
import Provider from "../Provider";

export interface ProviderClassMap {
  [key: string]: typeof Provider;
}
export interface ProvidersTypes {
  docHover: DocHoverProvider;
  definition: GoDefinitionProvider;
  virtualDoc: VirtualDocumentProvider;
}

export enum PROVIDERS {
  doc = "docHoverProvider",
  definition = "definitionProvider",
  virtualDoc = "virtualDocProvider",
}
export interface ProviderMap {
  [key: string]: Provider;
}
export interface OnInitObject {
  resolved: boolean;
  promise?: Promise<void>;
  resolve?: () => void;
}
export type ProvidersInstances = {
  key: PROVIDERS;
  provider: Provider;
};
export interface OnInitMap {
  [key: string]: OnInitObject;
}

export type AnyFunction = (...args: any[]) => any;
export type ProvidersConfigMap = {
  registerMethod: AnyFunction;
  providerKey: PROVIDERS;
  providerInstance: Provider;
  args?: any;
};
