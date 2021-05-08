import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../../models/models';

@Component({
  selector: 'wayne-repo-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent implements OnInit {
  @Input() post: Post;
  @Input() noHover: false;

  constructor() {}

  ngOnInit() {}

}
