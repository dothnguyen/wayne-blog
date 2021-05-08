import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, filter, last } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'spectre-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class SpectreCalendarComponent implements OnInit {
  @Input('inline')
  isInline = false;

  @Input('value')
  dateValue: Date = null;

  @Output('dateClicked') dateClicked = new EventEmitter<Date>();

  mDate = moment();

  date$ = new BehaviorSubject<moment.Moment>(null);
  monthYear$: Observable<string>;

  dates$: Observable<Array<Array<moment.Moment>>>;

  constructor() {
    this.monthYear$ = this.date$.pipe(
      filter(d => {
        return !!d;
      }),
      map(d => {
        return d.format('MMMM YYYY');
      })
    );

    this.dates$ = this.date$.pipe(
      filter(d => !!d),
      map(date => {
        var currentMonthDates = new Array(date.daysInMonth())
          .fill(null)
          .map((x, i) =>
            moment(date)
              .startOf('month')
              .add(i, 'days')
          );

        // first day of month
        var firstDay = currentMonthDates[0].day();

        if (firstDay > 0) {
          for (var i = firstDay - 1; i >= 0; i--) {
            currentMonthDates = [
              moment(date)
                .startOf('month')
                .add(i - firstDay, 'days'),
              ...currentMonthDates
            ];
          }
        }

        var noOfDaysShort = 7 - (currentMonthDates.length % 7);

        var lastDay = currentMonthDates[currentMonthDates.length - 1];

        for (var i = 1; i <= noOfDaysShort; i++) {
          currentMonthDates.push(moment(lastDay).add(i, 'days'));
        }
        // convert to 2-d array
        var dates = currentMonthDates.reduce(
          (rows, key, index) =>
            (index % 7 == 0
              ? rows.push([key])
              : rows[rows.length - 1].push(key)) && rows,
          []
        );

        return dates;
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dateValue'] && changes['dateValue'].currentValue) {
      this.mDate = moment(changes['dateValue'].currentValue as Date);
      this.date$.next(this.mDate);
    }
  }

  getPreviousMonth() {
    return moment(this.mDate)
      .add(-1, 'months')
      .month();
  }

  getNextMonth() {
    return moment(this.mDate)
      .add(1, 'months')
      .month();
  }

  isToday(d: moment.Moment) {
    return moment().isSame(d, 'day');
  }

  isSelected(d: moment.Moment) {
    return this.dateValue && moment(this.dateValue).isSame(d, 'day');
  }

  clickOnDate(d: moment.Moment) {
    this.dateValue = d.toDate();
    this.dateClicked.emit(d.toDate());
  }

  clickNextMonth() {
    this.mDate = this.mDate.add(1, 'months');
    this.date$.next(this.mDate);
  }

  clickPrevMonth() {
    this.mDate = this.mDate.add(-1, 'months');
    this.date$.next(this.mDate);
  }

  ngOnInit() {
    if (this.dateValue) {
      this.mDate = moment(this.dateValue);
    }

    this.date$.next(this.mDate);
  }
}
