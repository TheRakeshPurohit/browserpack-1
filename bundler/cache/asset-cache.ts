import { Asset, DepGraph } from '@common/api';

class AssetCache {
  constructor(private assetCache: DepGraph = {}) {}

  public get(key: string) {
    return this.assetCache[key];
  }

  public set(key: string, asset: Asset) {
    this.assetCache[key] = asset;
  }

  public reset() {
    this.assetCache = {};
  }

  public get depGraph() {
    return this.assetCache;
  }

  public remove(key: string) {
    delete this.assetCache[key];
  }
}

const singletonAssetCacheInstance = new AssetCache();

export default singletonAssetCacheInstance;
