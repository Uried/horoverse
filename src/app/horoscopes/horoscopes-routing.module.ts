import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HoroscopesPage } from './horoscopes.page';

const routes: Routes = [
  {
    path: '',
    component: HoroscopesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HoroscopesPageRoutingModule {}
