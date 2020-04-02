import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';

import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [{ path: '', component: LoginComponent }];

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, RouterModule.forChild(appRoutes), ReactiveFormsModule]
})
export class LoginModule {}
