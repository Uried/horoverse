import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { franc } from 'franc-min';
import axios from 'axios';
@Component({
  selector: 'app-horoscopes',
  templateUrl: './horoscopes.page.html',
  styleUrls: ['./horoscopes.page.scss'],
})
export class HoroscopesPage implements OnInit {
  constructor(
    private http: HttpClient,
    private translateService: TranslateService,
  ) {
    this.onImageChange();
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
    if (this.browserLanguage == 'fr-FR') {
      this.translateToFrench();
    }
    this.getHoroscopeBySunSign();
    this.onImageChange();
  }
  browserLanguage!: string;
  ipAddress!: string;
  home: string = 'Home';
  news: string = 'News';
  opinion: string = 'Opinions';
  guidePhrase: string = 'Choose a date or astrological sign';
  selectedDate!: string;
  public horoscope: string = '';
  public selectedSign: string = 'aries';
  signInterval: string = this.getZodiacDateRange(this.selectedSign);
  public choosedImage: string = '';
  public sunsign: string = '';
  public signs: string[] = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];

  public translateSign: string[] = [
    'Bélier',
    'Taureau',
    'Gémeaux',
    'Cancer',
    'Cancer',
    'Vierge',
    'Balance',
    'Scorpion',
    'Sagittaire',
    'Capricorne',
    'Verseau',
    'Poissons',
  ];

  async getHoroscopeBySunSign() {
    const apiUrl = `https://apihoroverse.vercel.app/api/horoscope/${this.selectedSign}`;
    try {
      this.http.get(apiUrl).subscribe((result: any) => {
        this.horoscope = result.horoscope;
        console.log(result);

        result.forEach((obj: any) => {
          const text = obj.text.replace(/<[^>]+>/g, ''); // remove html characters
          this.horoscope = text;
          this.onImageChange();
          this.onTranslate();
          this.signInterval = this.getZodiacDateRange(this.selectedSign);
          if (this.browserLanguage == 'fr-FR') {
            this.translateHoroscope();
            this.signInterval = this.getZodiacDateRange(this.selectedSign);
          } else {
            this.signInterval = this.getTranslatedZodiacDateRange(
              this.selectedSign
            );
          }
        });
        const log = {
          level: 'debug',
          message: 'Affiche la lhoroscope en fonction du signe astrologique choisi',
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
      console.error(error);
    }
  }

  async translateHoroscope() {
    const url = `https://api.mymemory.translated.net/get`;

    const horoscopePhrases = this.segmentText(this.horoscope, '.'); // Segmenter par phrases

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
      this.horoscope = translatedHoroscope;
      console.log(this.horoscope); // Afficher le résultat en console

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

  onImageChange() {
    switch (this.selectedSign) {
      case 'aquarius':
        this.choosedImage = '../../assets/signes/verseau.png';
        break;
      case 'pisces':
        this.choosedImage = '../../assets/signes/poissons.png';
        break;
      case 'aries':
        this.choosedImage = '../../assets/signes/belier.png';
        break;
      case 'taurus':
        this.choosedImage = '../../assets/signes/taureau.png';
        break;
      case 'gemini':
        this.choosedImage = '../../assets/signes/gemeaux.png';
        break;
      case 'cancer':
        this.choosedImage = '../../assets/signes/cancer.png';
        break;
      case 'leo':
        this.choosedImage = '../../assets/signes/lion.png';
        break;
      case 'virgo':
        this.choosedImage = '../../assets/signes/vierge.png';
        break;
      case 'libra':
        this.choosedImage = '../../assets/signes/balance.png';
        break;
      case 'scorpio':
        this.choosedImage = '../../assets/signes/scorpion.png';
        break;
      case 'sagittarius':
        this.choosedImage = '../../assets/signes/sagitaire.png';
        break;
      case 'capricorn':
        this.choosedImage = '../../assets/signes/capricorne.png';
        break;
      default:
        this.choosedImage = '../../assets/signes/horo.png';
        break;
    }
  }

  onTranslate() {
    switch (this.selectedSign) {
      case 'aquarius':
        this.sunsign = 'Verseau';
        break;
      case 'pisces':
        this.sunsign = 'Poissons';
        break;
      case 'aries':
        this.sunsign = 'Bélier';
        break;
      case 'taurus':
        this.sunsign = 'Taureau';
        break;
      case 'gemini':
        this.sunsign = 'Gémeaux';
        break;
      case 'cancer':
        this.sunsign = 'Cancer';
        break;
      case 'leo':
        this.sunsign = 'Lion';
        break;
      case 'virgo':
        this.sunsign = 'Vierge';
        break;
      case 'libra':
        this.sunsign = 'Balance';
        break;
      case 'scorpio':
        this.sunsign = 'Scorpion';
        break;
      case 'sagittarius':
        this.sunsign = 'Sagittaire';
        break;
      case 'capricorn':
        this.sunsign = 'Capricorne';
        break;
      default:
        break;
    }
  }

  getAstrologicalSign() {
    const date = new Date(this.selectedDate);
    this.selectedSign = this.calculateAstrologicalSign(date);
    this.getHoroscopeBySunSign();
  }

  calculateAstrologicalSign(date: any) {
    const month = date.getMonth() + 1; // Les mois sont indexés à partir de 0, donc on ajoute 1
    const day = date.getDate();

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return 'aquarius';
    } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
      return 'pisces';
    } else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      return 'aries';
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      return 'taurus';
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      return 'gemini';
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      return 'cancer';
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return 'leo';
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      return 'virgo';
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      return 'libra';
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      return 'scorpio';
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      return 'sagittarius';
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      return 'capricorn';
    } else {
      return "Entrez votre date d'anniversaire";
    }
  }

  getZodiacDateRange(sign: string): string {
    const dateRanges: Record<
      string,
      {
        start: { day: number; month: string };
        end: { day: number; month: string };
      }
    > = {
      aries: {
        start: { day: 21, month: 'mars' },
        end: { day: 19, month: 'avril' },
      },
      taurus: {
        start: { day: 20, month: 'avril' },
        end: { day: 20, month: 'mai' },
      },
      gemini: {
        start: { day: 21, month: 'mai' },
        end: { day: 20, month: 'juin' },
      },
      cancer: {
        start: { day: 21, month: 'juin' },
        end: { day: 22, month: 'juillet' },
      },
      leo: {
        start: { day: 23, month: 'juillet' },
        end: { day: 22, month: 'août' },
      },
      virgo: {
        start: { day: 23, month: 'août' },
        end: { day: 22, month: 'septembre' },
      },
      libra: {
        start: { day: 23, month: 'septembre' },
        end: { day: 22, month: 'octobre' },
      },
      scorpio: {
        start: { day: 23, month: 'octobre' },
        end: { day: 21, month: 'novembre' },
      },
      sagittarius: {
        start: { day: 22, month: 'novembre' },
        end: { day: 21, month: 'décembre' },
      },
      capricorn: {
        start: { day: 22, month: 'décembre' },
        end: { day: 19, month: 'janvier' },
      },
      aquarius: {
        start: { day: 20, month: 'janvier' },
        end: { day: 18, month: 'février' },
      },
      pisces: {
        start: { day: 19, month: 'février' },
        end: { day: 20, month: 'mars' },
      },
    };

    const dateRange = dateRanges[sign.toLowerCase()];
    if (dateRange) {
      return `${dateRange.start.day} ${dateRange.start.month} - ${dateRange.end.day} ${dateRange.end.month}`;
    } else {
      return 'Invalid sign';
    }
  }

  getTranslatedZodiacDateRange(sign: string): string {
    const dateRanges: Record<
      string,
      {
        start: { day: number; month: string };
        end: { day: number; month: string };
      }
    > = {
      aries: {
        start: { day: 21, month: 'march' },
        end: { day: 19, month: 'april' },
      },
      taurus: {
        start: { day: 20, month: 'april' },
        end: { day: 20, month: 'may' },
      },
      gemini: {
        start: { day: 21, month: 'may' },
        end: { day: 20, month: 'june' },
      },
      cancer: {
        start: { day: 21, month: 'june' },
        end: { day: 22, month: 'july' },
      },
      leo: {
        start: { day: 23, month: 'july' },
        end: { day: 22, month: 'august' },
      },
      virgo: {
        start: { day: 23, month: 'august' },
        end: { day: 22, month: 'september' },
      },
      libra: {
        start: { day: 23, month: 'september' },
        end: { day: 22, month: 'october' },
      },
      scorpio: {
        start: { day: 23, month: 'october' },
        end: { day: 21, month: 'november' },
      },
      sagittarius: {
        start: { day: 22, month: 'november' },
        end: { day: 21, month: 'décember' },
      },
      capricorn: {
        start: { day: 22, month: 'décember' },
        end: { day: 19, month: 'january' },
      },
      aquarius: {
        start: { day: 20, month: 'janvier' },
        end: { day: 18, month: 'février' },
      },
      pisces: {
        start: { day: 19, month: 'febuary' },
        end: { day: 20, month: 'march' },
      },
    };

    const dateRange = dateRanges[sign.toLowerCase()];
    if (dateRange) {
      return `${dateRange.start.day} ${dateRange.start.month} - ${dateRange.end.day} ${dateRange.end.month}`;
    } else {
      return 'Invalid sign';
    }
  }

  translateToFrench() {
    this.home = 'Acceuil';
    this.news = 'Infos';
    this.opinion = 'Avis';
    this.guidePhrase = 'Choisissez une date ou un signe astrologique';
    this.onTranslate();
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
