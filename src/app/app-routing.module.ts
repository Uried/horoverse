import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'astrosign',
    loadChildren: () => import('./astrosign/astrosign.module').then( m => m.AstrosignPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'horoscopes',
    loadChildren: () => import('./horoscopes/horoscopes.module').then( m => m.HoroscopesPageModule)
  },
  {
    path: 'blogs',
    loadChildren: () => import('./blogs/blogs.module').then( m => m.BlogsPageModule)
  },
  {
    path: 'viewblog/:id',
    loadChildren: () => import('./viewblog/viewblog.module').then( m => m.ViewblogPageModule)
  },
  {
    path: 'comment/:id/:date',
    loadChildren: () => import('./comment/comment.module').then( m => m.CommentPageModule)
  },
  {
    path: 'archives',
    loadChildren: () => import('./archives/archives.module').then( m => m.ArchivesPageModule)
  },
  {
    path: 'othersign/:sign',
    loadChildren: () => import('./othersign/othersign.module').then( m => m.OthersignPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy}
  ]
})
export class AppRoutingModule { }
