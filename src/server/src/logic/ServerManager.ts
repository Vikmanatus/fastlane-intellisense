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
  private readonly providerClasses: ServerHelperClassesInterface;
  private readonly providers: ServerHelperInterface;
  constructor() {
    this.providerClasses = {
      [SERVER_HELPERS.server]: Server,
      [SERVER_HELPERS.serverConnectionHandlers]: ServerConnectionHandlers,
    };
    this.providers = {};
  }

  static getInstance() {
    if (!ServerManager._instance) {
      ServerManager._instance = new ServerManager();
    }
    return ServerManager._instance;
  }
}

export default ServerManager;