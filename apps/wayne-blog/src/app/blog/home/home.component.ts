import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { CustomDropdownComponent } from '../../shared/custom-dropdown/custom-dropdown.component';
import * as moment from 'moment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Popover } from '../../shared/popover/popover.service';
import { SpectreDateTimePickerComponent } from '../../shared/datetimepicker/datetimepicker.component';
import { Observable, BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { PostsService } from '../../services/posts.service';
import { Post } from '../../models/models';
import { SortDir, SortParam } from '../../models/sortparam';
import { takeUntil, flatMap, map, shareReplay, tap, delay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverRef } from '../../shared/popover/popover-ref';
import { BlogHomeSharedService } from '../blog-home/blog-home-shared.service';

@Component({
  selector: 'wayne-repo-home',
  templateUrl: './home.component.html',
  styles: [`
  :host {
    height: 100%;
    width: 100%;
    display: block;
  }

  :host > div {
    height: 100%;
  }
  `, ``]
})
export class HomeComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<any>();

  // testDate = moment('02/08/2019 01:05', 'DD/MM/YYYY HH:mm').toDate();

  // testDate2 = new Date();

  // fb: FormGroup;

  // data = [
  //   'New Hampshire',
  //   'New Jersey',
  //   'New Mexico',
  //   'New York',
  //   'North Carolina',
  //   'North Dakota',
  //   'Ohio',
  //   'Oklahoma',
  //   'Oregon',
  //   'Pennsylvania',
  //   'Rhode Island',
  //   'South Carolina',
  //   'South Dakota',
  //   'Tennessee',
  //   'Texas',
  //   'Utah',
  //   'Vermont',
  //   'Virginia',
  //   'Washington',
  //   'West Virginia',
  //   'Wisconsin',
  //   'Wyoming'
  // ];

  // mode: 'single' | 'multiple' = 'single';

  // allTags$: Observable<Array<string>>;

  // list of published posts
  posts$: Observable<Array<Post>>;

  // total number of post
  pageCount$ = new BehaviorSubject(0);

  // page index
  pageIdx$ = new BehaviorSubject(1);

  // default sort
  sort: SortParam = {
    publishDate: SortDir.DESC
  };

  // stream of sorting param the list
  sort$ = new BehaviorSubject(this.sort);

  @ViewChild('homeOuter') homeOuter: ElementRef;

  constructor(
    private popper: Popover,
    private postService: PostsService,
    private cdref: ChangeDetectorRef,
    private router: Router,
    public homeSharedService: BlogHomeSharedService,
    private route: ActivatedRoute
  ) {
    // this.fb = new FormGroup({
    //   testDate1: new FormControl(null, [Validators.required]),
    //   testDate2: new FormControl(this.testDate, []),
    //   select: new FormControl(null, [Validators.required])
    // });

    // this.allTags$ = this.postService.getTags();

    

    route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(param => {
      var tag = param.get('tag');
      this.homeSharedService.tags$.next(tag || '');
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @ViewChild('dropdown')
  public dropdown: CustomDropdownComponent;

  ngOnInit(): void {
    this.posts$ = combineLatest(
      this.pageIdx$,
      this.sort$,
      //this.search$,
      this.homeSharedService.tags$.pipe(takeUntil(this.destroy$))
    ).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.popper.openLoadingDialog(
          'home-container',
          document.getElementsByClassName('home-container')[0],
          'Loading...'
        );
      }),
      flatMap(([pageIdx, sort /*, searchTerm*/, tags], _) => {
        return this.postService.getPosts(
          pageIdx,
          6, // 10 post per page
          sort,
          '',
          tags ? [tags] : []
        );
      }),
      map(pagedResult => {
        if (pagedResult) {
          if (pagedResult.rowCount)
            this.pageCount$.next(Math.ceil(pagedResult.rowCount / 6));

          return pagedResult.results as Array<Post>;
        } else {
          return [] as Array<Post>;
        }
      }),
      shareReplay(),

      //delay(3000),

      tap(() => {
        this.popper.closeLoading('home-container');
      })
    );
  }

  ngAfterViewInit() {
    
  }

  // changeMode() {
  //   if (this.mode === 'single') {
  //     this.mode = 'multiple';
  //   } else {
  //     this.mode = 'single';
  //   }
  //   // to prevent ExpressionChangedAfterItHasBeenCheckedError
  //   this.cdref.detectChanges();
  // }

  // toggleDropdown() {
  //   if (this.dropdown.showing) {
  //     this.dropdown.hide();
  //   } else {
  //     this.dropdown.show();
  //   }
  // }

  // onDateSelected(d) {
  //   this.testDate = d;
  // }

  // openPopover(origin) {
  //   const ref = this.popper.open<{ skills: number[] }>({
  //     //content,
  //     //  content: 'Hello world!',
  //     content: SpectreDateTimePickerComponent,
  //     origin,
  //     width: '200px',
  //     data: {
  //       skills: [1, 2, 3]
  //     },
  //     hasBackdrop: true
  //   });

  //   ref.afterClosed$.subscribe(res => {
  //     console.log(res);
  //   });
  // }

  changePage(pageIdx) {
    this.pageIdx$.next(pageIdx);
  }
}
