import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [
    `
    header {
      height: 100px;
    }

    .navtitle {
      align-items: start;
      flex-direction: column
    }

    navbuttons {
      align-items: end;
    }
    `
  ]
})
export class HeaderComponent implements OnInit {

  constructor(public auth: AuthService) { }

  ngOnInit() {
  }

}
