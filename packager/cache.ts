import { DepGraph } from '@common/api';
import { promises as fs } from 'fs';
import path from 'path';

class PackageCache {
  private cacheDir: string;

  constructor() {
    this.cacheDir = path.join(__dirname, '.cache');
  }

  private exists(filePath: string) {
    return new Promise((resolve) => {
      fs.stat(filePath)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
  }

  private getCachePath(packageName: string, version: string) {
    const cachePath = `${path.join(this.cacheDir, packageName, version)}.json`;

    return cachePath;
  }

  async get(packageName: string, version: string): Promise<DepGraph | null> {
    const cachePath = this.getCachePath(packageName, version);
    const cacheExists = await this.exists(cachePath);

    if (cacheExists) {
      return JSON.parse(await fs.readFile(cachePath, { encoding: 'utf-8' }));
    } else {
      return null;
    }
  }

  async set(packageName: string, version: string, depGraph: DepGraph) {
    const cachePath = this.getCachePath(packageName, version);

    await fs.mkdir(path.dirname(cachePath), { recursive: true });

    await fs.writeFile(cachePath, JSON.stringify(depGraph));
  }
}

export default new PackageCache();
