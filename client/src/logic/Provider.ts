import { Event, EventEmitter, Uri } from 'vscode';

class Provider<T=any> {

	public onDidChangeEmitter:  EventEmitter<T>;
	public onDidChange:Event<T>;
	// protected providersConfigMap:ProvidersConfigMap[] = [{providerKey: PROVIDERS.definition, registerMethod:languages.registerDefinitionProvider }];

}

export default Provider;