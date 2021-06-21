import Browserpack from '@client';
import angular from './templates/angular';
import react from './templates/react';
import App from './app';
import React from 'react';
import ReactDOM from 'react-dom';

const browserpack = new Browserpack('#preview', react);

browserpack.init();

browserpack.onReady(async () => {
  await browserpack.bundle();

  browserpack.run();
});

ReactDOM.render(<App />, document.getElementById('root'));
