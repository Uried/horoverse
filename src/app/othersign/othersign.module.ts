import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OthersignPageRoutingModule } from './othersign-routing.module';
import { TranslateModule } from '@ngx-translate/core';

import { OthersignPage } from './othersign.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OthersignPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [OthersignPage]
})
export class OthersignPageModule {}
