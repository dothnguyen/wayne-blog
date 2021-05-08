import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  forwardRef,
  ElementRef
} from '@angular/core';
import { CustomDropdownComponent } from '../custom-dropdown/custom-dropdown.component';
import * as moment from 'moment';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'spectre-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SpectreDatepickerComponent),
      multi: true
    }
  ]
})
export class SpectreDatepickerComponent
  implements OnInit, ControlValueAccessor {
  @ViewChild('dropdown')
  public dropdown: CustomDropdownComponent;

  @ViewChild('dateInput')
  public dateInput: ElementRef;

  @Input('mode')
  public mode: 'date' | 'time' | 'datetime' = 'date';

  @Input('disabled')
  public disabled: boolean = false;

  @Input('format')
  public format: string;

  @Input('value')
  public value: Date = null;
  public formattedValue: string = '';

  public hour: number;
  public minute: number;

  // Function to call when the rating changes.
  onChange = (date: Date) => {};

  // Function to call when the input is touched (when a star is clicked).
  onTouched = () => {};

  constructor(private cdRef: ChangeDetectorRef) {}

  writeValue(obj: Date): void {
    this.value = obj;
    this.calculateValues();
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

  ngOnInit() {
    if (!this.mode) this.mode = 'date';

    switch (this.mode) {
      case 'date':
        this.format = 'DD/MM/YYYY';
        break;
      case 'time':
        this.format = 'HH:mm';
        break;
      case 'datetime':
        this.format = 'DD/MM/YYYY HH:mm';
        break;
    }

    this.calculateValues();
  }

  onTextChanged($event) {
    var value = this.dateInput.nativeElement.value;
    if (value === '') {
      this.value = null;
      this.formattedValue = "";

      let mDate = moment();

      this.hour = mDate.hour();
      this.minute = mDate.minute();
      this.onChange(this.value);

    } else {
      let mDate = moment(value, this.format);

      if (!mDate.isValid()) {
        // restore previous value
        this.calculateValues();
        this.dateInput.nativeElement.value = this.formattedValue;
        this.onChange(this.value);
        return;
      }

      this.value = mDate.toDate();
      this.calculateValues();
      this.onChange(this.value);
    }
  }

  onDateSelected(date: Date) {
    let mDate = moment(date);

    if (this.mode == 'time' || this.mode == 'datetime') {
      mDate.hour(this.hour);
      mDate.minute(this.minute);
    }

    this.value = mDate.toDate();
    this.calculateValues();

    this.onChange(this.value);
  }

  calculateValues() {
    let mDate = moment();
    if (this.value) {
      mDate = moment(this.value);
      this.formattedValue = mDate.format(this.format);
    }

    if (this.mode == 'time' || this.mode == 'datetime') {
      this.hour = mDate.hour();
      this.minute = mDate.minute();
    }
  }

  changeTime() {
    let mDate = moment(this.value);
    mDate.hour(this.hour);
    mDate.minute(this.minute);
    this.value = mDate.toDate();
    this.calculateValues();
    this.onChange(this.value);
  }

  addHours(add: number) {
    this.hour = this.hour + add;
    if (this.hour >= 24) this.hour = this.hour - 24;

    if (this.hour < 0) this.hour = 24 + this.hour;

    this.changeTime();
  }

  addMinutes(add: number) {
    this.minute = this.minute + add;
    if (this.minute >= 60) {
      this.minute = this.minute - 60;
    }

    if (this.minute < 0) {
      this.minute = 60 + this.minute;
    }

    this.changeTime();
  }

  toggleDropdown() {
    if (this.dropdown.showing) {
      this.dropdown.hide();
    } else {
      this.dropdown.show();
    }
  }
}
