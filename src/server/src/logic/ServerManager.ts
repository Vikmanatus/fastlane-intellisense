import Server from './Server';
import ServerConnectionHandlers from './ServerConnectionHandlers';
import ServerHelper from './ServerHelper';

interface ServerHelperClassesInterface {
	[key: string]: typeof ServerHelper;
  }
  
  interface ServerHelperTypes {
	server: Server;
	serverConnectionHandlers: ServerConnectionHandlers;
  }
  
  interface ServerHelperInterface {
	[key: string]: ServerHelper;
  }
  
  export enum SERVER_HELPERS {
	server = "server",
	serverConnectionHandlers = "serverConnectionHandlers",
  }

class ServerManager {
  static _instance?: ServerManager | null = null;
  private readonly serverHelpersClasses: ServerHelperClassesInterface;
  private readonly serverHelpers: ServerHelperInterface;
  constructor() {
    this.serverHelpersClasses = {
      [SERVER_HELPERS.server]: Server,
      [SERVER_HELPERS.serverConnectionHandlers]: ServerConnectionHandlers,
    };
    this.serverHelpers = {};
  }

  static getInstance() {
    if (!ServerManager._instance) {
      ServerManager._instance = new ServerManager();
    }
    return ServerManager._instance;
  }

  getServerHelpers(...helpers: SERVER_HELPERS[]): ServerHelperTypes {
    return Object.values(helpers).reduce((acc, serviceName: string) => {
      const service = this.getServerHelper(serviceName);
      if (service) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        acc[serviceName] = service;
      }

      return acc;
    }, {} as ServerHelperTypes);
  }

  getServerHelper(key: string) {
    let instance = this.serverHelpers[key];
    if (instance) {
      return instance;
    }

    if (key in this.serverHelpersClasses) {
      instance = new this.serverHelpersClasses[key]();
      this.serverHelpers[key] = instance;
      return instance;
    }

    return null;
  }

  initServerHelper(helperName: string): Promise<boolean> | boolean {
    const helper = this.getServerHelper(helperName);

    if (!helper) {
      return false;
    }
    const promise = helper.init();
    return promise;
  }
  public init() {
    const promises = [];
    // Firstly we will simply setup the providers
    // If they have an init method, it will be runned to setup all the required provider logic
    // After that, we will launch another function to setup and push the provider inside the context of the extension
    for (const providerName in this.serverHelpersClasses) {
      const provider = this.initServerHelper(providerName);
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

export default ServerManager;