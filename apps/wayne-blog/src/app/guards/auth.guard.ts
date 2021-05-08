import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): Observable<boolean> {
        return this.authService.isLoggedIn$.pipe(
            map(loggedIn => {
                if (!loggedIn) {
                    this.router.navigateByUrl('/login');
                }
                return loggedIn;
            })
        );
    }
}