import { Injectable } from '@angular/core';
import { BehaviorSubject, of, from, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { map, first, filter, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUserSubject$ = new BehaviorSubject(null);
  currentUser$: Observable<any>;
  
  constructor(private fireAuth: AngularFireAuth) {
    this.currentUser$ = this.currentUserSubject$.asObservable();
   }

  login(value: {username: string, password: string}): Observable<any> { 
    
    return from(this.fireAuth.signInWithEmailAndPassword(value.username, value.password)).pipe(
      tap(u => this.currentUserSubject$.next(u))
    );
  }

}
