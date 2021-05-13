import { DepGraph } from '@common/api';

class PackageCache {
  constructor(private packageCache: Record<string, DepGraph> = {}) {}

  public get(key: string) {
    return this.packageCache[key];
  }

  public set(key: string, packageGraph: DepGraph) {
    this.packageCache[key] = packageGraph;
  }

  public reset() {
    this.packageCache = {};
  }

  public remove(key: string) {
    delete this.packageCache[key];
  }
}

const singletonAssetCacheInstance = new PackageCache();

export default singletonAssetCacheInstance;
