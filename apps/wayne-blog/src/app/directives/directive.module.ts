import { NgModule } from '@angular/core';
import { NgLetDirective } from './ng-let.directive';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [NgLetDirective],
  imports: [CommonModule],
  exports: [NgLetDirective]
})
export class CustomDirectiveModule {}
