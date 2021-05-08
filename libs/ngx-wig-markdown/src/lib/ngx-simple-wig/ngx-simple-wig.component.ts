import { Component, OnInit, Input, Inject, ViewChild, ElementRef, SimpleChanges, OnChanges, OnDestroy, AfterViewInit, Output, EventEmitter, ViewEncapsulation, forwardRef } from '@angular/core';
import { TButton, commandFunction, CUSTOM_COMMANDS } from '../config';
import { NgxWigMardownToolbarService } from '../ngx-wig-mardown-toolbar.service';
import { DOCUMENT } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import * as marked from 'marked';
import * as Showdown from 'showdown';

@Component({
  selector: 'ngx-simple-wig',
  templateUrl: './ngx-simple-wig.component.html',
  styleUrls: ['./ngx-simple-wig.component.css'],
  providers: [
    NgxWigMardownToolbarService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxSimpleWigComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None
})
export class NgxSimpleWigComponent implements AfterViewInit,
                      OnInit,
                      OnChanges,
                      OnDestroy,
                      ControlValueAccessor {

  editMode : 'WIG' | 'MARK' | 'HTML' = 'WIG';

  disabled: false;

  @Input()
  public content: string;

  // toolbar buttons
  @Input()
  public buttons: string;

  @Output()
  public contentChange = new EventEmitter();

  @ViewChild('ngWigEditable', { read: ElementRef, static: true })
  public ngxWigEditable: ElementRef;

  container: HTMLElement;

  public toolbarButtons: TButton[] = [];

  private _mutationObserver: MutationObserver;

  public hasFocus = false;

  public htmlContent: string;
  public markdownContent: string;

  private converter: Showdown.Converter;

  constructor(private _ngWigToolbarService: NgxWigMardownToolbarService,
              @Inject(DOCUMENT) private document: any, // cannot set Document here - Angular issue - https://github.com/angular/angular/issues/20351
              @Inject('WINDOW') private window) {

    this.converter = new Showdown.Converter();
  }

  ngOnInit() {
    this.toolbarButtons = this._ngWigToolbarService.getToolbarButtons(this.buttons);
    this.container = this.ngxWigEditable.nativeElement;

    if (this.content) {
      this.container.innerHTML = this.content;
      this.htmlContent = this.content;
    }

  }

  public ngAfterViewInit(): void {
    // Workaround for IE11 which doesn't fire 'input' event on
    // contenteditable
    // https://stackoverflow.com/a/49287032/7369511

    // check if the browser is IE:
    if (window.document['documentMode']) {
      this._mutationObserver = new MutationObserver(() => {
        this.onContentChange(this.container.innerHTML);
      });

      this._mutationObserver.observe(
        this.container,
        { childList: true, subtree: true, characterData: true }
      );
    }
  }

  public ngOnDestroy(): void {
    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.container && changes['content']) {
      // clear the previous content
      this.container.innerHTML = '';

      // add the new content
      this.pasteHtmlAtCaret(changes['content'].currentValue);
    }
  }

  public writeValue(value: any): void {
    if (!value) { value = ''; }

    this.container.innerHTML = value;
    this.content = value;
  }

  public registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.propagateTouched = fn;
  }

  private propagateChange: any = (_: any) => { };
  public propagateTouched = () => {};

  public onTextareaChangeHtml(newContent: string): void {
    // model -> view
    if (this.editMode === "HTML") {
      this.container.innerHTML = newContent;
      this.onContentChange(newContent);
    }
  }

  public onTextareaChangeMarkdown(newContent: string) {
    if (this.editMode === "MARK") {

    }
  }

  private pasteHtmlAtCaret(html) {
    let sel, range;

    if (window.getSelection) {
      sel = window.getSelection();

      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();

        // append the content in a temporary div
        const el = this.document.createElement('div');
        el.innerHTML = html;

        const frag = this.document.createDocumentFragment();
        let node, lastNode;

        while ( (node = el.firstChild) ) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);

        // Preserve the selection
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  }

  public onContentChange(newContent: string): void {
    this.content = newContent;
    this.htmlContent = this.content;
    if (this.editMode !== "MARK") {
      this.markdownContent = this.converter.makeMarkdown(this.content);
    }

    this.contentChange.emit(this.content);
    this.propagateChange(this.content);
  }

  onBlur() {
    this.hasFocus = false;
    this.propagateTouched();
  }

  changeToolbarDropdown(items: Array<{command?: string| commandFunction, label?:string}>, value: string) {
    const selected = items.filter(i => i.label === value);

    if (selected && selected.length) {
      this.toolbarItemClick(selected[0]);
    }
  }

  toolbarItemClick(item) {
    const command = item.command;

    if (!command) return false;

    // if command is a function, execute it
    if(typeof command === 'function') {
      command(this);
      return true;
    }

    let isCustomCommand = false;
    if (CUSTOM_COMMANDS.indexOf(command) >= 0) {
      isCustomCommand = true;
    }

    if (this.document.queryCommandSupported && !this.document.queryCommandSupported(command) && !isCustomCommand) {
      throw new Error(`The command "${command}" is not supported`);
    }

    let options = null;
    if (command === 'createlink' || command === 'insertImage') {
      options = window.prompt('Please enter the URL', 'http://') || '';
      if (!options) {
        return false;
      }
    }

    this.container.focus();

    // use insertHtml for `createlink` command to account for IE/Edge purposes, in case there is no selection
    const selection = this.document.getSelection().toString();

    
    let value = selection;
    if (isCustomCommand) {
      switch(command) {
        case 'h1':
          value = `<h1>${selection}</h1>`;
          break;
        case 'h2':
          value = `<h2>${selection}</h2>`;
          break;
        case 'h3':
          value = `<h3>${selection}</h3>`;
          break;
        case 'h4':
          value = `<h4>${selection}</h4>`;
          break;
      }
    }

    if (command === 'createlink' && selection === '') {
      window.document.execCommand('insertHtml', false, '<a href="' + options + '">' + options + '</a>');
    } else {
      if (!isCustomCommand) {
        this.document.execCommand(command, false);
      } else {
        this.document.execCommand('insertHTML', false, value);
      }
    }

    this.onContentChange(this.container.innerHTML);
    return true;
  }
}
