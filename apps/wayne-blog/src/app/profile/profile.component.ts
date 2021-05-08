import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { map, withLatestFrom, switchMap, first, flatMap, filter } from 'rxjs/operators';
import { UserProfile } from '../models/models';
import { of } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'wayne-repo-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  loading = false;

  profileForm: FormGroup;

  constructor(private userService: UserService, private auth: AuthService, private router: Router) { }

  ngOnInit() {

    const curProfile = this.userService.userProfile;

    this.profileForm = new FormGroup({
      username: new FormControl(curProfile?.userName, [Validators.required]),
      avatarUrl: new FormControl(curProfile?.avatarURL, [Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')])
    });
  }

  saveProfile() {
    const values = this.profileForm.value;
    const curProfile = this.userService.userProfile;

    of(curProfile).pipe(
      withLatestFrom(this.auth.currentUser$),
      map(([profile, user]) => {
        if (!profile) {
          const newProfile = new UserProfile();
          newProfile.id = user.uid;
          newProfile.email = user.email;
          newProfile.userName = values.username;
          newProfile.avatarURL = values.avatarUrl;

          return {mode: 1, profile: newProfile};
        } else {
          profile.userName = values.username;
          profile.avatarURL = values.avatarUrl;

          return {mode: 2, profile: profile};
        }
      }),
      flatMap((obj: {mode: Number, profile: UserProfile}) => {
        return this.userService.updateUser(obj.mode == 2? obj.profile.id : null, obj.profile)
      })
    ).subscribe(
      (ret) => {
        if (ret) {
          // reload user profile
          this.auth.currentUserSubject$.next(this.auth.currentUserSubject$.value);
          this.router.navigateByUrl("/admin");
        }
      },
      (err) => {
        console.log(err);
      }
    )

  }
}
