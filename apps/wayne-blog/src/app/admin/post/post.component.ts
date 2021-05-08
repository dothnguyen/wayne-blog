import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { conditionalValidator } from '../../utils';
import { PostsService } from '../../services/posts.service';

import { Post } from '../../models/models';
import { tap, flatMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';
import { AuthService } from '../../services/auth.service';
import { ServiceResult, ResultCode } from '../../models/serviceresult';

@Component({
  selector: 'wayne-repo-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  saving = false;
  post: Post;

  @ViewChild('tagEl') tagEl: ElementRef;

  postForm: FormGroup;
  title = new FormControl('', [Validators.required]);
  content = new FormControl('', [Validators.required]);
  publish = new FormControl('1', [Validators.required]);
  publishDate = new FormControl('', [
    conditionalValidator(
      () => this.postForm.get('publish').value === '2',
      Validators.required
    )
  ]);

  tag = new FormControl([]);

  tags: Array<string> = new Array<string>();

  constructor(
    private postService: PostsService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.tags = new Array<string>();
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

    if (this.post) {
      this.title.setValue(this.post.title);
      this.content.setValue(this.post.content);
      //this.tags = this.post.tags;
      this.tag.setValue(this.post.tags);
      this.publish.setValue(this.post.publish.toString());
      if (this.post.publish === 2) {
        this.publishDate.setValue(moment.utc(this.post.publishDate).toDate());
      }
    }

    this.postForm = new FormGroup({
      title: this.title,
      content: this.content,
      publish: this.publish,
      tag: this.tag,
      publishDate: this.publishDate
    });

    this.publish.valueChanges.subscribe(val => {
      this.publishDate.updateValueAndValidity();
    });
  }

  // validateExistTag(): ValidatorFn {
  //   return (tagControl: FormControl): { [key: string]: any } | null => {
  //     const val = tagControl.value;
  //     if (this.tags && this.tags.indexOf(val) >= 0) {
  //       return { tagexist: 'Tag already added' };
  //     }

  //     return null;
  //   };
  // }

  // addTag() {
  //   this.tags.push(this.tag.value);
  //   this.tag.setValue('');
  //   this.tagEl.nativeElement.focus();
  // }

  // removeTag(t) {
  //   this.tags = this.tags.filter(i => i !== t);
  // }

  savePost() {
    let publishDateVal = null;
    if (this.publish.value === '1') {
      // publish now
      publishDateVal = moment()
        .toDate();
    } else if (this.publish.value === '2') {
      publishDateVal = moment(this.publishDate.value)
        .toDate();
    }

    var post = new Post(
      this.post? this.post.id: 0,
      this.title.value,
      this.content.value,
      this.publish.value * 1,
      publishDateVal,
      null,
      this.tag.value,
      this.authService.currentUserSubject$.value.uid
    );

    of(post)
      .pipe(
        tap(() => {
          this.saving = true;
        }),
        flatMap(post => this.postService.savePost(post)),
        tap(() => {
          this.saving = false;
        })
      )
      .subscribe(ret => {
        this.router.navigateByUrl('/admin/posts');
      });
  }
}
