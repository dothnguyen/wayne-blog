import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(appRoutes)]
})
export class AdminModule {}
