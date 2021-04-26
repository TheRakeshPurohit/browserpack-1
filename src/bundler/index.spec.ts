import Bundler from './';

describe('Sample test', () => {
  const one: number = 1;
  const bundler = new Bundler();

  it('should pass', () => {
    bundler.run();
    
    expect(one).toBe(1);
  });
});
