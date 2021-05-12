class ModuleCache {
  constructor(private assetCache: Record<string, object> = {}) {}

  public get(key: string) {
    return this.assetCache[key];
  }

  public set(key: string, module: object) {
    this.assetCache[key] = module;
  }

  public reset() {
    this.assetCache = {};
  }

  public remove(key: string) {
    delete this.assetCache[key];
  }
}

const singletonModuleCacheInstance = new ModuleCache();

export default singletonModuleCacheInstance;
