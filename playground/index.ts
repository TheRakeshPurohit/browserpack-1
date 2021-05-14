import Browserpack from '@client';
import { Files } from '@common/api';

const packageJSON = {
  dependencies: {
    react: '^17.0.2',
    'react-dom': '^17.0.2'
  }
};
const files: Files = {
  '/index.css': {
    content: `
      p {
        color: red;
      }
    `
  },
  '/static/person.json': {
    content: `
      {
        "name": "Ameer Jhan"
      }
    `
  },
  '/index.js': {
    content: `
      import person from './static/person.json';
      import React, {useState} from 'react';
      import ReactDOM from 'react-dom';
      import './index.css';

      function Counter() {
        const [count, setCount] = useState(0);
      
        return (
          <div>
            <p>Welcome {person.name}!</p>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
              Click me
            </button>
          </div>
        );
      }
      ReactDOM.render(<Counter />, document.getElementById('root'));
    `
  },
  '/package.json': {
    content: JSON.stringify(packageJSON)
  }
};

const browserpack = new Browserpack('#preview', files);

browserpack.onReady(async () => {
  await browserpack.bundle();

  browserpack.run();

  setTimeout(() => {
    browserpack.patch({
      '/index.js': {
        content: `
          import person from './static/person.json';
          import React, {useState} from 'react';
          import ReactDOM from 'react-dom';
          function Counter() {
            const [count, setCount] = useState(0);
          
            return (
              <div>
                <p>Welcome {person.name}!</p>
                <p>You clicked {count} times</p>
                <button onClick={() => setCount(count + 1)}>
                  Click me
                </button>
              </div>
            );
          }
          ReactDOM.render(<Counter />, document.getElementById('root'));
        `
      },
      '/static/person.json': {
        content: `
          {
            "name": "Ameer Jhan Edited"
          }
        `
      }
    });
  }, 5000);
});
