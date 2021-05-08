import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogHomeSharedService {

  tags$ = new BehaviorSubject('');

  constructor() { }

}
