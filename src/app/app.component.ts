import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { Observable, forkJoin } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  horoscope: any;
  private apiUrl = 'https://any.ge/horoscope/api/';
  constructor(
    private translateService: TranslateService,
    private afMessaging: AngularFireMessaging,
    private http: HttpClient
  ) {
    this.translateService.setDefaultLang('fr');
  }

  async ngOnInit() {
   
    //await this.getHoroscopes();
    const browserLang = navigator.language;
    this.translateService.use(browserLang.match(/fr|en/) ? browserLang : 'fr');
    navigator.serviceWorker
      .register('src/firebase-messaging-sw.js')
      .then((registration) => {
        console.log(
          'Firebase Messaging Service Worker registered: ',
          registration
        );
      })
      .catch((err) => {
        console.error(
          'Error registering Firebase Messaging Service Worker: ',
          err
        );
      });

    this.requestPermission();
  }

  requestPermission() {
    const messaging = getMessaging();
    getToken(messaging, { vapidKey: environment.firebase.vapidKey })
      .then((currentToken) => {
        if (currentToken) {
          console.log('Hurraaa!!! we got the token.....');
          console.log(currentToken);
        } else {
          console.log(
            'No registration token available. Request permission to generate one.'
          );
        }
      })
      .catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
      });

    this.afMessaging.requestToken.subscribe(
      (token: any) => {
        // Stockez le nouveau token FCM localement

        this.updateFcmToken(token).subscribe(
          () => {
            console.log('Token FCM mis à jour dans la base de données.');
          },
          (error: any) => {
            console.error('Erreur lors de la mise à jour du token FCM:', error);
          }
        );
      },
      (error) => {
        console.error(
          "Impossible de demander l'autorisation de notification:",
          error
        );
      }
    );
  }

  updateFcmToken(token: string): Observable<any> {
    // Effectuez une requête HTTP vers votre backend pour mettre à jour le token FCM dans la base de données
    const jId = localStorage.getItem('jId');
    const url = `https://apihoroverse.vercel.app/update-fcm-token/${jId}`;
    const body = { token };

    return this.http.put(url, body);
  }

  getHoroscope(sign: string) {
    const headers = {
      'X-RapidAPI-Key': 'c79e7cce1dmsh6fd8ba52278c9d4p1d6288jsn7bbcd57be239',
      'X-RapidAPI-Host': 'horoscopes-ai.p.rapidapi.com',
    };

    //getDailyHoroscope(language: string): Observable<Daily> {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10); // YYYY-MM-DD format
    console.log(formattedDate);

    //   const url = `http://localhost:3000/dailies/${formattedDate}/${language}`; // Replace with your server URL

    //   return this.http.get<Daily>(url);
    // }

    this.http
      .get<any>(
        `https://horoscopes-ai.p.rapidapi.com/get_horoscope/${sign}/today/general/fr`,
        { headers }
      )
      .subscribe(
        (data) => {
          this.horoscope = data;
          console.log(data);
        },
        (error) => {
          console.error(error);
        }
      );
  }


}
