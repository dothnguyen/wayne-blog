import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TButtonLibrary, BUTTONS, DEFAULT_LIBRARY_BUTTONS, CUSTOM_LIBRARY_BUTTONS } from './config';
import { NgxWigMarkdownComponent } from './ngx-wig-markdown.component';
import { FormsModule } from '@angular/forms';
import { NgxSimpleWigComponent } from './ngx-simple-wig/ngx-simple-wig.component';

export function getWindowObject(): Window {
  return window;
}

@NgModule({
  declarations: [NgxWigMarkdownComponent, NgxSimpleWigComponent],
  imports: [CommonModule, FormsModule],
  exports: [NgxWigMarkdownComponent, NgxSimpleWigComponent]
})
export class NgxWigMarkdownModule {

  static forRoot(config?: { buttonsConfig: TButtonLibrary } ): ModuleWithProviders<NgxWigMarkdownModule> {
    return {
      ngModule: NgxWigMarkdownModule,
      providers: [
        provideButtons(config),
        { provide: 'WINDOW', useFactory: getWindowObject },
      ],
    };
  }

  static forChild(): ModuleWithProviders<NgxWigMarkdownModule> {
    return {ngModule: NgxWigMarkdownModule };
  }

}


export function provideButtons(config?: { buttonsConfig: TButtonLibrary }): any {
  if(!config || !config.buttonsConfig) {
    return [
      {provide: BUTTONS, multi: true, useValue: DEFAULT_LIBRARY_BUTTONS},
    ];
  }

  return [
    {provide: BUTTONS, multi: true, useValue: config.buttonsConfig},
  ];
}
