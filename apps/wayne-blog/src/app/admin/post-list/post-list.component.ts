import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { Post } from '../../models/models';
import { PostsService } from '../../services/posts.service';
import { Router } from '@angular/router';
import { shareReplay, map, flatMap, takeUntil, debounceTime, distinctUntilChanged, startWith, tap, switchMap, delay } from 'rxjs/operators';
import { calculatePages } from '../../utils';
import { SortParam, SortDir } from '../../models/sortparam';
import { FormControl } from '@angular/forms';
import { Popover } from '../../shared/popover/popover.service';

@Component({
  selector: 'wayne-repo-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  destroy$ = new Subject<any>();

  tagInput = new FormControl([]);
  searchInput = new FormControl('');

  sortDir = SortDir;

  // default sort
  sort: SortParam = {
    lastUpdatedDate: SortDir.DESC
  };

  // stream of sorting param the list
  sort$ = new BehaviorSubject(this.sort);

  // list of post of the current page
  posts$: Observable<Array<Post>>;

  // search criteria
  searchTerm$: Observable<string>;

  // current page index, default is 1
  pageIdx$: BehaviorSubject<number> = new BehaviorSubject(1);

  // page size, default is 10
  pageSize$: BehaviorSubject<number> = new BehaviorSubject(10);

  // total number of post
  count$ = new BehaviorSubject(0);

  // list of pages to be displayed on paginate
  pages$: Observable<Array<number>>;

  // total number of pages
  noOfPage$: Observable<number>;

  search$: Observable<string>;

  tag$: Observable<Array<string>>;

  allTags$: Observable<Array<string>>;

  constructor(
    private postService: PostsService,
    private router: Router,
    private popper: Popover
  ) {
    // calculate the number of pages
    this.noOfPage$ = combineLatest(this.pageSize$, this.count$).pipe(
      map(([pageSize, count]) => {
        return Math.ceil(count / pageSize);
      })
    );

    // calculate the pages to be display on pagination
    this.pages$ = combineLatest(this.noOfPage$, this.pageIdx$).pipe(
      map(([noOfPage, curPage], _) => {
        return calculatePages(noOfPage, curPage);
      })
    );

    // search condition
    this.search$ = this.searchInput.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged()
    );

    this.tag$ = this.tagInput.valueChanges.pipe(
      startWith([]),
      tap(() => console.log('tag changed'))
    );

    this.posts$ = combineLatest(
      this.pageIdx$,
      this.pageSize$,
      this.sort$,
      this.search$,
      this.tag$
    ).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.popper.openLoadingDialog(
          'post-table-container',
          document.getElementsByClassName('post-table-container')[0],
          'Loading...'
        );
      }),
      switchMap(([pageIdx, pageSize, sort, searchTerm, tags], _) => {
        return this.postService.getPosts(
          pageIdx,
          pageSize,
          sort,
          searchTerm,
          tags
        );
      }),
      map(pagedResult => {
        if (pagedResult) {
          if (this.count$.value != pagedResult.rowCount)
            this.count$.next(pagedResult.rowCount);

          return pagedResult.results as Array<Post>;
        } else {
          return [] as Array<Post>;
        }
      }),
      shareReplay(),
      tap(() => {
        this.popper.closeLoading('post-table-container');
      })
    );

    this.allTags$ = this.postService.getTags();
  }

  ngOnInit() {
    this.posts$.subscribe();
  }

  changePage(page) {
    this.pageIdx$.next(page);
  }

  clickSort(col) {
    if (this.sort[col]) {
      if (this.sort[col] == SortDir.ASC) this.sort[col] = SortDir.DESC;
      else this.sort[col] = SortDir.ASC;
    } else {
      this.sort = {};
      this.sort[col] = SortDir.DESC;
    }

    this.sort$.next(this.sort);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
