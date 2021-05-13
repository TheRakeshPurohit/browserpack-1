import Bundler from '@bundler';

const packageJSON = {
  dependencies: {
    react: '^17.0.2',
    'react-dom': '^17.0.2'
  }
};

const bundler = new Bundler({
  files: {
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
  }
});

(async () => {
  await bundler.bundle();

  bundler.run();

  setTimeout(async () => {
    await bundler.update({
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
})();
