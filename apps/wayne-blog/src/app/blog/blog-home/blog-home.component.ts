import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PostsService } from '../../services/posts.service';
import { BlogHomeSharedService } from './blog-home-shared.service';
import { HomeComponent } from '../home/home.component';
import { Router } from '@angular/router';

@Component({
  selector: 'wayne-repo-blog-home',
  templateUrl: './blog-home.component.html',
  styleUrls: ['./blog-home.component.scss']
})
export class BlogHomeComponent implements OnInit {
  tagCounts$: Observable<Array<any>>;

  curComponent: Component;

  constructor(
    private postService: PostsService,
    private homeSharedService: BlogHomeSharedService,
    private router: Router
  ) {
    this.tagCounts$ = this.postService.getTagCounts();
  }

  ngOnInit() {}

  onActivate(component) {
    this.curComponent = component;
  }

  onTagClick(tag) {
    var curUrl = this.router.url;

    this.router.navigate(['/posts/tags/', tag]);

    if (!curUrl.startsWith('/posts/tags/')) {
      // wait for the router to change nav before emit the next tags
      setTimeout(() => this.homeSharedService.tags$.next(tag));
    }
  }
}
