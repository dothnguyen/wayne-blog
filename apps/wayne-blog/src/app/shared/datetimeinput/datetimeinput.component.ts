import { Component, OnInit, Input, ChangeDetectionStrategy, forwardRef, ViewChild, ElementRef, ViewContainerRef, Renderer2 } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'spectre-datetimeinput',
  templateUrl: './datetimeinput.component.html',
  styleUrls: ['./datetimeinput.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SpectreDatetimeInputComponent),
      multi: true
    }
  ]
})
export class SpectreDatetimeInputComponent
  implements OnInit, ControlValueAccessor {
  @Input('format')
  public format: string;

  @Input('value')
  public value: Date = null;

  @Input('mode')
  public mode: 'date' | 'time' | 'datetime' = 'date';

  @Input('showSecond')
  public showSecond: boolean = false;

  @Input() disabled = false;

  @ViewChild('dateInput', { read: ElementRef }) dateInput: ElementRef;

  // Function to call when the rating changes.
  onChange = (date: Date) => {};

  // Function to call when the input is touched (when a star is clicked).
  onTouched = () => {};

  constructor( private renderer: Renderer2, private elRef: ElementRef) {
    this.renderer.addClass(elRef.nativeElement, 'input-group');
  }

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
  }

  dateChanged(date: Date) {
    this.value = date;
    this.onChange(this.value);
  }

  writeValue(obj: Date): void {
    this.value = obj;
    this.onChange(this.value);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
