import { InjectionToken } from '@angular/core';

export type commandFunction = (ctx: {editMode: boolean | ('WIG' | 'MARK' | 'HTML') }) => void;

export type TButton = {
  label?: string;
  icon?: string;
  title?: string;
  command?: string | commandFunction;
  styleClass?: string;
  type?: string;
  dropdownItems?: Array<{command?: string|commandFunction, label?:string}>
};

export type TButtonLibrary = {
  [name: string]: TButton;
};

export const CUSTOM_COMMANDS = ['h1', 'h2', 'h3', 'h4'];

export const DEFAULT_LIBRARY_BUTTONS: TButtonLibrary = {
  list1: {
    label: 'UL',
    title: 'Unordered List',
    command: 'insertunorderedlist',
    styleClass: 'list-ul',
    icon: 'icon-list-ul'
  },
  list2: {
    label: 'OL',
    title: 'Ordered List',
    command: 'insertorderedlist',
    styleClass: 'list-ol',
    icon: 'icon-list-ol'
  },
  bold: {
    label: 'B',
    title: 'Bold',
    command: 'bold',
    styleClass: 'bold',
    icon: 'icon-bold'
  },
  italic: {
    label: 'I',
    title: 'Italic',
    command: 'italic',
    styleClass: 'italic',
    icon: 'icon-italic'
  },
  link: {
    label: 'Link',
    title: 'Link',
    command: 'createlink',
    styleClass: 'link',
    icon: 'icon-link'
  },
  underline: {
    label: 'U',
    title: 'Underline',
    command: 'underline',
    styleClass: 'format-underlined',
    icon: 'icon-underline'
  },
  headings: {
    type: 'dropdown',
    label: 'Headings',
    dropdownItems: [
      {label : 'H1', command: 'h1'},
      {label : 'H2', command: 'h2'},
      {label : 'H3', command: 'h3'},
      {label : 'H4', command: 'h4'}
    ]
  },
  viewhtml1: {
    label: 'HTML',
    title: 'View HTML',
    command: (ctx: {editMode: boolean}) => {
      ctx.editMode = !ctx.editMode;
    },
    styleClass: 'format-underlined',
    icon: 'icon-underline'
  },
  viewhtml: {
    label: 'HTML',
    title: 'View HTML',
    command: (ctx: {editMode: 'WIG' | 'MARK' | 'HTML'}) => {
      if (ctx.editMode === "HTML")
        ctx.editMode = "WIG";
      else 
        ctx.editMode = "HTML";
    },
    styleClass: 'format-underlined',
    icon: 'icon-underline'
  },
  viewmarkdown: {
    label: 'M',
    title: 'View Markdown',
    command: (ctx: {editMode: 'WIG' | 'MARK' | 'HTML'}) => {
      if (ctx.editMode === "MARK")
        ctx.editMode = "WIG";
      else 
        ctx.editMode = "MARK";
    },
    styleClass: 'format-underlined',
    icon: 'icon-underline'
  }
};

export const CUSTOM_LIBRARY_BUTTONS: TButtonLibrary = {
  edittext: {
    label: 'Edit Text',
    title: 'Edit Text',
    command: (ctx: {editMode: boolean}) => {
      ctx.editMode = !ctx.editMode;
    },
    styleClass: 'nw-button--source',
    icon: '',
  }
};


export const BUTTONS = new InjectionToken<TButton[][]>('BUTTONS');
