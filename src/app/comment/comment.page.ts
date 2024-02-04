import { Component, OnInit } from '@angular/core';
import { PublicationService } from '../sevices/publication/publication.service';
import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import axios from 'axios';
import { HttpClient } from '@angular/common/http';

import { LoadingController } from '@ionic/angular';

export interface Comment {
  _id: string;
  // ... (autres propriétés)
  isResponseActive: boolean;
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.page.html',
  styleUrls: ['./comment.page.scss'],
})
export class CommentPage implements OnInit {
  idPub!: string;
  datePub!: string;
  pseudo: string = localStorage.getItem('pseudo') || '';
  publication!: any;
  publicationContent!: string;
  sign: string = localStorage.getItem('sign') || '';
  commentContent!: string;
  responseContent!: string;
  commentZoneShow: boolean = false;
  responseZoneShow: boolean = false;
  showModal: boolean = false;
  comments: any[] = [];
  ipAddress!: string;
  selectedCommentId: string | null = null;
  language: string = 'en';
  constructor(
    private publicationService: PublicationService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private http: HttpClient
  ) {
    translate.setDefaultLang('en');
    const browserLang = translate.getBrowserLang();

    translate.use(browserLang!.match(/en|fr/) ? browserLang! : 'en');
     if (browserLang == 'fr') {
       this.language = 'fr';
     }

       this.router.events
         .pipe(filter((event) => event instanceof NavigationEnd))
         .subscribe(() => {
           this.translateHoroscope()
         });
  }

  async ngOnInit() {
    try {
      await this.translateHoroscope()
      await this.getIPAddress();
      console.log('Adresse IP:', this.ipAddress);
      // Utilisez this.ipAddress comme nécessaire dans votre application
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse IP:", error);
    }

    if (this.language == 'fr') {
      this.translateHoroscope()
    }

    this.getPublicationComments();
  }

  showResponseZone(commentId: string): void {
    this.responseZoneShow = true;
    this.selectedCommentId = commentId;
  }

  hideResponseZone(): void {
    this.responseZoneShow = false;
    this.selectedCommentId = null;
  }
  showAlertModal() {
    this.showModal = true;
    setTimeout(() => {
      this.showModal = false;
    }, 2000);
  }
  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
    });

    loading.present();
    return () => loading.dismiss();
  }

  async getPublicationComments() {
    const dismissLoading = await this.showLoading();
    const idPub = this.route.snapshot.paramMap.get('id')!;
    const datePub = this.route.snapshot.paramMap.get('date');
    this.datePub = datePub!;
    this.idPub = idPub;
    try {
      this.publicationService
        .getPublicationById(this.idPub)
        .subscribe((publication: any) => {
          this.publicationContent = publication[this.sign].split('|');
        });

      this.publicationService.getComments(idPub).subscribe((comments: any) => {
        this.comments = comments;
        comments.forEach((element: any) => {
          console.log(element.responses);
        });
        const log = {
          level: 'debug',
          message: 'Affiche les avis sur lhoroscope',
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
      });
      dismissLoading();
    } catch (error) {
      dismissLoading();
      console.error(error);
      const log = {
        level: 'error',
        message: 'Erreur lors de la recuperation de lhoroscope' + error,
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

  async translateHoroscope() {

    const url = `https://api.mymemory.translated.net/get`;

    const horoscopePhrases = this.segmentText(this.publicationContent, '.'); // Segmenter par phrases

    const translatedPhrases = [];

    try {
      for (const phrase of horoscopePhrases) {
        const response = await axios.get(url, {
          params: {
            q: phrase.trim(), // Supprimer les espaces en début et fin de phrase
            langpair: `en|fr`,
          },
        });

        const translatedPhrase = response.data.responseData.translatedText;

        // Vérifier si la traduction est valide avant de l'ajouter
        if (
          translatedPhrase &&
          translatedPhrase !==
            'NO QUERY SPECIFIED. EXAMPLE REQUEST: GET?Q=HELLO&LANGPAIR=EN|IT'
        ) {
          translatedPhrases.push(translatedPhrase);
        }
      }

      let translatedHoroscope = translatedPhrases.join('. '); // Concaténer les phrases traduites avec un point
      translatedHoroscope += '.'; // Ajouter un point à la fin du texte traduit
      this.publicationContent = translatedHoroscope;
      console.log(this.publicationContent); // Afficher le résultat en console

      const log = {
        level: 'debug',
        message: 'Horoscope traduit',
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
    } catch (error) {
      const log = {
        level: 'error',
        message: 'Erreur lors de la traduction du texte' + error,
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

      console.error(error);
    }
  }

  segmentText(text: any, delimiter: any) {
    const segments = text.split(delimiter);
    return segments.map((segment: string) => segment.trim()); // Supprimer les espaces en début et fin de segment
  }

  async addcomment() {
    const dismissLoading = await this.showLoading();
    if (this.commentContent == '') {
      this.showAlertModal;
    } else {
      try {
        let comment = {
          name: this.pseudo,
          content: this.commentContent,
        };
        this.publicationService
          .addComment(this.idPub, comment)
          .subscribe(() => {
            console.log('comment added');
            this.getPublicationComments();
            this.commentContent = '';
          });
        dismissLoading();
      } catch (error) {
        dismissLoading();
        console.log(error);
        const log = {
          level: 'error',
          message: 'Erreur lors de lajout du commentaire' + error,
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
  }

  delelteComment(commentId: string) {
    this.publicationService
      .deleteComment(this.idPub, commentId)
      .subscribe(() => {
        this.getPublicationComments();
      });
  }

  async addResponse() {
    const dismissLoading = await this.showLoading();
    if (this.selectedCommentId) {
      let response = {
        name: this.pseudo,
        content: this.responseContent,
      };
      try {
        if (!this.responseContent) {
          this.showAlertModal();
        } else {
          this.publicationService
            .addResponse(this.idPub, this.selectedCommentId, response)
            .subscribe(() => {
              this.getPublicationComments();
              this.responseContent = '';
              this.hideResponseZone(); // Fermer la zone de réponse après l'ajout
            });
        }
        dismissLoading();
      } catch (error) {
        dismissLoading();
        // Gérer les erreurs
      }
    }
  }

  deleResponse(commentId: string, responseId: string) {
    this.publicationService
      .deleteResponse(this.idPub, commentId, responseId)
      .subscribe();
    this.getPublicationComments();
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
      if (this.language == 'fr') {
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
        if (this.language == 'fr') {
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
       if (this.language == 'fr') {
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

  backToAvis() {
    localStorage.removeItem('idPub');
    localStorage.removeItem('datePub');
    this.router.navigateByUrl('/archives');
  }
}
