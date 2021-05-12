class ModuleCache {
  constructor(private moduleCache: Record<string, object> = {}) {}

  public get(key: string) {
    return this.moduleCache[key];
  }

  public set(key: string, module: object) {
    this.moduleCache[key] = module;
  }

  public reset() {
    this.moduleCache = {};
  }

  public remove(key: string) {
    delete this.moduleCache[key];
  }
}

const singletonModuleCacheInstance = new ModuleCache();

export default singletonModuleCacheInstance;
