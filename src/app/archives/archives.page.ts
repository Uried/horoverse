import { Component, OnInit } from '@angular/core';
import { PublicationService } from '../sevices/publication/publication.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import axios from 'axios';
@Component({
  selector: 'app-archives',
  templateUrl: './archives.page.html',
  styleUrls: ['./archives.page.scss'],
})
export class ArchivesPage implements OnInit {
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
    private translateService: TranslateService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.getAllPublications();
      });
  }

  ngOnInit() {
    this.translateService.setDefaultLang('fr');
    const browserLang = navigator.language;

    this.browserLanguage = browserLang!;
    if (this.browserLanguage == 'fr-FR') {
    }
    this.getAllPublications();
  }

  getAllPublications() {
    try {
      this.publicationService
        .getAllPublications()
        .subscribe((publications: any) => {
          this.publications = publications;
        });
    } catch (error) {
      console.log(error);
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

        if (translatedPhrase) {
          return translatedPhrase;
        }
      } catch (error) {
        console.error(error);
      }
    });

    const translatedPhrases = await Promise.all(translationPromises);

    let translatedHoroscope = translatedPhrases.join('. ');

    return translatedHoroscope;
  }

  segmentText(text: any, delimiter: any) {
    const segments = text.split(delimiter);
    return segments.map((segment: string) => segment.trim()); // Supprimer les espaces en début et fin de segment
  }

  showAlertModal() {
    this.showModal = true;
    setTimeout(() => {
      this.hideInformationModal();
    }, 2000);
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

  addComment(idPub: string) {
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
}
