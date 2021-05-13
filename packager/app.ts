import express, { Request } from 'express';
import morgan from 'morgan';

const app = express();
const isDev = process.env.NODE_ENV === 'development';
const serverPort = process.env.PORT || 8000;

type PackParams = {
  scopeOrName: string;
  name: string;
};

app.use(morgan(isDev ? 'dev' : 'tiny'));

app.get('/pack/:scopeOrName/:name?', (req: Request<PackParams>, res) => {
  const { scopeOrName, name } = req.params;
  const packageName = name ? `${scopeOrName}/${name}` : scopeOrName;

  res.json({ packageName });
});

app.listen(process.env.PORT || 8000, () => {
  console.log(
    `🚀 express ${
      isDev ? 'development' : 'production'
    } server listening at ${serverPort}`
  );
});
