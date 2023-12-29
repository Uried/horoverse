import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { SwUpdate } from '@angular/service-worker';
import { checkServiceWorkerConflicts } from 'src/service-worker-utils';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'af-notification';
  message: any = null;
  constructor(private swUpdate: SwUpdate) {
     checkServiceWorkerConflicts();
  }
  ngOnInit(): void {

    this.requestPermission();
    this.listen();
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
  }
  listen() {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      this.message = payload;
    });
  }
}
