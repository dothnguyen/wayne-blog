import { Component } from '@angular/core';

@Component({
  selector: 'wayne-repo-root',
  template: `
  <div class="container grid-xl">
    <app-header></app-header>
    <router-outlet></router-outlet>
  </div>
  `,

  styles: [
    
  ]
})
export class AppComponent {
  title = 'wayne-blog';
}
