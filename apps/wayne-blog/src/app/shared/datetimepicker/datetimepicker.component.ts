import { Component, OnInit, Input, ViewContainerRef, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'spectre-datetimepicker',
  templateUrl: './datetimepicker.component.html',
  styleUrls: ['./datetimepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpectreDateTimePickerComponent implements OnInit {
  @ViewChild('dtpContainer', { read: ElementRef }) dtpContainer: ElementRef;

  @Input('mode')
  public mode: 'date' | 'time' | 'datetime' = 'date';

  @Input('value')
  public value: Date = null;

  @Input('showSecond')
  public showSecond: boolean = false;

  @Input('format')
  public format: string = 'DD/MM/YYYY';

  public valueChange$: Subject<Date>;

  time: Date = null;

  constructor(
    public viewContainerRef: ViewContainerRef,
    private cdRef: ChangeDetectorRef
  ) {
    this.valueChange$ = new Subject<Date>();
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

    if (this.value) this.time = new Date(this.value.getTime());
  }

  ngOnDestroy() {
    this.valueChange$.complete();
  }

  setValue(date: Date) {
    this.value = date;
    this.cdRef.detectChanges();
  }

  onDateChanged(date: Date) {
    this.value = date;

    if (this.time) {
      this.value.setHours(this.time.getHours());
      this.value.setMinutes(this.time.getMinutes());
      this.value.setSeconds(this.time.getSeconds());
    } else {
      this.value.setHours(0);
      this.value.setMinutes(0);
      this.value.setSeconds(0);
    }

    this.valueChange$.next(this.value);
  }

  onTimeChanged(time: Date) {
    this.time = time;
    if (this.value) {
      this.value.setHours(time.getHours());
      this.value.setMinutes(time.getMinutes());
      this.value.setSeconds(time.getSeconds());

      this.valueChange$.next(this.value);
    }
  }
}
