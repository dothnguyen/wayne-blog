import { Injectable } from '@angular/core';
import { BehaviorSubject, of, from, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { map, first, filter, catchError, tap, switchMap, shareReplay, flatMap } from 'rxjs/operators';
import { UserService } from './user.service';
import { UserProfile } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  
  currentUserSubject$ = new BehaviorSubject(JSON.parse(localStorage.getItem('user')));
  
  isLoggedIn$ = this.currentUserSubject$.pipe(
    map(u => !!u)
  )

  curUserProfile$: Observable<UserProfile>;

  currentUser$: Observable<any>;
  
  constructor(private fireAuth: AngularFireAuth, private userService: UserService) {
    this.currentUser$ = this.currentUserSubject$.asObservable().pipe(
      filter((u:any) => u),
    );

    this.curUserProfile$ = this.currentUser$.pipe(
      flatMap(user => this.userService.getUser(user.uid)),
      shareReplay()
    );
  }

  login(value: {username: string, password: string}){ 
    from(this.fireAuth.signInWithEmailAndPassword(value.username, value.password)).pipe(
      first(),
    ).subscribe(u => {
      const user = {
        uid: u.user.uid,
        email: u.user.email
      };

      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject$.next(user);
    });
  }

  logout() {
    this.fireAuth.signOut();
    localStorage.removeItem('user');
    this.currentUserSubject$.next(null);
  }
}
