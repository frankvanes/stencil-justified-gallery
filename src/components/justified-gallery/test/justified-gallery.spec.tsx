import { newSpecPage } from '@stencil/core/testing';
import { JustifiedGallery } from '../justified-gallery';

describe('justified-gallery', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [JustifiedGallery],
      html: `<justified-gallery></justified-gallery>`,
    });
    expect(page.root).toEqualHtml(`
      <justified-gallery>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </justified-gallery>
    `);
  });
});
