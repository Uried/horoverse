import { Component, OnInit } from '@angular/core';
import { PublicationService } from '../sevices/publication/publication.service';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-comment',
  templateUrl: './comment.page.html',
  styleUrls: ['./comment.page.scss'],
})
export class CommentPage implements OnInit {
  idPub: string = localStorage.getItem('idPub') || '';
  datePub: string = localStorage.getItem('datePub') || '';
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
  browserLanguage!: string;

  constructor(
    private publicationService: PublicationService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.translateService.setDefaultLang('fr');

    const browserLang = navigator.language;

    this.browserLanguage = browserLang!;
    if (this.browserLanguage == 'fr-FR') {
    }
    this.getPublicationComments();
  }

  showResponseZone() {
    this.responseZoneShow = true;
  }

  hideResponseZone() {
    this.responseZoneShow = false;
  }

  showAlertModal() {
    this.showModal = true;
    setTimeout(() => {
      this.showModal = false;
    }, 2000); // Temps en millisecondes avant de masquer la fenêtre modale
  }

  getPublicationComments() {
    this.publicationService
      .getPublicationById(this.idPub)
      .subscribe((publication: any) => {
        this.publicationContent = publication[this.sign];
      });

    this.publicationService
      .getComments(this.idPub)
      .subscribe((comments: any) => {
        this.comments = comments;

        comments.forEach((element: any) => {
          console.log(element.responses);
        });
      });
  }

  addcomment() {
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
            this.commentContent = ""
          });
      } catch (error) {
        console.log(error);
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

  addResponse(commentId: string) {
    let response = {
      name: this.pseudo,
      content: this.responseContent,
    };
    if (!this.responseContent) {
      this.showAlertModal;
    } else {
      this.publicationService
        .addResponse(this.idPub, commentId, response)
        .subscribe(() => {
          this.getPublicationComments();
          this.responseContent = ""
        });
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

  removeIdPub(){
    localStorage.removeItem('idPub')
    localStorage.removeItem("datePub")
  }
}
