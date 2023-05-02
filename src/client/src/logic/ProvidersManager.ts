class ProvidersManager {
  static _instance?: ProvidersManager | null = null;
  constructor() {}
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
