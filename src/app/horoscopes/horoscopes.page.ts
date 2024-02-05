import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { franc } from 'franc-min';
import axios from 'axios';
import { LoadingController } from '@ionic/angular';
import { PickerController } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-horoscopes',
  templateUrl: './horoscopes.page.html',
  styleUrls: ['./horoscopes.page.scss'],
})
export class HoroscopesPage implements OnInit {
  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
    private pickerCtrl: PickerController,
    private router: Router
  ) {
    translate.setDefaultLang('en');
    const browserLang = translate.getBrowserLang();
    console.log(browserLang);

    translate.use(browserLang!.match(/en|fr/) ? browserLang! : 'en');

    this.onImageChange();

    if (browserLang == 'fr') {
      this.translateToFrench();
    }
  }

  browserLanguage!: string;
  ipAddress!: string;
  home: string = 'Home';
  news: string = 'News';
  opinion: string = 'Archives';
  guidePhrase: string = 'Choose a date or astrological sign';
  selectedDate!: string;
  public horoscope: string = '';
  public selectedSign: string = '';
  public choosedImage: string = '';
  public sunsign: string = '';
  private autoScrollInterval: any;

  public signs: string[] = [
    'ARIES',
    'TAURUS',
    'GEMINI',
    'CANCER',
    'LEO',
    'VIRGO',
    'LIBRA',
    'SCORPIO',
    'SAGITTARIUS',
    'CAPRICORN',
    'AQUARIUS',
    'PISCES',
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

  async ngOnInit() {
    try {
      await this.getIPAddress();
      console.log('Adresse IP:', this.ipAddress);
      // Utilisez this.ipAddress comme nécessaire dans votre application
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse IP:", error);
    }
    this.onImageChange();
    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  private startAutoScroll() {
    this.autoScrollInterval = setInterval(() => {
      // Changez le signe astrologique ici
      this.changeImageAutomatically();
    }, 3000); // 2000 millisecondes (2 secondes)
  }

  private stopAutoScroll() {
    clearInterval(this.autoScrollInterval);
  }

  private changeImageAutomatically() {
    // Changez l'image ici
    // Par exemple, déplacez-vous à l'image suivante dans votre tableau d'images
    const currentIndex = this.signs.indexOf(this.selectedSign);
    const nextIndex = (currentIndex + 1) % this.signs.length;
    this.selectedSign = this.signs[nextIndex];

    // Mettez à jour le reste des informations
    this.onImageChange();
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
    });

    loading.present();
    return () => loading.dismiss();
  }

  goToShowHoroscope(sign: string) {
    this.router.navigateByUrl(`/othersign/${sign}`);
  }
  async openDatePicker() {
    const picker = await this.pickerCtrl.create({
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'color-button',
        },
        {
          text: 'OK',
          handler: (value: any) => {
            this.selectedDate = `${value.day.text}-${value.month.text}`;
            this.getAstrologicalSign();
            this.goToShowHoroscope(this.selectedSign);

            // Ajoutez votre logique ici
          },
        },
      ],
      columns: [
        {
          name: 'day',
          options: this.generateDayOptions(),
        },
        {
          name: 'month',
          options: this.generateMonthOptions(),
        },
      ],
    });

    picker.present();
  }

  generateDayOptions() {
    const dayOptions = [];
    for (let i = 1; i <= 31; i++) {
      dayOptions.push({
        text: i.toString().padStart(2, '0'),
        value: i.toString().padStart(2, '0'),
      });
    }
    return dayOptions;
  }
  generateMonthOptions() {
    const monthOptions = [
      { text: 'Jan', value: '01' },
      { text: 'Feb', value: '02' },
      { text: 'Mar', value: '03' },
      { text: 'Apr', value: '04' },
      { text: 'May', value: '05' },
      { text: 'Jun', value: '06' },
      { text: 'Jul', value: '07' },
      { text: 'Aug', value: '08' },
      { text: 'Sep', value: '09' },
      { text: 'Oct', value: '10' },
      { text: 'Nov', value: '11' },
      { text: 'Dec', value: '12' },
    ];
    return monthOptions;
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
      case 'AQUARIUS':
        this.choosedImage = '../../assets/signes/verseau.png';
        break;
      case 'PISCES':
        this.choosedImage = '../../assets/signes/poissons.png';
        break;
      case 'ARIES':
        this.choosedImage = '../../assets/signes/belier.png';
        break;
      case 'TAURUS':
        this.choosedImage = '../../assets/signes/taureau.png';
        break;
      case 'GEMINI':
        this.choosedImage = '../../assets/signes/gemeaux.png';
        break;
      case 'CANCER':
        this.choosedImage = '../../assets/signes/cancer.png';
        break;
      case 'LEO':
        this.choosedImage = '../../assets/signes/lion.png';
        break;
      case 'VIRGO':
        this.choosedImage = '../../assets/signes/vierge.png';
        break;
      case 'LIBRA':
        this.choosedImage = '../../assets/signes/balance.png';
        break;
      case 'SCORPIO':
        this.choosedImage = '../../assets/signes/scorpion.png';
        break;
      case 'SAGITTARIUS':
        this.choosedImage = '../../assets/signes/sagitaire.png';
        break;
      case 'CAPRICORN':
        this.choosedImage = '../../assets/signes/capricorne.png';
        break;
      default:
        this.choosedImage = '../../assets/signes/horo.png';
        break;
    }
  }


  getAstrologicalSign() {
    const date = new Date(this.selectedDate);
    this.selectedSign = this.calculateAstrologicalSign(date);
  }

  calculateAstrologicalSign(date: any) {
    const month = date.getMonth() + 1; // Les mois sont indexés à partir de 0, donc on ajoute 1
    const day = date.getDate();

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return 'AQUARIUS';
    } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
      return 'PISCES';
    } else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      return 'ARIES';
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      return 'TAURUS';
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      return 'GEMINI';
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      return 'CANCER';
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return 'LEO';
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      return 'VIRGO';
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      return 'LIBRA';
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      return 'SCORPIO';
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      return 'SAGITTARIUS';
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      return 'CAPRICORN';
    } else {
      return "Entrez votre date d'anniversaire";
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
      return 'No sign selected';
    }
  }

  translateToFrench() {
    this.home = 'Acceuil';
    this.news = 'Infos';
    this.guidePhrase = 'Choisissez une date ou un signe astrologique';

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
