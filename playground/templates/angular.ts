import { Files } from '@common/api';

const packageJSON = {
  dependencies: {
    '@angular/common': '^11.2.0',
    '@angular/compiler': '^11.2.0',
    '@angular/core': '^11.2.0',
    '@angular/platform-browser': '^11.2.0',
    '@angular/platform-browser-dynamic': '^11.2.0',
    'core-js': '3.8.3',
    'zone.js': '0.11.4'
  }
};

const files: Files = {
  '/src/app/app.component.ts': {
    content: `
      import { Component } from "@angular/core";

      @Component({
        selector: "app-root",
        templateUrl: "./app.component.html",
        styleUrls: ['./app.component.css']
      })
      export class AppComponent {
        title = "Hello from Angular!";
      }
    `
  },
  '/src/app/app.component.html': {
    content: `<h1>{{title}}</h1>`
  },
  '/src/app/app.component.css': {
    content: `h1 { color: red; }`
  },
  '/src/app/app.module.ts': {
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
  '/src/main.ts': {
    content: `
    import "zone.js/dist/zone";
    import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
    import { AppModule } from "./app/app.module";

    platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch(err => console.log(err));
  `
  },
  '/src/index.html': {
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

export default files;
