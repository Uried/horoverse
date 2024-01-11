import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArchivesPageRoutingModule } from './archives-routing.module';

import { ArchivesPage } from './archives.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ArchivesPageRoutingModule
  ],
  declarations: [ArchivesPage]
})
export class ArchivesPageModule {}
