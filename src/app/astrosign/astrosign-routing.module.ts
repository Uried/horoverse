import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AstrosignPage } from './astrosign.page';

const routes: Routes = [
  {
    path: '',
    component: AstrosignPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AstrosignPageRoutingModule {}
