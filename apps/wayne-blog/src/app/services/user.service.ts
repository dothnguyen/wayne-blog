import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserProfile } from '../models/models';
import { Observable, from, defer } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ServiceResult } from '../models/serviceresult';
import { BASE_API_URL } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  //USER_ENPOINT = 'http://localhost:5000/api/users';
  USER_ENPOINT = `${BASE_API_URL}/users`;

  userProfile: UserProfile;

  constructor(private http: HttpClient) {}

  getUser(id: string): Observable<UserProfile> {
    return this.http.get<ServiceResult>(`${this.USER_ENPOINT}/${id}`).pipe(
      map(result => result.result),
      tap(profile => (this.userProfile = profile))
    );
  }

  updateUser(id: string, profile: UserProfile) {
    if (!id) {
      // new
      return this.http.post<boolean>(`${this.USER_ENPOINT}`, profile);
    } else {
      return this.http.put<boolean>(`${this.USER_ENPOINT}/${id}`, profile);
    }
  }
}
