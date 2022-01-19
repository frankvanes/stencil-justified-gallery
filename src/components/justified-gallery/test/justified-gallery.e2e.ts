import { newE2EPage } from '@stencil/core/testing';

describe('justified-gallery', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<justified-gallery></justified-gallery>');

    const element = await page.find('justified-gallery');
    expect(element).toHaveClass('hydrated');
  });
});
