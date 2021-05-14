import app from './app';

const isDev = process.env.NODE_ENV === 'development';
const serverPort = process.env.PORT || 8000;

app.listen(process.env.PORT || 8000, () => {
  console.log(
    `🚀 express ${
      isDev ? 'development' : 'production'
    } server listening at ${serverPort}`
  );
});
