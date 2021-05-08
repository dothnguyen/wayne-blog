import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './blog/home/home.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { ProfileComponent } from './profile/profile.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthGuard } from './guards/auth.guard';

import { MarkdownModule } from 'ngx-markdown';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { PostCardComponent } from './blog/post-card/post-card.component';
import { TagsMenuComponent } from './blog/tags-menu/tags-menu.component';
import { ViewPostComponent } from './blog/view-post/view-post.component';
import { PostResolver } from './resolver/PostResolver';
import { BlogHomeComponent } from './blog/blog-home/blog-home.component';

const appRoutes: Routes = [
  {
    path: '',
    component: BlogHomeComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'posts/tags/:tag', component: HomeComponent },
      {
        path: 'post/:id',
        component: ViewPostComponent,
        resolve: { postData: PostResolver }
      }
    ]
  },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];

@NgModule({
   declarations: [
      AppComponent,
      HomeComponent,
      ProfileComponent,
      PostCardComponent,
      TagsMenuComponent,
      ViewPostComponent,
      BlogHomeComponent
   ],
   imports: [
      SharedModule,
      BrowserModule,
      HttpClientModule,
      RouterModule.forRoot(appRoutes),
      AngularFireModule.initializeApp(environment.firebaseConfig),
      AngularFirestoreModule,
      AngularFireAuthModule,
      FormsModule,
      ReactiveFormsModule,
      MarkdownModule.forRoot()
   ],
   providers: [],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule {}
