import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ViewblogPage } from '../viewblog/viewblog.page';
import {  NavigationEnd, Router} from '@angular/router';
import { BlogService } from '../blog.service';
import { filter } from 'rxjs';


@Component({
  selector: 'app-news',
  templateUrl: './blogs.page.html',
  styleUrls: ['./blogs.page.scss'],
})
export class BlogsPage implements OnInit {
  browserLanguage!: string;
  idBlog!: string;
  home: string = 'Home';
  news: string = 'News';
  opinion: string = 'Opinions';
  blogs: any[] = [];
  blogDate!: string;
  ipAddress!: string;

  constructor(
    private translateService: TranslateService,
    private http: HttpClient,
    private router: Router,
    private blogServive: BlogService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        localStorage.removeItem('idBlog');
      });
  }

  async ngOnInit() {
    console.log(localStorage);

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
    if (this.browserLanguage == 'fr-FR') {
      this.translateToFrench();
      //this.translateHoroscope(); // Appeler translateHoroscope() ici
    }
    this.getBlogs();
  }

  translateToFrench() {
    this.home = 'Acceuil';
    this.news = 'Infos';
    this.opinion = 'Avis';
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
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
        return "Aujourd'hui";
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
        return 'Hier';
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
        'Dimanche',
        'Lundi',
        'Mardi',
        'Mercredi',
        'Jeudi',
        'Vendredi',
        'Samedi',
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

  getBlogs() {
    try {
      this.http
        .get(`https://apihoroverse.vercel.app/blogs/`)
        .subscribe((blogs: any) => {
          this.blogs = blogs.data;

          const log = {
            level: 'debug',
            message: "Affiche la liste des blogs",
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
    } catch (error) {
      const log = {
        level: 'error',
        message: 'Erreur de recuperation de la liste des blogs'+ error,
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
