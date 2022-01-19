import { Component, Element, Host, Prop, h, Listen } from '@stencil/core';

/**
 * A row in the layout that should be presented justified
 * 
 * aspectRatio: The aspectRatio of all items in this row combined.
 *              e.g. if the row consists of two 4:3 items (aspectRatio = 1.3333), 
 *              the combined aspect ratio is 2.666667 (8:3)
 * items:       The items in this row.
 */
interface Row {
  aspectRatio: number;
  items: HTMLElement[];
}
@Component({
  tag: 'justified-gallery',
  styleUrl: 'justified-gallery.css',
})
export class JustifiedGallery {
  @Element() el: HTMLElement;
  @Prop() targetRowHeight: number = 300;
  @Prop() rowHeightBandwidth: number = 50;
  @Prop() justifyLastRow: boolean = false;
  @Prop() gutter: number = 10;
  @Prop() fullWidthCadence: number = -1;
  @Prop() rebuildSensitivity: number = 50;
  
  // The threshold used to stop adding new photos to a row
  private maxRowHeight = this.targetRowHeight + this.rowHeightBandwidth;
  private minRowHeight = this.targetRowHeight - this.rowHeightBandwidth;

  private rebuildBoundaries = {
    upper: 0,
    lower: 0
  };

  children: HTMLElement[] = [];

  componentWillLoad() {
    this.el.style.setProperty('--gutter', this.gutter+'px');
  }

  componentDidLoad() {
    this.rebuildBoundaries.upper = this.el.parentElement.clientWidth + this.rebuildSensitivity;
    this.rebuildBoundaries.lower = this.el.parentElement.clientWidth - this.rebuildSensitivity;
    this.children = Array.prototype.slice.call(this.el.children);
    this.build(this.children, this.el.parentElement.clientWidth);
  }

  /**
   * Returns a Promise that resolves once the aspect ratio of the element is known
   * 
   * @param el An HTMLElement for which we want to determine the aspect ratio
   * @returns A promise that resolves to the requested aspect ratio, when known
   */
  private determineAspectRatio(el: HTMLElement): Promise<number> {
    const imgEl = el.querySelector('img');
    return new Promise((resolve) => {
      imgEl.naturalHeight && resolve(imgEl.naturalWidth / imgEl.naturalHeight);
      imgEl.onload = () => resolve(imgEl.naturalWidth / imgEl.naturalHeight);
    });
  }

  @Listen('resize', { target: 'window' })
  handleResize() {
    if (this.el.parentElement.clientWidth > this.rebuildBoundaries.upper ||
        this.el.parentElement.clientWidth < this.rebuildBoundaries.lower) {
        
        this.rebuildBoundaries.upper = this.el.parentElement.clientWidth + this.rebuildSensitivity;
        this.rebuildBoundaries.lower = this.el.parentElement.clientWidth - this.rebuildSensitivity;
        this.build(this.children, this.el.parentElement.clientWidth);
    }
    
  }

  /**
   * Justify a gallery of photos to fit inside a certain containerWidth.
   * @param photos 
   * @param containerWidth 
   */
  private async build(items: HTMLElement[], containerWidth: number) {
    const maxAspectRatio = containerWidth / this.minRowHeight;
    const minAspectRatio = containerWidth / this.maxRowHeight;

    let row: Row = { aspectRatio: 0, items: [] };
    let waitForFullWidthRow = this.fullWidthCadence - 1;

    for (const item of items) {
      const aspectRatio = await this.determineAspectRatio(item);
      
      row.aspectRatio += aspectRatio;
      row.items.push(item);
      // If row consists of exactly one landscape-oriented photo and 
      // it's time for a full width row, justify the single photo
      // straight away.
      if (waitForFullWidthRow == 0 && row.items.length == 1 && row.aspectRatio > 1) {
        waitForFullWidthRow = this.fullWidthCadence - 1;
        this.buildRow(row);
        row = { aspectRatio: 0, items: [] };
      }
      // Finish a row when the most recently added photo has pushed the
      // row height below the minimum row height (maxAspectRatio) OR
      // randomly already finish it when the photo has pushed the row
      // height below the maximum row height (minAspectRatio)
      else if ((row.aspectRatio >= maxAspectRatio) ||
               (row.aspectRatio >= minAspectRatio && Math.random()*2 > 1)) {
        waitForFullWidthRow > 0 && waitForFullWidthRow--;
        this.buildRow(row);
        row = { aspectRatio: 0, items: [] };
      }
    }
    // When all photos are processed, finish the last row. When justifyLastRow == true,
    // the row should be justified just like any other row.
    this.buildRow(row, this.justifyLastRow);
  }

  /**
   * Justifies a single row of photos.
   * @param row     Photos row to be justified
   * @param justify Indicate whether this row must be justified. If not, it will be
   *                adjusted to the minimum row height.
   */
  private async buildRow(row: Row, justify: boolean = true) {
    if (!row || !row.items || !row.items.length) return;

    for (const item of row.items) {
      const aspectRatio = await this.determineAspectRatio(item);
      item.style.clear = 'none';
      if (!justify) {
        item.style.width = this.minRowHeight * aspectRatio + 'px';
        item.style.height = this.minRowHeight + 'px';
      } else {
        item.style.width = (aspectRatio / row.aspectRatio * 100) + '%';
        item.style.height = 'auto';
      }
    }

    row.items[0].style.clear = 'left';
  }

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }

}
