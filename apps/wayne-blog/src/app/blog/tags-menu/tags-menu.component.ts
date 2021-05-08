import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BlogHomeSharedService } from '../blog-home/blog-home-shared.service';

@Component({
  selector: 'wayne-repo-tags-menu',
  templateUrl: './tags-menu.component.html',
  styleUrls: ['./tags-menu.component.scss']
})
export class TagsMenuComponent implements OnInit {
  @Input() tagCounts: Array<any>;

  @Output() tagClick = new EventEmitter<string>();

  constructor(public homeSharedService: BlogHomeSharedService) {}

  ngOnInit() {}

  onTagClick(item) {
    this.tagClick.next(item.tag);
  }
}
