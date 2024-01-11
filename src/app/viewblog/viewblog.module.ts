import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

import { ViewblogPageRoutingModule } from './viewblog-routing.module';

import { ViewblogPage } from './viewblog.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    ViewblogPageRoutingModule,
  ],
  declarations: [ViewblogPage],
  exports:[ViewblogPage]
})
export class ViewblogPageModule {}
