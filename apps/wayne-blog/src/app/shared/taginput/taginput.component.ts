import {
  Component,
  OnInit,
  Input,
  ElementRef,
  Renderer2,
  ViewChild,
  ChangeDetectionStrategy,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'spectre-taginput',
  templateUrl: './taginput.component.html',
  styleUrls: ['./taginput.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SpectreTaginputComponent),
      multi: true
    }
  ]
})
export class SpectreTaginputComponent implements OnInit, ControlValueAccessor {
  @Input() value: Array<string> = [];

  @ViewChild('inputText', { read: ElementRef }) inputText: ElementRef;

  keydowned = false;

  @Input() disabled = false;

  // Function to call when the rating changes.
  onChange = (tags: Array<string>) => {};

  // Function to call when the input is touched (when a star is clicked).
  onTouched = () => {};

  stateChanges = new Subject<any>();

  constructor(private elRef: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(elRef.nativeElement, 'tagsinput');
  }

  writeValue(obj: any): void {
    this.value = obj;
    this.onChange(this.value);
    this.stateChanges.next();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  textKeydown(event: KeyboardEvent) {
    var value = this.inputText.nativeElement.value.trim();
    if (value === '') {
      if (!this.keydowned) {
        if (event.keyCode === 8) this.keydowned = true;
      } else {
        if (event.keyCode === 8) {
          if (this.value.length) {
            this.removeItem(this.value[this.value.length - 1]);
          }
        }
        this.keydowned = false;
      }
    } else {
      this.keydowned = false;
    }
  }

  textKeyup(event: KeyboardEvent) {
    var value = this.inputText.nativeElement.value.trim();
    if (value.length > 6) {
      if (value.length < 35)
        this.inputText.nativeElement.size = value.length + 3;
    } else {
      this.inputText.nativeElement.size = 6;
    }

    if (event.keyCode === 13 && value !== '') {
      // enter key in input text
      if (!this.value.includes(value)) {
        this.value.push(value);
        this.onChange(this.value);
      }
      this.inputText.nativeElement.value = '';
    }
  }

  containerClicked() {
    this.inputText.nativeElement.focus();
  }

  ngOnInit() {}

  removeItem(item) {
    this.value = this.value.filter(i => i !== item);
    this.onChange(this.value);
  }
}
