import { PhotographyModule } from './photography.module';

describe('PhotographyModule', () => {
  let photographyModule: PhotographyModule;

  beforeEach(() => {
    photographyModule = new PhotographyModule();
  });

  it('should create an instance', () => {
    expect(photographyModule).toBeTruthy();
  });
});
