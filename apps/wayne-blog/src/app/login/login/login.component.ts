import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BehaviorSubject, Subject, of, timer } from 'rxjs';
import { takeUntil, map, tap, first, take, withLatestFrom, catchError, switchMap, filter } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'wayne-repo-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  // login form
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  destroy$ = new Subject<any>();

  submit$ = new Subject<any>();

  loginErr$ = new BehaviorSubject(false);

  constructor(private auth: AuthService, private router: Router) {
    this.auth.currentUser$.pipe(
      filter(u => u),
      takeUntil(this.destroy$)
    ).subscribe(
      u => {
        console.log(u);
        this.router.navigate(['/admin'])
      }
    )
  }

  ngOnInit(): void {
    this.submit$.pipe(
      withLatestFrom(this.loginForm.valueChanges, (_, values) => values),
      switchMap(values => this.auth.login(values)),
    ).subscribe(
      value => {
        console.log(value)
      },
      err => {
        console.error(err);
        this.loginErr$.next(true);
        setTimeout(()=>this.loginErr$.next(false), 2000);
      }
    )
  }

  ngDestroy() {
    this.destroy$.next();
  }
 
}
