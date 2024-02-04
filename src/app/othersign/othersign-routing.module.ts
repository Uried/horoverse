import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OthersignPage } from './othersign.page';

const routes: Routes = [
  {
    path: '',
    component: OthersignPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OthersignPageRoutingModule {}
