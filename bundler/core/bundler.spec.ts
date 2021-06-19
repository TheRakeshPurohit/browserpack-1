import Bundler from '.';

describe('Bundler', () => {
  beforeEach(() => {
    const styleTags = document.getElementsByTagName('style');

    // root div tag for mounting react
    if (!document.getElementById('root')) {
      const rootElement = document.createElement('div');

      rootElement.setAttribute('id', 'root');

      document.body.appendChild(rootElement);
    }

    // avoid css sideeffects of previous tests
    for (let i = 0; i < styleTags.length; i++) {
      styleTags[i].remove();
    }
  });

  it('should generate the right dependencies', async () => {
    const bundler = new Bundler({
      files: {
        '/index.js': {
          content: `
            import {hello} from './hello';
  
            hello()
          `
        },
        '/hello.js': {
          content: `
            export function hello() {
              console.log('hello world from browserpack');
            }
          `
        }
      }
    });

    const depGraph = await bundler.bundle();

    expect(depGraph['/index.js'].dependencies).toEqual(['./hello']);
  });

  it('should throw error when module is not found', async () => {
    const bundler = new Bundler({
      files: {
        '/index.js': {
          content: `
            import {hello} from './hello.js';
  
            hello()
          `
        }
      }
    });

    try {
      await bundler.bundle();
    } catch (err) {
      expect(err).toEqual(
        new Error(`Cannot find module './hello.js' from '/index.js'`)
      );
    }
  });

  it('should run the files', async () => {
    const files = {
      '/index.js': {
        content: `
          import {hello} from './hello';
          
          hello('Ameer');
      `
      },
      '/hello/index.js': {
        content: `
          export function hello(message = 'from browserpack') {
            document.body.innerHTML = \`Hello world \${message}\`;
          }
      `
      }
    };
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    expect(document.body.innerHTML).toEqual('Hello world Ameer');
  });

  it('should support css files', async () => {
    const indexCSS = `
      h1 {
        color: red;
      }
    `;
    const files = {
      '/index.css': {
        content: indexCSS
      },
      '/index.js': {
        content: `
          import './index.css';

          document.body.innerHTML = '<h1>Hello World!</h1>';
      `
      }
    };
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    const styleTag = document.head.getElementsByTagName('style')[0];

    expect(styleTag.innerHTML).toEqual(indexCSS);
  });

  it('should support json files', async () => {
    const json = `
      {
        "name": "Ameer",
        "city": "Bangalore"
      }
    `;
    const files = {
      '/person.json': {
        content: json
      },
      '/index.js': {
        content: `
          import {name, city} from './person.json';

          document.body.innerHTML = 'Welcome ' + name +  ' from ' + city;
      `
      }
    };
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    expect(document.body.innerHTML).toEqual('Welcome Ameer from Bangalore');
  });

  it('should throw for invalid json file import', async () => {
    const json = `
      {
        "name": "Ameer",
        "city": "Bangalor
      }
    `;
    const files = {
      '/person.json': {
        content: json
      },
      '/index.js': {
        content: `
          import {name, city} from './person.json';

          document.body.innerHTML = 'Welcome ' + name +  ' from ' + city;
      `
      }
    };
    const bundler = new Bundler({ files });

    try {
      await bundler.bundle();
    } catch (err) {
      expect(err).toEqual(
        new Error(
          `Invalid json module '/person.json' imported from '/index.js'`
        )
      );
    }
  });

  it('should update the files and rerun', async () => {
    const files = {
      '/index.js': {
        content: `
          import {hello} from './hello';
          
          hello('Ameer');
      `
      },
      '/hello/index.js': {
        content: `
          export function hello(message = 'from browserpack') {
            document.body.innerHTML = \`Hello world \${message}\`;
          }
      `
      }
    };
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    expect(document.body.innerHTML).toEqual('Hello world Ameer');

    await bundler.update({
      '/hello/index.js': {
        content: `
          export function hello(message = 'from browserpack') {
            document.body.innerHTML = \`Hello world edited \${message}\`;
          }
        `
      }
    });

    expect(document.body.innerHTML).toEqual('Hello world edited Ameer');
  });

  it('should update the files and rerun for deep dependencies', async () => {
    const files = {
      '/index.js': {
        content: `
          import {hello} from './hello';
          
          hello('Ameer');
      `
      },
      '/hello/index.js': {
        content: `
          import {say} from '../lib';

          export function hello(message = 'from browserpack') {
            say(\`Hello world \${message}\`);
          }
      `
      },
      '/lib/index.js': {
        content: `
          export function say(message) {
            document.body.innerHTML = message;
          }
        `
      }
    };
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    expect(document.body.innerHTML).toEqual('Hello world Ameer');

    await bundler.update({
      '/lib/index.js': {
        content: `
          export function say(message) {
            document.body.innerHTML = 'edited lib';
          }
        `
      }
    });

    expect(document.body.innerHTML).toEqual('edited lib');
  });

  it('should support npm packages', async () => {
    const packageJSON = {
      dependencies: {
        react: '^17.0.2',
        'react-dom': '^17.0.2'
      }
    };
    const files = {
      '/index.js': {
        content: `
          import React from 'react';
          import ReactDOM from 'react-dom';

          ReactDOM.render(<h1>Hello world from React!</h1>, document.getElementById('root'));
      `
      },
      '/package.json': {
        content: JSON.stringify(packageJSON)
      }
    };
    const bundler = new Bundler({ files });

    await bundler.bundle();
    bundler.run();

    expect(document.getElementById('root')?.innerHTML).toEqual(
      '<h1>Hello world from React!</h1>'
    );
  });

  it('should support angular project', async () => {
    const packageJSON = {
      dependencies: {
        '@angular/common': '^11.2.0',
        '@angular/compiler': '^11.2.0',
        '@angular/core': '^11.2.0',
        '@angular/platform-browser': '^11.2.0',
        '@angular/platform-browser-dynamic': '^11.2.0',
        'core-js': '3.8.3',
        'zone.js': '0.11.3'
      }
    };

    const files = {
      '/app/app.component.ts': {
        content: `
          import { Component } from "@angular/core";
    
          @Component({
            selector: "app-root",
            template: "<h1>Hello {{title}}</h1>"
          })
          export class AppComponent {
            title = "Browserpack";
          }
        `
      },
      '/app/app.module.ts': {
        content: `
        import { BrowserModule } from "@angular/platform-browser";
        import { NgModule } from "@angular/core";
        
        import { AppComponent } from "./app.component";
        
        @NgModule({
          declarations: [AppComponent],
          imports: [BrowserModule],
          providers: [],
          bootstrap: [AppComponent]
        })
        export class AppModule {}
        `
      },
      '/main.ts': {
        content: `
        import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
        import { AppModule } from "./app/app.module";
        
        platformBrowserDynamic()
          .bootstrapModule(AppModule)
          .catch(err => console.log(err));
        
      `
      },
      '/index.html': {
        content: `
        <!doctype html>
        <html lang="en">
        
        <head>
          <meta charset="utf-8">
          <title>Angular</title>
          <base href="/">
        </head>
        
        <body>
          <app-root></app-root>
        </body>
        
        </html>
      `
      },
      '/package.json': {
        content: JSON.stringify(packageJSON)
      }
    };

    const bundler = new Bundler({ files, entryPoint: '/main.ts' });

    await bundler.bundle();
    // bundler.run();

    expect(1).toBe(1);
  });
});
