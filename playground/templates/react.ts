import { Files } from '@common/api';

const packageJSON = {
  dependencies: {
    react: '^17.0.1',
    'react-dom': '17.0.1'
  }
};

const files: Files = {
  '/public/index.html': {
    content: `
      <!doctype html>
      <html lang="en">
      
      <head>
        <meta charset="utf-8">
        <title>React</title>
      </head>
      
      <body>
        <div id="root"></div>
      </body>
      </html>
    `
  },
  '/src/index.js': {
    content: `
      import React from 'react';
      import ReactDOM from 'react-dom';
      import App from './app';

      ReactDOM.render(<App />, document.getElementById('root'));
    `
  },
  '/src/app.css': {
    content: `h1 { color: red; }`
  },
  '/src/app.js': {
    content: `
    import React from 'react';

    export default function App() {
      return <h1>Hello from React</h1>;
    }
    `
  },
  '/package.json': {
    content: JSON.stringify(packageJSON)
  }
};

export default files;
