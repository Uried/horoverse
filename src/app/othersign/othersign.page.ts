import { Component, Inject, OnInit, DoCheck } from '@angular/core';
//import { HoroscopeService } from '../sevices/horoscope/horoscope-api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Route, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { franc } from 'franc-min';
import axios from 'axios';
import { LOCALE_ID } from '@angular/core';
import { PublicationService } from '../sevices/publication/publication.service';
import { LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
declare var responsiveVoice: any;

@Component({
  selector: 'app-othersign',
  templateUrl: './othersign.page.html',
  styleUrls: ['./othersign.page.scss'],
})
export class OthersignPage implements OnInit {
  isOpenMenu = false;
  home: string = 'Home';
  news: string = 'News';
  opinion: string = 'Opinions';
  sign = this.route.snapshot.paramMap.get('sign')!;
  horoscope: any[] = [];
  pseudo!: string;
  phone!: string;
  textToSpeak!: string;
  language: string = 'en';
  signInterval: string = this.getZodiacDateRange(this.sign);
  remainingText: string = '';
  isPaused: boolean = false;
  headPhones: boolean = true;
  isSpeaking: boolean = false;
  currentPosition: number = 0;
  selectedVoice!: string;
  choosedImage!: string;
  isRegistered: boolean = true;
  browserLanguage!: string;
  horoTitle: string = 'My horoscope';
  ipAddress!: string;
  publication: any;
  dateAujourdhui = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private translate: TranslateService,
    private publicationService: PublicationService,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    @Inject(LOCALE_ID) public locale: string
  ) {
    translate.setDefaultLang('en');
    const browserLang = translate.getBrowserLang();

    translate.use(browserLang!.match(/en|fr/) ? browserLang! : 'en');

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.getDailyHoroscope();

        this.onImageChange();
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

  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
    });

    loading.present();
    return () => loading.dismiss();
  }

  getLanguageForResponsiveVoice(text: string): string {
    const detectedLanguage = franc(this.textToSpeak);
    let languageCode = '';

    if (detectedLanguage === 'fra') {
      languageCode = 'French';
    } else if (detectedLanguage === 'eng') {
      languageCode = 'US English'; // Replace with the appropriate accent, e.g., 'UK English' if needed
    } else if (detectedLanguage === 'deu') {
      languageCode = 'German';
    } else if (detectedLanguage === 'spa') {
      languageCode = 'Spanish';
    }

    return languageCode;
  }

  speak() {
    this.isSpeaking = !this.isSpeaking;
    if (this.isSpeaking) {
      if (this.remainingText !== '') {
        this.isPaused = false;
        this.headPhones = true;
        responsiveVoice.resume();
      } else {
        let detectedLanguage = franc(this.textToSpeak);
        this.remainingText = this.textToSpeak.slice(this.currentPosition);
        this.selectedVoice = this.getVoiceForLanguage(detectedLanguage);
        responsiveVoice.speak(this.remainingText, this.selectedVoice, {
          onend: () => {
            this.isSpeaking = false;
            this.onEnd();
          },
        });
      }
    } else {
      responsiveVoice.pause();
      this.isPaused = true;
      this.headPhones = false;
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
      ARIES: {
        start: { day: 21, month: 'mars' },
        end: { day: 19, month: 'avril' },
      },
      TAURUS: {
        start: { day: 20, month: 'avril' },
        end: { day: 20, month: 'mai' },
      },
      GEMINI: {
        start: { day: 21, month: 'mai' },
        end: { day: 20, month: 'juin' },
      },
      CANCER: {
        start: { day: 21, month: 'juin' },
        end: { day: 22, month: 'juillet' },
      },
      LEO: {
        start: { day: 23, month: 'juillet' },
        end: { day: 22, month: 'août' },
      },
      VIRGO: {
        start: { day: 23, month: 'août' },
        end: { day: 22, month: 'septembre' },
      },
      LIBRA: {
        start: { day: 23, month: 'septembre' },
        end: { day: 22, month: 'octobre' },
      },
      SCORPIO: {
        start: { day: 23, month: 'octobre' },
        end: { day: 21, month: 'novembre' },
      },
      SAGITTARIUS: {
        start: { day: 22, month: 'novembre' },
        end: { day: 21, month: 'décembre' },
      },
      CAPRICORN: {
        start: { day: 22, month: 'décembre' },
        end: { day: 19, month: 'janvier' },
      },
      AQUARIUS: {
        start: { day: 20, month: 'janvier' },
        end: { day: 18, month: 'février' },
      },
      PISCES: {
        start: { day: 19, month: 'février' },
        end: { day: 20, month: 'mars' },
      },
    };

    const dateRange = dateRanges[sign];
    if (dateRange) {
      return `${dateRange.start.day} ${dateRange.start.month} - ${dateRange.end.day} ${dateRange.end.month}`;
    } else {
      return 'Aucun signe choisis';
    }
  }

  getVoiceForLanguage(languageCode: string): string {
    const voiceMap: { [key: string]: string } = {
      eng: 'US English Female',
      fra: 'French Female',
      spa: 'Spanish Female',
      deu: 'Deutsch Female',
    };
    return voiceMap[languageCode];
  }

  onEnd() {
    if (this.isSpeaking) {
      responsiveVoice.cancel();
      this.isSpeaking = false; // Réinitialiser l'état de lecture
    }
  }

  onImageChange() {
    switch (this.sign) {
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

  onTranslate() {
    switch (this.sign) {
      case 'aquarius':
        this.sign = 'Verseau';
        break;
      case 'pisces':
        this.sign = 'Poissons';
        break;
      case 'aries':
        this.sign = 'Bélier';
        break;
      case 'taurus':
        this.sign = 'Taureau';
        break;
      case 'gemini':
        this.sign = 'Gémeaux';
        break;
      case 'cancer':
        this.sign = 'Cancer';
        break;
      case 'leo':
        this.sign = 'Lion';
        break;
      case 'virgo':
        this.sign = 'Vierge';
        break;
      case 'libra':
        this.sign = 'Balance';
        break;
      case 'scorpio':
        this.sign = 'Scorpion';
        break;
      case 'sagittarius':
        this.sign = 'Sagittaire';
        break;
      case 'capricorn':
        this.sign = 'Capricorne';
        break;
      default:
        break;
    }
  }

  translateToFrench() {
    this.home = 'Acceuil';
    this.news = 'Infos';
    this.opinion = 'Avis';
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

  recallDailyHoroscope() {
    this.http
      .get(`https://apihoroverse.vercel.app/daily/${this.dateAujourdhui}`)
      .subscribe(async (result: any) => {
        this.textToSpeak = result[this.sign];
        const removeCharacter = result[this.sign];
        this.horoscope = removeCharacter.split('~');
        console.log(this.horoscope);
      });
  }

  recallWeeklyHoroscope() {
    this.http
      .get(`https://apihoroverse.vercel.app/weekly/${this.dateAujourdhui}`)
      .subscribe(async (result: any) => {
        this.horoscope = result[this.sign];
      });
  }

  recallMonthlyHoroscope() {
    this.http
      .get(`https://apihoroverse.vercel.app/${this.dateAujourdhui}`)
      .subscribe(async (result: any) => {
        this.horoscope = result[this.sign];
      });
  }

  recallYearlyHoroscope() {
    this.http
      .get(`https://apihoroverse.vercel.app/yearly/${this.dateAujourdhui}`)
      .subscribe(async (result: any) => {
        this.horoscope = result[this.sign];
      });
  }

  getDailyHoroscope() {
    console.log(this.sign);

    const url = `https://apihoroverse.vercel.app/daily/${this.dateAujourdhui}`;

    this.http.get(url).subscribe(
      (result: any) => {
        this.textToSpeak = result[this.sign];
        const removeCharacter = result[this.sign];
        this.horoscope = removeCharacter.split('|');
        console.log(this.horoscope);
      },
      (error) => {
        if (error.status === 404) {
          try {
            const api_key = '8c00dee24c9878fea090ed070b44f1ab';
            const timezone = '1';
            const signArray = [
              'ARIES',
              'PISCES',
              'GEMINI',
              'TAURUS',
              'LIBRA',
              'SCORPIO',
              'CANCER',
              'LEO',
              'VIRGO',
              'SAGITTARIUS',
              'CAPRICORN',
              'AQUARIUS',
            ];
            const apiUrl =
              'https://divineapi.com/api/1.0/get_daily_horoscope.php';
            const horoscopes: { [key: string]: string } = {};

            const observables = signArray.map((sign) => {
              const headers = new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
              });
              const body = new URLSearchParams();
              body.set('date', this.dateAujourdhui);
              body.set('api_key', api_key);
              body.set('sign', sign);
              body.set('timezone', timezone);

              return this.http.post(apiUrl, body.toString(), {
                headers: headers,
              });
            });

            forkJoin(observables).subscribe((results: any[]) => {
              results.forEach((data: any, index: number) => {
                const horoscopeData = data.data.prediction;
                const luck = horoscopeData.luck;

                const horoscope = [
                  horoscopeData.personal,
                  horoscopeData.health,
                  horoscopeData.profession,
                  horoscopeData.emotions,
                  horoscopeData.travel,
                  luck[4],
                  luck[5],
                  luck[0],
                  luck[1],
                ];
                const tmp = horoscope.join('|');
                horoscopes[signArray[index]] = tmp;
              });

              console.log(horoscopes);

              if (Object.keys(horoscopes).length > 0) {
                console.log(horoscopes);
                this.http
                  .post(`https://apihoroverse.vercel.app/daily/`, horoscopes)
                  .subscribe();
              }
            });
            this.recallDailyHoroscope();
          } catch (error) {
            console.log(error);
          }
        }
      }
    );
  }

  getWeekHoroscope() {
    const url = `https://apihoroverse.vercel.app/weekly/${this.dateAujourdhui}`;

    this.http.get(url).subscribe(
      (result: any) => {
        this.textToSpeak = result[this.sign];
        const removeCharacter = result[this.sign];
        this.horoscope = removeCharacter.split('|');
        console.log(this.horoscope);
      },
      (error) => {
        if (error.status === 404) {
          try {
            const api_key = '8c00dee24c9878fea090ed070b44f1ab';
            const timezone = '1';
            const signArray = [
              'ARIES',
              'PISCES',
              'GEMINI',
              'TAURUS',
              'LIBRA',
              'SCORPIO',
              'CANCER',
              'LEO',
              'VIRGO',
              'SAGITTARIUS',
              'CAPRICORN',
              'AQUARIUS',
            ];
            const apiUrl =
              'https://divineapi.com/api/1.0/get_weekly_horoscope.php';
            const horoscopes: { [key: string]: string } = {};

            const observables = signArray.map((sign) => {
              const headers = new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
              });
              const body = new URLSearchParams();
              body.set('week', 'current');
              body.set('api_key', api_key);
              body.set('sign', sign);
              body.set('timezone', timezone);

              return this.http.post(apiUrl, body.toString(), {
                headers: headers,
              });
            });

            forkJoin(observables).subscribe((results: any[]) => {
              results.forEach((data: any, index: number) => {
                const horoscopeData = data.data.weekly_horoscope;
                const luck = horoscopeData.luck;

                const horoscope = [
                  horoscopeData.personal,
                  horoscopeData.health,
                  horoscopeData.profession,
                  horoscopeData.emotions,
                  horoscopeData.travel,
                  luck[4],
                  luck[5],
                  luck[0],
                  luck[1],
                ];
                const tmp = horoscope.join('|');
                horoscopes[signArray[index]] = tmp;
              });

              console.log(horoscopes);

              if (Object.keys(horoscopes).length > 0) {
                console.log(horoscopes);
                this.http
                  .post(`https://apihoroverse.vercel.app/weekly/`, horoscopes)
                  .subscribe();
              }
            });
            this.recallWeeklyHoroscope();
          } catch (error) {
            console.log(error);
          }
        }
      }
    );
  }

  async getMonthlyHoroscope() {
    const url = `https://apihoroverse.vercel.app/monthly/${this.dateAujourdhui}`;

    this.http.get(url).subscribe(
      (result: any) => {
        this.textToSpeak = result[this.sign];
        const removeCharacter = result[this.sign];
        this.horoscope = removeCharacter.split('|');
        console.log(this.horoscope);
      },
      (error) => {
        if (error.status === 404) {
          try {
            const api_key = '8c00dee24c9878fea090ed070b44f1ab';
            const timezone = '1';
            const signArray = [
              'ARIES',
              'PISCES',
              'GEMINI',
              'TAURUS',
              'LIBRA',
              'SCORPIO',
              'CANCER',
              'LEO',
              'VIRGO',
              'SAGITTARIUS',
              'CAPRICORN',
              'AQUARIUS',
            ];
            const apiUrl =
              'https://divineapi.com/api/1.0/get_monthly_horoscope.php';
            const horoscopes: { [key: string]: string } = {};

            const observables = signArray.map((sign) => {
              const headers = new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
              });
              const body = new URLSearchParams();
              body.set('month', 'current');
              body.set('api_key', api_key);
              body.set('sign', sign);
              body.set('timezone', timezone);

              return this.http.post(apiUrl, body.toString(), {
                headers: headers,
              });
            });

            forkJoin(observables).subscribe((results: any[]) => {
              results.forEach((data: any, index: number) => {
                const horoscopeData = data.data.monthly_horoscope;
                const luck = horoscopeData.luck;

                const horoscope = [
                  horoscopeData.personal,
                  horoscopeData.health,
                  horoscopeData.profession,
                  horoscopeData.emotions,
                  horoscopeData.travel,
                  luck[4],
                  luck[5],
                  luck[0],
                  luck[1],
                ];
                const tmp = horoscope.join('|');
                horoscopes[signArray[index]] = tmp;
              });

              console.log(horoscopes);

              if (Object.keys(horoscopes).length > 0) {
                console.log(horoscopes);
                this.http
                  .post(`https://apihoroverse.vercel.app/monthly/`, horoscopes)
                  .subscribe();
              }
            });
            this.recallMonthlyHoroscope();
          } catch (error) {
            console.log(error);
          }
        }
      }
    );
  }

  async getYearlyHoroscope() {
    const url = `https://apihoroverse.vercel.app/yearly/${this.dateAujourdhui}`;

    this.http.get(url).subscribe(
      (result: any) => {
        this.textToSpeak = result[this.sign];
        const removeCharacter = result[this.sign];
        this.horoscope = removeCharacter.split('|');
        console.log(this.horoscope);
      },
      (error) => {
        if (error.status === 404) {
          try {
            const api_key = '8c00dee24c9878fea090ed070b44f1ab';
            const timezone = '1';
            const signArray = [
              'ARIES',
              'PISCES',
              'GEMINI',
              'TAURUS',
              'LIBRA',
              'SCORPIO',
              'CANCER',
              'LEO',
              'VIRGO',
              'SAGITTARIUS',
              'CAPRICORN',
              'AQUARIUS',
            ];
            const apiUrl =
              'https://divineapi.com/api/1.0/get_yearly_horoscope.php';
            const horoscopes: { [key: string]: string } = {};

            const observables = signArray.map((sign) => {
              const headers = new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded',
              });
              const body = new URLSearchParams();
              body.set('year', 'current');
              body.set('api_key', api_key);
              body.set('sign', sign);
              body.set('timezone', timezone);

              return this.http.post(apiUrl, body.toString(), {
                headers: headers,
              });
            });

            forkJoin(observables).subscribe((results: any[]) => {
              results.forEach((data: any, index: number) => {
                const horoscopeData = data.data.yearly_horoscope;
                const luck = horoscopeData.luck;

                const horoscope = [
                  horoscopeData.personal,
                  horoscopeData.health,
                  horoscopeData.profession,
                  horoscopeData.emotions,
                  horoscopeData.travel,
                  luck[4],
                  luck[5],
                  luck[0],
                  luck[1],
                ];
                const tmp = horoscope.join('|');
                horoscopes[signArray[index]] = tmp;
              });

              console.log(horoscopes);

              if (Object.keys(horoscopes).length > 0) {
                console.log(horoscopes);
                this.http
                  .post(`https://apihoroverse.vercel.app/yearly/`, horoscopes)
                  .subscribe();
              }
            });
            this.recallYearlyHoroscope();
          } catch (error) {
            console.log(error);
          }
        }
      }
    );
  }
}
