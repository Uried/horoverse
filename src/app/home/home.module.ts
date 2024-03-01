import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { HomePageRoutingModule } from './home-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    ExploreContainerComponentModule,
     TranslateModule.forChild(),
    HomePageRoutingModule,
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
