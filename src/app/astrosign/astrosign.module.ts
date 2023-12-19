import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AstrosignPageRoutingModule } from './astrosign-routing.module';

import { AstrosignPage } from './astrosign.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AstrosignPageRoutingModule
  ],
  declarations: [AstrosignPage]
})
export class AstrosignPageModule {}
