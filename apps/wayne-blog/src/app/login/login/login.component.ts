import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BehaviorSubject, Subject, of, timer } from 'rxjs';
import { takeUntil, map, tap, first, take, withLatestFrom, catchError, switchMap, filter, shareReplay, flatMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'wayne-repo-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {

  loading = false;

  // login form
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  destroy$ = new Subject<any>();

  submit$ = new Subject<any>();

  loginErr$ = new BehaviorSubject(false);

  constructor(private auth: AuthService, private userService: UserService, private router: Router) {
    this.auth.curUserProfile$
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe(
        userProfile => {
          console.log(userProfile);
          if (userProfile) {
            this.router.navigate(['/admin']);
          } else {
            // don't have a profile yet => update one
            this.router.navigate(['/profile']);
          }
        },
        err => {
          this.loading = false;
          this.loginErr$.next(true);
          setTimeout(() => this.loginErr$.next(false), 2000);
        }
      );
  }

  ngOnInit(): void {

  }

  ngDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login() {
    this.loading = true;
    this.auth.login(this.loginForm.value);
  }
 
}
