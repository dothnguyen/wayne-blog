import { Component, OnInit, Input, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, tap, takeUntil, filter } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'spectre-timer',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpectreTimeComponent implements OnInit, OnDestroy {
  @Input('value')
  public value: Date = null;

  @Input('minuteStep')
  public minuteStep = 5;

  @Input('showSecond')
  public showSecond = false;

  @Input('secondStep')
  public secondStep = 5;

  @Output('timeChanged')
  public timeChanged = new EventEmitter<Date>();

  //@Input('hourStep')
  public hourStep = 1;

  hourInput = new FormControl('00');
  minuteInput = new FormControl('00');
  secondInput = new FormControl('00');

  public value$: BehaviorSubject<Date> = new BehaviorSubject(new Date());

  public hour$: Observable<number>;
  public minute$: Observable<number>;
  public second$: Observable<number>;

  public destroy$: Subject<any> = new Subject();

  constructor() {
    this.hour$ = this.value$.pipe(
      takeUntil(this.destroy$),
      filter(d => !!d),
      map((d: Date) => d.getHours())
    );
    this.minute$ = this.value$.pipe(
      takeUntil(this.destroy$),
      filter(d => !!d),
      map((d: Date) => d.getMinutes())
    );
    this.second$ = this.value$.pipe(
      takeUntil(this.destroy$),
      filter(d => !!d),
      map((d: Date) => d.getSeconds())
    );

    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && changes['value'].currentValue) {
      this.value = changes['value'].currentValue as Date;
      this.value$.next(this.value);
    }
  }

  hourChange(event) {
    var newH = this.hourInput.value;
    if (newH < 0) newH = 0;
    if (newH >= 24) newH = 23;

    var mDate = moment(this.value);
    mDate.hour(newH);

    this.setNewValue(mDate.toDate());
  }

  minuteChange(event) {
    var newH = this.minuteInput.value;
    if (newH < 0) newH = 0;
    if (newH >= 60) newH = 59;

    var mDate = moment(this.value);
    mDate.minute(newH);
    this.setNewValue(mDate.toDate());
  }

  secondChange(event) {
    var newH = this.secondInput.value;
    if (newH < 0) newH = 0;
    if (newH >= 60) newH = 59;

    var mDate = moment(this.value);
    mDate.second(newH);
    this.setNewValue(mDate.toDate());
  }

  changeTime(time: any, inc: boolean) {
    var change = this.hourStep;
    if (time === 'minute') change = this.minuteStep;
    if (time === 'second') change = this.secondStep;

    if (!inc) change = -change;

    var mDate = moment(this.value);
    mDate = mDate.add(change, time);

    this.setNewValue(mDate.toDate());
  }

  setNewValue(date: Date) {
    this.value = date;
    this.value$.next(this.value);

    this.timeChanged.emit(this.value);
  }

  ngOnInit() {
    if (this.value) this.value$.next(this.value);
    if (!this.value) this.timeChanged.emit(this.value$.value);

    this.hour$.subscribe(hour =>
      this.hourInput.setValue(hour.toString().padStart(2, '0'))
    );
    this.minute$.subscribe(minute =>
      this.minuteInput.setValue(minute.toString().padStart(2, '0'))
    );
    this.second$.subscribe(minute =>
      this.secondInput.setValue(minute.toString().padStart(2, '0'))
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
