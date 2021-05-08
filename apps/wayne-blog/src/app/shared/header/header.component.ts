import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [
    `
      header {
        height: 150px;
        background-color: #3582c4;
      }

      header .navtitle * {
        color: white;
      }

      header .nav-item > a,
      header .nav-item > .dropdown > a {
        color: white;
      }

      header .nav-item > a:hover,
      header .nav-item > .dropdown > a:hover {
        color: #f0f3bd;
      }

      header .nav-item.active > a {
        color: rgb(5, 102, 141);
        background-color: white;
      }

      .navtitle {
        align-items: start;
        flex-direction: column;
      }

      .navbuttons {
        align-items: end;
      }
    `
  ]
})
export class HeaderComponent implements OnInit {
  @Output() signout = new EventEmitter<string>();

  constructor(public auth: AuthService) {}

  ngOnInit() {}

  logout() {
    this.signout.emit('');
  }
}
