import { Injectable, Injector, Type } from '@angular/core';
import {
  Overlay,
  ConnectionPositionPair,
  PositionStrategy,
  OverlayConfig
} from '@angular/cdk/overlay';
import { PortalInjector, ComponentPortal } from '@angular/cdk/portal';
import { PopoverRef, PopoverContent } from './popover-ref';
import { PopoverComponent } from './popover.component';

export type PopoverParams<T> = {
  width?: string | number;
  height?: string | number;
  origin: HTMLElement;
  content: PopoverContent;
  data?: T;
  hasBackdrop: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class Popover {
  _loadingRefs = {};

  constructor(private overlay: Overlay, private injector: Injector) {}

  open<T>({
    origin,
    content,
    data,
    width,
    height,
    hasBackdrop = true
  }: PopoverParams<T>): PopoverRef<T> {
    const overlayRef = this.overlay.create(
      this.getOverlayConfig({ origin, width, height, hasBackdrop })
    );
    const popoverRef = new PopoverRef<T>(overlayRef, content, data);

    const injector = this.createInjector(popoverRef, this.injector);

    var compRef = null;

    if (!(content instanceof Type)) {
      compRef = overlayRef.attach(
        new ComponentPortal(PopoverComponent, null, injector)
      );
    } else {
      compRef = overlayRef.attach(new ComponentPortal(content, null, injector));
    }

    if (popoverRef.data) {
      Object.assign(compRef.instance, popoverRef.data);
    }

    // Do the first change detection immediately (or we do detection at ngAfterViewInit, multi-changes error will be thrown)
    compRef.changeDetectorRef.detectChanges();

    // component content
    popoverRef.componentRef = compRef;

    return popoverRef;
  }

  private getOverlayConfig({
    origin,
    width,
    height,
    hasBackdrop = true,
    backdropClass = 'cdk-overlay-transparent-backdrop'
  }): OverlayConfig {
    return new OverlayConfig({
      hasBackdrop: hasBackdrop,
      width,
      height,
      //backdropClass: 'popover-backdrop',
      backdropClass: backdropClass,
      positionStrategy: this.getOverlayPosition(origin),
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
  }

  private getOverlayPosition(origin: HTMLElement): PositionStrategy {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(this.getPositions())
      .withFlexibleDimensions(false)
      .withPush(false);

    return positionStrategy;
  }

  createInjector(popoverRef: PopoverRef, injector: Injector) {
    const tokens = new WeakMap([[PopoverRef, popoverRef]]);
    return new PortalInjector(injector, tokens);
  }

  private getPositions(): ConnectionPositionPair[] {
    return [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom'
      }
    ];
  }

  public openLoadingDialog(refName, origin, content): PopoverRef<any> {
    if (this._loadingRefs[refName]) return;

    var width = null,
      height = null;
    if (origin) {
      var rect = (origin as HTMLElement).getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    }

    const overlayRef = this.overlay.create(
      new OverlayConfig({
        hasBackdrop: false,
        panelClass: 'dialog-backdrop',
        positionStrategy: this.overlay
          .position()
          .flexibleConnectedTo(origin)
          .withPositions([
            {
              originX: 'start',
              originY: 'top',
              overlayX: 'start',
              overlayY: 'top'
            },
            {
              originX: 'end',
              originY: 'bottom',
              overlayX: 'end',
              overlayY: 'bottom'
            }
          ])
          .withFlexibleDimensions(true)
          .withGrowAfterOpen(true)
          .withPush(false),
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        width: width,
        height: height
      })
    );

    var loadingEl = `<div class='px-5'><div class="loading loading-lg"></div><div>${content}</div></div>`;

    const popoverRef = new PopoverRef<any>(overlayRef, loadingEl, null);

    const injector = this.createInjector(popoverRef, this.injector);
    var compRef = overlayRef.attach(
      new ComponentPortal(PopoverComponent, null, injector)
    );

    if (popoverRef.data) {
      Object.assign(compRef.instance, popoverRef.data);
    }

    // Do the first change detection immediately (or we do detection at ngAfterViewInit, multi-changes error will be thrown)
    compRef.changeDetectorRef.detectChanges();

    // component content
    popoverRef.componentRef = compRef;

    overlayRef.backdropClick().subscribe(() => {
      // do nothing
    });

    this._loadingRefs[refName] = popoverRef;

    return popoverRef;
  }

  public closeLoading(refName) {
    if (this._loadingRefs[refName]) {
      (this._loadingRefs[refName] as PopoverRef).close();
      delete this._loadingRefs[refName];
    }
  }
}
