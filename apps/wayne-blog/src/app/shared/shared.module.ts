import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { RouterModule } from '@angular/router';

import { SpectreTaginputComponent } from './taginput/taginput.component';
import { HeaderComponent } from './header/header.component';
import { CustomDirectiveModule } from '../directives/directive.module';
import { CustomDropdownComponent } from './custom-dropdown/custom-dropdown.component';
import { SpectreCalendarComponent } from './calendar/calendar.component';
import { SpectreDatepickerComponent } from './datepicker/datepicker.component';
import { SpectreDateTimePickerComponent } from './datetimepicker/datetimepicker.component';
import { SpectreTimeComponent } from './time/time.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverComponent } from './popover/popover.component';
import { DateTimePickerDirective } from './datetimepicker/datetimepicker.directive';
import { SpectreDatetimeInputComponent } from './datetimeinput/datetimeinput.component';
import { MomentDatePipe } from '../pipes/moment-date.pipe';
import { SpectreDropdownListComponent } from './dropdown-list/dropdown-list.component';
import { SpectreDropdownSelectComponent } from './dropdown-select/dropdown-select.component';

@NgModule({
  declarations: [
    SpectreTaginputComponent,
    HeaderComponent,
    CustomDropdownComponent,
    SpectreCalendarComponent,
    SpectreDatepickerComponent,
    SpectreTimeComponent,
    SpectreDateTimePickerComponent,
    PopoverComponent,
    DateTimePickerDirective,
    SpectreDatetimeInputComponent,
    MomentDatePipe,
    SpectreDropdownListComponent,
    SpectreDropdownSelectComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomDirectiveModule,
    RouterModule,
    OverlayModule,
    PortalModule
  ],
  exports: [
    SpectreTaginputComponent,
    HeaderComponent,
    CustomDirectiveModule,
    CustomDropdownComponent,
    SpectreCalendarComponent,
    SpectreDatepickerComponent,
    SpectreTimeComponent,
    SpectreDateTimePickerComponent,
    PopoverComponent,
    DateTimePickerDirective,
    SpectreDatetimeInputComponent,
    MomentDatePipe,
    SpectreDropdownListComponent,
    SpectreDropdownSelectComponent
  ]
})
export class SharedModule {}
