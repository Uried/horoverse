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

  constructor(
    private translateService: TranslateService,
    private http: HttpClient,
    private router: Router,
    private blogServive: BlogService // public viewblog: ViewblogPage
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        localStorage.removeItem('idBlog');
      });
  }

  ngOnInit() {
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
          console.log(blogs.data);
          this.blogs = blogs.data;
        });
    } catch (error) {
      console.log(error);
    }
  }

  getBlog(id: string) {
    localStorage.setItem('idBlog', id);
    this.router.navigateByUrl('/viewblog');
  }

 
}
