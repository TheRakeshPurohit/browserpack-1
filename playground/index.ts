import Browserpack from '@client';
import angular from './templates/angular';
import react from './templates/react';

const browserpack = new Browserpack('#preview', react);

browserpack.init();

browserpack.onReady(async () => {
  await browserpack.bundle();

  browserpack.run();
});
