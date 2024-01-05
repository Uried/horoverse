import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HoroscopesPageRoutingModule } from './horoscopes-routing.module';

import { HoroscopesPage } from './horoscopes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HoroscopesPageRoutingModule
  ],
  declarations: [HoroscopesPage]
})
export class HoroscopesPageModule {}
