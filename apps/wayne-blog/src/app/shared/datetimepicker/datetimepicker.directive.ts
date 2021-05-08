import {
  Directive,
  ElementRef,
  Input,
  HostListener,
  Renderer2,
  Self,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output
} from '@angular/core';
import { Popover } from '../popover/popover.service';
import { SpectreDateTimePickerComponent } from './datetimepicker.component';
import { PopoverRef } from '../popover/popover-ref';
import { takeUntil, map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NgControl } from '@angular/forms';
import * as moment from 'moment';

@Directive({
  selector: '[spectreDateTimePicker]'
})
export class DateTimePickerDirective implements OnInit, OnDestroy {
  @Input('dtpValue')
  public value: Date;

  @Input('dtpMode')
  public mode: 'date' | 'time' | 'datetime' = 'date';

  @Input('dtpShowSecond')
  public showSecond: boolean = false;

  @Input('dtpFormat')
  public format: string = null;

  @Input('dtpTargetEl')
  public targetEl: HTMLElement;

  @Input('dtpTriggerBtn')
  public triggerBtn: HTMLElement;

  @Output('dtpDateChanged') dateChanged = new EventEmitter<Date>();

  popoverRef: PopoverRef;
  dtpComponent: SpectreDateTimePickerComponent;

  clickInPopover = false;
  clicked = false;

  private outputEl: HTMLElement;

  destroy$ = new Subject<any>();

  lastDate: Date;

  constructor(
    private el: ElementRef,
    private popper: Popover,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    if (!this.mode) this.mode = 'date';

    if (!this.format) {
      switch (this.mode) {
        case 'date':
          this.format = 'DD/MM/YYYY';
          break;
        case 'time':
          this.format = 'HH:mm';
          if (this.showSecond) this.format = 'HH:mm:ss';
          break;
        case 'datetime':
          this.format = 'DD/MM/YYYY HH:mm';
          if (this.showSecond) this.format = 'DD/MM/YYYY HH:mm:ss';
          break;
      }
    }

    if (this.el) {
      if (
        this.el.nativeElement instanceof HTMLInputElement &&
        this.el.nativeElement.type === 'text'
      ) {
        this.outputEl = this.el.nativeElement;
      } else {
        this.outputEl = this.targetEl;
      }
    }

    if (this.triggerBtn) {
      this.triggerBtn.addEventListener('click', this.triggerClicked.bind(this));
    }

    if (this.value) this.setOutputValue();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  triggerClicked() {
    if (!this.popoverRef) {
      this.el.nativeElement['dtpShowing'] = true;
      this.showDateTimePicker();
      this.clicked = true;
    }
  }

  @HostListener('keyup', ['$event']) onValue(event: KeyboardEvent) {
    if (this.el.nativeElement instanceof HTMLInputElement) {
      if (this.el.nativeElement.type === 'text') {
        var val = this.el.nativeElement.value;
        if (val !== '') {
          var newDate = moment(val, this.format);

          if (newDate.isValid()) {
            this.value = newDate.toDate();
            this.popoverRef.componentRef.instance.setValue(this.value);
            this.setOutputValue();
            this.dateChanged.emit(this.value);
          } else {
            if (this.value) this.setOutputValue();
          }
        } else {
          this.value = null;
          this.popoverRef.componentRef.instance.setValue(this.value);
          this.dateChanged.emit(this.value);
        }
      }
    }
  }

  @HostListener('focus') onFocus() {
    if (this.el.nativeElement['dtpShowing']) return;

    if (this.el.nativeElement instanceof HTMLInputElement) {
      if (this.el.nativeElement.type === 'text') {
        if (!this.popoverRef) {
          this.el.nativeElement['dtpShowing'] = true;
          this.showDateTimePicker();
          this.clicked = true;
        }
      }
    }
  }

  @HostListener('keydown', ['$event']) keydown(event: KeyboardEvent) {
    this.clicked = false;
    if (event.keyCode === 27) {
      if (this.popoverRef) this.popoverRef.close();
      this.popoverRef = null;
    }
  }

  @HostListener('blur') onBlur() {
    // delay popover close to check for next active
    if ((this.clicked && !this.clickInPopover) || !this.clicked) {
      if (this.popoverRef) this.popoverRef.close();
      this.popoverRef = null;
    }

    this.clicked = false;
  }

  @HostListener('document:mousedown', ['$event']) documentClick(
    event: MouseEvent
  ) {
    this.clicked = true;
    let elRect = null;
    if (this.targetEl) {
      elRect = this.targetEl.getBoundingClientRect();

      if (this.isMouseInRect(event, elRect)) {
        this.clickInPopover = true;
        return;
      }
    }

    if (this.targetEl !== this.el.nativeElement) {
      elRect = this.el.nativeElement.getBoundingClientRect();
      if (this.isMouseInRect(event, elRect)) {
        this.clickInPopover = true;
        return;
      }
    }

    if (this.triggerBtn) {
      elRect = this.triggerBtn.getBoundingClientRect();
      if (this.isMouseInRect(event, elRect)) {
        this.clickInPopover = true;
        return;
      }
    }

    if (this.dtpComponent) {
      elRect = this.dtpComponent.dtpContainer.nativeElement.getBoundingClientRect();
      if (this.isMouseInRect(event, elRect)) {
        this.clickInPopover = true;
        return;
      }
    }

    this.clickInPopover = false;

    // outside => close
    if (this.popoverRef) this.popoverRef.close();
    this.popoverRef = null;
  }

  showDateTimePicker() {
    this.popoverRef = this.popper.open<any>({
      content: SpectreDateTimePickerComponent,
      origin: this.targetEl? this.targetEl : this.el.nativeElement,
      data: {
        mode: this.mode,
        value: this.value,
        format: this.format,
        showSecond: this.showSecond
      },
      hasBackdrop: false
    });

    this.popoverRef.afterClosed$.subscribe(res => {
      this.el.nativeElement['dtpShowing'] = null;
    });

    this.dtpComponent = this.popoverRef.componentRef
      .instance as SpectreDateTimePickerComponent;

    this.dtpComponent.valueChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.onDateTimeChange.bind(this));

    this.renderer.addClass(
      this.dtpComponent.dtpContainer.nativeElement,
      'popover'
    );
  }

  onDateTimeChange(date: Date) {
    this.value = date;
    this.dateChanged.emit(this.value);
    this.setOutputValue();
  }

  setOutputValue() {
    if (this.outputEl) {
      if (this.outputEl.tagName === 'INPUT') {
        this.outputEl['value'] = moment(this.value).format(this.format);
      } else {
        this.outputEl.innerHTML = moment(this.value).format(this.format);
      }
    }
  }

  isMouseInRect(event: MouseEvent, elRect: DOMRect) {
    if (
      event.clientX >= elRect.left &&
      event.clientX <= elRect.right &&
      event.clientY >= elRect.top &&
      event.clientY <= elRect.bottom
    ) {
      return true;
    }

    return false;
  }
}
