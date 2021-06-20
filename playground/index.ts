import Browserpack from '@client';
import { Files } from '@common/api';

const packageJSON = {
  dependencies: {
    '@angular/common': '^11.2.0',
    '@angular/compiler': '^11.2.0',
    '@angular/core': '^11.2.0',
    '@angular/platform-browser': '^11.2.0',
    '@angular/platform-browser-dynamic': '^11.2.0',
    'core-js': '3.8.3',
    tslib: '2.1.0',
    'zone.js': '0.11.4',
    rxjs: '6.6.3'
  }
};

const files: Files = {
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
    import "zone.js";
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

const browserpack = new Browserpack('#preview', files);

browserpack.init();

browserpack.onReady(async () => {
  await browserpack.bundle();

  browserpack.run();
});
