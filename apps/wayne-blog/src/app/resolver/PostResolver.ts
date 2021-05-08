import { PostsService } from '../services/posts.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Popover } from '../shared/popover/popover.service';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostResolver {
  constructor(private postService: PostsService, private popper: Popover) {}

  resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    return this.postService.getPost(id).pipe(
      delay(500)
    );
  }
}
