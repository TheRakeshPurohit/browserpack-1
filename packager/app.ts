import express, { Request } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { generateDepGraph } from './dep-graph';
import packageCache from './cache';
import semver from 'semver';

const app = express();
const isDev = process.env.NODE_ENV === 'development';
const serverPort = process.env.PORT || 8000;

type PackParams = {
  scopeOrName: string;
  nameOrVersion: string;
  version: string;
};

// setup  middlewares
app.use(morgan(isDev ? 'dev' : 'tiny'));
app.use(
  cors({
    origin: '*'
  })
);

app.get(
  '/pack/:scopeOrName/:nameOrVersion/:version?',
  async (req: Request<PackParams>, res) => {
    const { scopeOrName, nameOrVersion, version } = req.params;
    const packageName = version
      ? `${scopeOrName}/${nameOrVersion}`
      : scopeOrName;
    const packageVersion = version || nameOrVersion;
    const packageVersionSemver = semver.minVersion(packageVersion);

    if (packageVersionSemver) {
      let assets = await packageCache.get(
        packageName,
        packageVersionSemver.version
      );

      if (!assets) {
        assets = await generateDepGraph(
          packageName,
          packageVersionSemver.version
        );
        packageCache.set(packageName, packageVersionSemver.version, assets);
      }

      res.json({ assets });
    } else {
      res.sendStatus(400);

      res.json({ error: 'Invalid package version' });
    }
  }
);

app.listen(process.env.PORT || 8000, () => {
  console.log(
    `🚀 express ${
      isDev ? 'development' : 'production'
    } server listening at ${serverPort}`
  );
});
