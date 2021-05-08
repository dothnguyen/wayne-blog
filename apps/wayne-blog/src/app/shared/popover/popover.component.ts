import { Component, OnInit, TemplateRef, Type, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver, Injector, ComponentRef } from '@angular/core';
import { PopoverRef, PopoverContent } from './popover-ref';

@Component({
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss']
})
export class PopoverComponent implements OnInit {
  @ViewChild('componentContainer', { static: false, read: ViewContainerRef })
  componentContainer: ViewContainerRef;

  public renderMethod: 'template' | 'component' | 'text' = 'component';
  public content: PopoverContent;
  public context;

  constructor(
    public popoverRef: PopoverRef,
    private cfr: ComponentFactoryResolver,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit() {
    this.content = this.popoverRef.content;

    if (typeof this.content === 'string') {
      this.renderMethod = 'text';
    }

    if (this.content instanceof TemplateRef) {
      this.renderMethod = 'template';
      this.context = {
        close: this.popoverRef.close.bind(this.popoverRef)
      };
    }

    if (this.renderMethod === 'component') {
      // initialize component
      this.createComponent(this.content as Type<any>);
    }
  }

  ngAfterViewInit() {
    if (this.renderMethod === 'component') {
      this.componentContainer.insert(this.popoverRef.componentRef.hostView);
    }
  }

  createComponent(component: Type<any>) {
    const factory = this.cfr.resolveComponentFactory(component);
    const childInjector = Injector.create({
      providers: [{ provide: PopoverRef, useValue: this }],
      parent: this.viewContainer.parentInjector
    });

    this.popoverRef.componentRef = factory.create(childInjector);

    if (this.popoverRef.data) {
      Object.assign(
        this.popoverRef.componentRef.instance,
        this.popoverRef.data
      );
    }
    // Do the first change detection immediately (or we do detection at ngAfterViewInit, multi-changes error will be thrown)
    this.popoverRef.componentRef.changeDetectorRef.detectChanges();
  }
}
