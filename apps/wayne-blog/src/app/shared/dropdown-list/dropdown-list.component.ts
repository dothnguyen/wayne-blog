import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  QueryList,
  ViewChildren,
  AfterViewInit,
  SimpleChanges
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  isObservable,
  combineLatest,
  of,
  merge,
  Subject,
  from
} from 'rxjs';
import { FormControl } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  toArray,
  startWith,
  tap,
  count,
  take,
  takeLast,
  filter,
  reduce,
  takeUntil
} from 'rxjs/operators';

@Component({
  selector: 'spectre-dropdown-list',
  templateUrl: './dropdown-list.component.html',
  styleUrls: ['./dropdown-list.component.scss']
})
export class SpectreDropdownListComponent implements OnInit, AfterViewInit {
  @Input('showSearch')
  showSearch: boolean = true;

  @Input('data')
  public data: Array<any>;

  @Input('searchInputRef')
  private searchInputRef: ElementRef;

  @ViewChild('container', { static: false })
  container: ElementRef;

  @ViewChild('ulElement', { static: false })
  private ulElement: ElementRef;

  @ViewChild('input', { static: false })
  private input: ElementRef;

  @ViewChildren('liElements')
  private liElements: QueryList<ElementRef>;

  searchValue$ = new BehaviorSubject('');

  searchInput = new FormControl('');
  searchResult$: Observable<Array<any>>;
  searchCount$ = new BehaviorSubject<number>(0);

  data$ = new BehaviorSubject<Array<any>>([]);

  curIndex: number = 0;
  searchCount = 0;
  searchResultArr: Array<any>;

  valueChanges = new Subject<any>();

  destroy$ = new Subject();

  escPress$ = new Subject();
  blur$ = new Subject();

  constructor() {}

  ngOnInit() {
    if (!this.data) this.data = [];

    this.data$.next(this.data);

    this.searchResult$ = combineLatest(
      merge(
        this.searchInput.valueChanges.pipe(
          debounceTime(200),
          distinctUntilChanged(),
          startWith('')
        ),
        this.searchValue$
      ),
      this.data$
    ).pipe(
      map(([searchTerm, arr]): any[] => {
        if (searchTerm.trim() == '') return arr;

        return arr.filter(item =>
          item
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      }),
      tap((arr: any[]) => {
        this.searchResultArr = arr || [];
        this.searchCount = this.searchResultArr.length;
        if (this.curIndex > this.searchCount - 1) {
          this.curIndex = 0;
          this.scrollToTop();
        }
      })
    );
  }

  setData(data: any[]) {
    this.data = data;
    this.data$.next(this.data);
  }

  ngAfterViewInit() {
    if (!this.searchInputRef && this.input) this.searchInputRef = this.input;
  }

  onBlur() {
    this.blur$.next();
  }

  onPressEnter() {
    if (this.curIndex >= 0) {
      this.valueChanges.next(this.searchResultArr[this.curIndex]);
    }
  }

  onPressEsc() {
    this.escPress$.next();
  }

  itemClick(item) {
    this.valueChanges.next(item);
  }

  search(searchValue: string) {
    this.searchValue$.next(searchValue);
  }

  mouseEnter(event: MouseEvent, index: number) {
    this.curIndex = index;
  }

  onArrowUp() {
    if (this.curIndex > 0) {
      this.curIndex = this.curIndex - 1;
      this.scrollPrevious(this.curIndex);
    }
  }

  onArrowDown() {
    // down arrow
    if (this.curIndex <= this.searchCount - 2) {
      this.curIndex = this.curIndex + 1;
      this.scrollNext(this.curIndex);
    }
  }

  focusInput() {
    if (this.searchInputRef) this.searchInputRef.nativeElement.focus();
  }

  scrollPrevious(index: number): void {
    if (index === 0) {
      this.scrollToTop();

      return;
    }
    if (this.liElements) {
      const liElement = this.liElements.toArray()[index - 1];
      if (liElement && !this.isScrolledIntoView(liElement.nativeElement)) {
        this.ulElement.nativeElement.scrollTop =
          liElement.nativeElement.offsetTop;
      }
    }
  }

  scrollNext(index: number): void {
    if (index === this.searchCount - 1) {
      this.scrollToBottom();

      return;
    }

    if (this.liElements) {
      const liElement = this.liElements.toArray()[index + 1];
      if (liElement && !this.isScrolledIntoView(liElement.nativeElement)) {
        this.ulElement.nativeElement.scrollTop =
          liElement.nativeElement.offsetTop -
          Number(this.ulElement.nativeElement.offsetHeight) +
          Number(liElement.nativeElement.offsetHeight);
      }
    }
  }

  private isScrolledIntoView = function(elem: HTMLElement) {
    const containerViewTop: number = this.ulElement.nativeElement.scrollTop;
    const containerViewBottom =
      containerViewTop + Number(this.ulElement.nativeElement.offsetHeight);
    const elemTop = elem.offsetTop;
    const elemBottom = elemTop + elem.offsetHeight;

    return elemBottom <= containerViewBottom && elemTop >= containerViewTop;
  };

  private scrollToTop(): void {
    if (this.ulElement) this.ulElement.nativeElement.scrollTop = 0;
  }

  private scrollToBottom(): void {
    this.ulElement;
    this.ulElement.nativeElement.scrollTop = this.ulElement.nativeElement.scrollHeight;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
