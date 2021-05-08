import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { PostListComponent } from './post-list/post-list.component';
import { PostComponent } from './post/post.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule, MarkdownComponent } from 'ngx-markdown';
import { NgLetDirective } from '../directives/ng-let.directive';
import { CustomDirectiveModule } from '../directives/directive.module';
import { PostResolver } from '../resolver/PostResolver';
import { SharedModule } from '../shared/shared.module';

const appRoutes: Routes = [
  {
    path: '', 
    component: AdminHomeComponent, 
    children: [
      { path: '', redirectTo: 'posts', pathMatch: 'full'},
      { path: 'posts', component: PostListComponent},
      { path: 'posts/new', component: PostComponent},
      { path: 'posts/:id', component: PostComponent, resolve: {postData: PostResolver}}
    ]
  }
];

@NgModule({
  declarations: [
    AdminHomeComponent, 
    PostListComponent, 
    PostComponent
  ],
  imports: [
    CommonModule,
    CustomDirectiveModule, 
    SharedModule,
    ReactiveFormsModule, 
    RouterModule.forChild(appRoutes), 
    MarkdownModule.forChild()]
})
export class AdminModule {}
