import { NgModule, isDevMode, LOCALE_ID } from '@angular/core';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HoroscopeService } from './sevices/horoscope/horoscope-api.service';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { ServiceWorkerModule } from '@angular/service-worker';
import 'firebase/messaging';
import 'firebase/compat/firestore';
import { ViewblogPageModule } from './viewblog/viewblog.module';
import { BlogsPageModule } from './blogs/blogs.module';

initializeApp(environment.firebase)

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BlogsPageModule,
    ViewblogPageModule,
    AngularFireModule.initializeApp(environment.firebase),
    ServiceWorkerModule.register('../combined-sw.js', {
      enabled: environment.production,
    }),
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    AngularFireMessagingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: navigator.language },
    HoroscopeService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
