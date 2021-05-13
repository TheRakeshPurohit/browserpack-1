import { Asset } from '@common/api';

class AssetCache {
  constructor(private assetCache: Record<string, Asset> = {}) {}

  public get(key: string) {
    return this.assetCache[key];
  }

  public set(key: string, asset: Asset) {
    this.assetCache[key] = asset;
  }

  public reset() {
    this.assetCache = {};
  }

  public remove(key: string) {
    delete this.assetCache[key];
  }
}

const singletonAssetCacheInstance = new AssetCache();

export default singletonAssetCacheInstance;
