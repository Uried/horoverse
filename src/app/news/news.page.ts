import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {
  browserLanguage!: string;
  home: string = 'Home';
  news: string = 'News';
  others: string = 'Others';

  constructor(private translateService: TranslateService) {}

  ngOnInit() {
    this.translateService.setDefaultLang('fr');

    const browserLang = navigator.language;

    this.browserLanguage = browserLang!;
    if (this.browserLanguage == 'fr-FR') {
      this.translateToFrench();
      //this.translateHoroscope(); // Appeler translateHoroscope() ici
    }
  }

  translateToFrench() {
    this.home = 'Acceuil';
    this.news = 'Infos';
    this.others = 'Others';
  }
}
