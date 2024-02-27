import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { HoroscopesPageRoutingModule } from './horoscopes-routing.module';

import { HoroscopesPage } from './horoscopes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HoroscopesPageRoutingModule,
    TranslateModule.forChild(),
  ],
  declarations: [HoroscopesPage],
})
export class HoroscopesPageModule {}
