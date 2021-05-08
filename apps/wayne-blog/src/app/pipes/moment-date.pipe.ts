import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';

@Pipe({
  name: 'momentDate'
})
export class MomentDatePipe extends DatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if(value) {
      var mDate = moment.utc(value);
      return super.transform(mDate.toDate(), args);
    }
    return super.transform(value, args);
  }
}
