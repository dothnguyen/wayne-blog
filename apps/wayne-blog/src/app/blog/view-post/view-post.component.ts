import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Post } from '../../models/models';
import { ServiceResult, ResultCode } from '../../models/serviceresult';

@Component({
  selector: 'wayne-repo-view-post',
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.scss']
})
export class ViewPostComponent implements OnInit {
  destroy$ = new Subject<any>();

  post: Post;

  constructor(private route: ActivatedRoute) {
    
  }

  ngOnInit() {

    var postResult = this.route.snapshot.data.postData as ServiceResult;
    if (postResult) {
      if (postResult.code === ResultCode.OK) {
        this.post = postResult.result as Post;
      } else {
        // error => TODO handle error
      }
    }

    // this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
    //   console.log(data);
    //   this.post = data['post'];
    // });
  }
}
