import { Component, OnInit } from '@angular/core';
import { PublicationService } from '../sevices/publication/publication.service';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, catchError, filter, from, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import axios from 'axios';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-archives',
  templateUrl: './archives.page.html',
  styleUrls: ['./archives.page.scss'],
})
export class ArchivesPage implements OnInit {
  translatedText$!: Observable<string>;
  ipAddress!: string;
  publications: any[] = [];
  sign: string = localStorage.getItem('sign') || '';
  pseudo: string = localStorage.getItem('pseudo') || '';
  browserLanguage!: string;
  commentContent!: string;
  showModal = false;
  doneIcon = false;
  home: string = 'Home';
  news: string = 'News';
  opinion: string = 'Opinions';
  constructor(
    private publicationService: PublicationService,
    private router: Router,
    private translateService: TranslateService,
    private http: HttpClient,
    private loadingCtrl: LoadingController
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // this.getAllPublications();
      });
  }

  async ngOnInit() {
    try {
      await this.getIPAddress();
      console.log('Adresse IP:', this.ipAddress);
      // Utilisez this.ipAddress comme nécessaire dans votre application
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse IP:", error);
    }
    this.translateService.setDefaultLang('fr');
    const browserLang = navigator.language;

    this.browserLanguage = browserLang!;

    this.getAllPublications();
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
    });

    loading.present();
    return () => loading.dismiss();
  }

  async getAllPublications() {
    const dismissLoading = await this.showLoading();

    try {
      this.publicationService
        .getAllPublications()
        .subscribe(async (publications: any) => {
          this.publications = publications;
          if (this.browserLanguage == 'fr-FR') {
            for (const publication of this.publications) {
              if (publication[this.sign]) {
                try {
                  const texteTraduit = await this.translateHoroscope(
                    publication[this.sign]
                  );
                  publication[this.sign] = texteTraduit;
                } catch (error) {
                  console.error(
                    `Erreur lors de la traduction pour la publication : ${JSON.stringify(
                      publication
                    )}`,
                    error
                  );
                }
              }
            }
          } else {
          }
        });

      const log = {
        level: 'debug',
        message: 'Afficher lhistorique des horoscopes',
        userId: localStorage.getItem('jId'),
        ipAddress: this.ipAddress,
      };

      this.http.post('https://apihoroverse.vercel.app/logs', log).subscribe(
        (response) => {
          console.log('Réponse:', response);
        },
        (error) => {
          console.error('Erreur lors de la requête POST logs:', error);
        }
      );
      dismissLoading()
    } catch (error) {
      console.log(error);
      dismissLoading()

      const log = {
        level: 'error',
        message:
          'Erreur lors de la recuperation de lhistorique des lhoroscopes' +
          error,
        userId: localStorage.getItem('jId'),
        ipAddress: this.ipAddress,
      };

      this.http.post('https://apihoroverse.vercel.app/logs', log).subscribe(
        (response) => {
          console.log('Réponse:', response);
        },
        (error) => {
          console.error('Erreur lors de la requête POST logs:', error);
        }
      );
    }
  }

  async translateHoroscope(horoscope: string) {
    const url = `https://api.mymemory.translated.net/get`;
    const horoscopePhrases = this.segmentText(horoscope, '.');

    const translationPromises = horoscopePhrases.map(async (phrase: string) => {
      try {
        const response = await axios.get(url, {
          params: {
            q: phrase.trim(),
            langpair: `en|fr`,
          },
        });

        const translatedPhrase = response.data.responseData.translatedText;
        return translatedPhrase || ''; // Retourne une chaîne vide si la traduction est vide ou non définie
      } catch (error) {
        console.error(error);
        return ''; // Retourne une chaîne vide en cas d'erreur de traduction
      }
    });

    const translatedPhrases = await Promise.all(translationPromises);
    const translatedHoroscope = translatedPhrases.join('. ');

    // Filtrer la partie indésirable
    const filteredHoroscope = translatedHoroscope.replace(
      'NO QUERY SPECIFIED. EXAMPLE REQUEST: GET?Q=HELLO&LANGPAIR=EN|IT',
      ''
    );

    return filteredHoroscope;
  }

  segmentText(text: string, delimiter: any) {
    const segments = text.split(delimiter);
    return segments.map((segment: any) => segment.trim());
  }

  showAlertModal() {
    this.showModal = true;
    setTimeout(() => {
      this.hideInformationModal();
    }, 2000);
    const log = {
      level: 'error',
      message: 'Erreur entree dun commentaire vide',
      userId: localStorage.getItem('jId'),
      ipAddress: this.ipAddress,
    };

    this.http.post('https://apihoroverse.vercel.app/logs', log).subscribe(
      (response) => {
        console.log('Réponse:', response);
      },
      (error) => {
        console.error('Erreur lors de la requête POST logs:', error);
      }
    );
  }

  showDoneIcon() {
    this.doneIcon = true;
    setTimeout(() => {
      this.hideDoneIcon();
    }, 2000);
  }

  hideInformationModal() {
    this.showModal = false;
  }

  hideDoneIcon() {
    this.doneIcon = false;
  }

  showComments(idPub: string, date: string) {
    localStorage.setItem('idPub', idPub);
    localStorage.setItem('datePub', date);
    this.router.navigateByUrl('/comment');
  }

  async addComment(idPub: string) {
    const dismissLoading = await this.showLoading();
    if (!this.commentContent) {
      this.showAlertModal();
    } else {
      let comment = {
        name: this.pseudo,
        content: this.commentContent,
      };
      this.publicationService.addComment(idPub, comment).subscribe(() => {
        this.showDoneIcon();
        this.commentContent = '';
      });
      dismissLoading()
    }
  }

  formatDate(date: string): string {
    const currentDate = new Date();
    const inputDate = new Date(date);

    // Vérifier si la date est aujourd'hui
    if (
      inputDate.getDate() === currentDate.getDate() &&
      inputDate.getMonth() === currentDate.getMonth() &&
      inputDate.getFullYear() === currentDate.getFullYear()
    ) {
      if (this.browserLanguage == 'fr-FR') {
        return "d'aujourd'hui";
      } else {
        return 'Today';
      }
    }

    // Vérifier si la date est hier
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    if (
      inputDate.getDate() === yesterday.getDate() &&
      inputDate.getMonth() === yesterday.getMonth() &&
      inputDate.getFullYear() === yesterday.getFullYear()
    ) {
      if (this.browserLanguage == 'fr-FR') {
        return "d'hier";
      } else {
        return 'Yesterday';
      }
    }

    // Vérifier si la date est dans la semaine en cours
    const oneDay = 24 * 60 * 60 * 1000; // Nombre de millisecondes dans une journée
    const diffDays = Math.round(
      Math.abs((currentDate.getTime() - inputDate.getTime()) / oneDay)
    );

    if (diffDays <= 6) {
      const joursDeLaSemaine = [
        'de Dimanche',
        'de Lundi',
        'de Mardi',
        'de Mercredi',
        'de Jeudi',
        'de Vendredi',
        'de Samedi',
      ];
      const daysOfWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Satuday',
      ];
      if (this.browserLanguage == 'fr-FR') {
        return joursDeLaSemaine[inputDate.getDay()];
      } else {
        return daysOfWeek[inputDate.getDay()];
      }
    }

    // Retourner la date au format jj-mm-aaaa
    const day = inputDate.getDate();
    const month = inputDate.getMonth() + 1;
    const year = inputDate.getFullYear();

    return `${day}-${month}-${year}`;
  }

  getIPAddress(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http
        .get<{ ip: string }>('https://api.ipify.org?format=json')
        .subscribe(
          (response) => {
            this.ipAddress = response.ip;
            resolve();
          },
          (error) => {
            reject(error);
          }
        );
    });
  }
}
