import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getMessaging, getToken } from 'firebase/messaging';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    this.requestPermission();
  }
  title = 'Horoverse';
  locale!: string;

  requestPermission() {
    const messaging = getMessaging();
    getToken(messaging, { vapidKey: environment.firebase.vpaidKey }).then(
      (currentToken) => {
        if (currentToken) {
          console.log('yeah we have the token');
          console.log(currentToken);
        } else {
          console.log('we have a problem');
        }
      }
    );
  }

  constructor(private translate: TranslateService) {
    this.initializeApp();

  }

  initializeApp() {
    const userLang = navigator.language.split('-')[0];
    this.translate.setDefaultLang('fr');
    this.translate.use(userLang);
  }
}
