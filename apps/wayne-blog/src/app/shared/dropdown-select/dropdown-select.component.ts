import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  Renderer2,
  HostListener,
  SimpleChanges,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  Observable,
  Subject,
  combineLatest,
  BehaviorSubject
} from 'rxjs';
import { SpectreDropdownListComponent } from '../dropdown-list/dropdown-list.component';
import { PopoverRef } from '../popover/popover-ref';
import { Popover } from '../popover/popover.service';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs/operators';
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'spectre-dropdown-select',
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['./dropdown-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SpectreDropdownSelectComponent),
      multi: true
    }
  ]
})
export class SpectreDropdownSelectComponent
  implements OnInit, ControlValueAccessor {
  @Input('mode')
  public mode: 'single' | 'multiple' = 'single';

  @Input('closeOnSelect')
  closeOnSelect: boolean = false;

  @Input('data')
  public data: Array<any>;

  @Input() disabled = false;

  @Input('value')
  public value: any | Array<any>;

  @ViewChild('inputText', { read: ElementRef }) inputText: ElementRef;

  @ViewChild('selectContainer', { read: ElementRef })
  selectContainer: ElementRef;

  popoverRef: PopoverRef;
  drpdComponent: SpectreDropdownListComponent;

  destroy$ = new Subject();

  clicked = false;
  clickInPopover = false;

  searchInput = new FormControl('');

  data$ = new BehaviorSubject<Array<any>>([]);

  filteredData$: Observable<Array<any>>;
  valueChanges = new BehaviorSubject<any | Array<any>>(null);

  keydowned = false;

  // Function to call when the rating changes.
  onChange = (tags: string | Array<string>) => {};

  // Function to call when the input is touched (when a star is clicked).
  onTouched = () => {};

  constructor(
    private popper: Popover,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef
  ) {}

  writeValue(obj: any): void {
    this.value = obj;
    this.onChange(this.value);
    this.valueChanges.next(this.value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit() {
    this.data$.next(this.data);

    if (this.mode === 'multiple') {
      if (this.value) {
        if (!(this.value instanceof Array)) {
          this.value = [this.value];
        }
      } else {
        this.value = [];
      }

      this.searchInput.valueChanges
        .pipe(
          debounceTime(400),
          map(val => val.trim()),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe(val => {
          if (this.drpdComponent) this.drpdComponent.search(val);
        });
    }

    this.filteredData$ = combineLatest(
      this.data$,
      this.valueChanges.pipe(filter(val => !!val))
    ).pipe(
      map(([arr, values]) => {
        let result = arr;
        if (values instanceof Array && values.length && arr && arr.length) {
          result = arr.filter(item => {
            if (item instanceof String) {
              return !values.includes(item);
            } else if (item['id']) {
              return !values.some(v => v['id'] === item['id']);
            } else if (item['getId'] instanceof Function) {
              return !values.some(v => v['getId']() === item['getId']());
            } else {
              return !values.some(v => v.toString() === item.toString());
            }
          });
        }
        return result;
      })
    );

    this.filteredData$.pipe(takeUntil(this.destroy$)).subscribe(ite => {
      if (this.drpdComponent) {
        this.drpdComponent.setData(ite);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mode'] && changes['mode'].currentValue) {
      if (this.mode === 'multiple') {
        if (this.value) {
          this.value = [this.value];
        } else {
          this.value = [];
        }
        this.valueChanges.next(this.value);
        this.onChange(this.value);
      } else {
        this.value = null;
        this.valueChanges.next(this.value);
        this.onChange(this.value);
      }
      this.cdRef.detectChanges();
    }

    if (changes['data']) {
      let data = changes['data'].currentValue;
      if (!data) {
        data = [];
      }

      this.data = data;
      this.data$.next(data);
    }
  }

  removeItem(item: any) {
    let arr = this.value as Array<any>;
    let idx = arr.indexOf(item);
    arr.splice(idx, 1);

    this.value = arr;

    setTimeout(() => {
      if (this.popoverRef) this.popoverRef.updatePosition();
    }, 10);

    this.valueChanges.next(this.value);
    this.onChange(this.value);

    this.inputText.nativeElement.focus();
  }

  containerClicked() {
    this.inputText.nativeElement.focus();
  }

  onMultipleArrowUp() {
    if (this.mode === 'multiple' && this.drpdComponent) {
      this.drpdComponent.onArrowUp();
    }
  }

  onMultipleArrowDown() {
    if (this.mode === 'multiple' && this.drpdComponent) {
      this.drpdComponent.onArrowDown();
    }
  }

  onMultiplePressEnter() {
    if (this.mode === 'multiple' && this.drpdComponent) {
      this.drpdComponent.onPressEnter();
    }
  }

  onPressBackspace() {
    if (this.mode === 'multiple') {
      if (this.searchInput.value === '') {
        if (!this.keydowned) {
          this.keydowned = true;
        } else {
          if (this.value.length) {
            this.removeItem(this.value[this.value.length - 1]);
          }

          this.keydowned = false;
        }
      }
    }
  }

  multipleContainerClick() {
    if (this.mode === 'multiple') {
      this.inputText.nativeElement.focus();
    }
  }

  onMultipleInputFocus() {
    if (!this.popoverRef) {
      this.selectContainer.nativeElement['dtpShowing'] = true;
      this.showDropdownList();
      //this.clicked = true;
    }
  }

  onMultipleInputBlur() {
    // delay popover close to check for next active
    if ((this.clicked && !this.clickInPopover) || !this.clicked) {
      this.closeDropdown();
    }

    this.clicked = false;
  }

  onPressEsc() {
    this.closeDropdown();
  }

  @HostListener('document:mousedown', ['$event']) documentClick(
    event: MouseEvent
  ) {
    this.clicked = true;

    if (
      (this.drpdComponent &&
        this.drpdComponent.container.nativeElement.contains(event.target)) ||
      this.selectContainer.nativeElement.contains(event.target)
    ) {
      this.clickInPopover = true;
      return;
    }

    this.clickInPopover = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (
      this.popoverRef &&
      !this.isMouseInRect(
        event,
        this.drpdComponent.container.nativeElement.getBoundingClientRect()
      ) &&
      !this.isMouseInRect(
        event,
        this.selectContainer.nativeElement.getBoundingClientRect()
      )
    ) {
      this.closeDropdown();
    }

    this.clickInPopover = false;
  }

  singleInputFocus() {
    if (this.mode === 'single') {
      if (!this.popoverRef) {
        this.showDropdownList();
      }
      this.clicked = false;
    }
  }

  singleInputClick() {
    if (this.mode === 'single') {
      if (!this.popoverRef) {
        this.showDropdownList();
      } else {
        if (this.clicked) this.closeDropdown();
        else this.drpdComponent.focusInput();
      }
    }
  }

  showDropdownList() {
    this.popoverRef = this.popper.open<any>({
      content: SpectreDropdownListComponent,
      origin: this.selectContainer.nativeElement,
      width: this.selectContainer.nativeElement.getBoundingClientRect().width,
      data: {
        value: this.value,
        data: this.data,
        showSearch: this.mode === 'single',
        searchInputRef: this.mode === 'multiple' ? this.inputText : null
      },
      hasBackdrop: false
    });

    this.popoverRef.afterClosed$.subscribe(res => {});

    this.drpdComponent = this.popoverRef.componentRef
      .instance as SpectreDropdownListComponent;

    this.drpdComponent.focusInput();

    this.renderer.addClass(
      this.drpdComponent.container.nativeElement,
      'popover'
    );

    this.drpdComponent.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((item: any) => {
        if (this.mode === 'single') {
          this.value = item;
        } else {
          (this.value as Array<any>).push(item);
          setTimeout(() => {
            if (this.popoverRef) this.popoverRef.updatePosition();
          }, 10);
        }

        this.valueChanges.next(this.value);
        this.onChange(this.value);

        if (this.closeOnSelect) {
          this.closeDropdown();
        }
      });

    this.popoverRef.afterClosed$.subscribe(res => {
      this.selectContainer.nativeElement['drpdShowing'] = null;
    });

    this.drpdComponent.escPress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onPressEsc());

    this.drpdComponent.blur$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.clicked && this.popoverRef) {
        this.closeDropdown();
      }
    });

    // initial value
    this.valueChanges.next(this.value);
  }

  closeDropdown() {
    if (this.popoverRef) {
      this.popoverRef.close();
      this.popoverRef = null;
    }
    this.clicked = false;
    this.clickInPopover = false;
    this.drpdComponent = null;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  private isMouseInRect(event: MouseEvent, elRect: DOMRect) {
    if (
      event.clientX >= elRect.left &&
      event.clientX <= elRect.right &&
      event.clientY >= elRect.top &&
      event.clientY <= elRect.bottom
    ) {
      return true;
    }

    return false;
  }
}
