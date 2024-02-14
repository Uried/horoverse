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
import { Observable, forkJoin } from 'rxjs';
declare var responsiveVoice: any;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isOpenMenu = false;
  home: string = 'Home';
  news: string = 'News';
  opinion: string = 'Archives';
  sign!: string;
  horoscope: any[] = [];
  textToSpeak!: string;
  weeklyHoroscope!: string;
  monthlyHoroscope!: string;
  yearlyHoroscope!: string;
  pseudo!: string;
  phone!: string;
  jId!: string;
  dailyShowed: boolean = false;
  weeklyShowed: boolean = false;
  monthlyShowed: boolean = false;
  yearlyShowed: boolean = false;
  remainingText: string = '';
  isPaused: boolean = false;
  headPhones: boolean = true;
  isSpeaking: boolean = false;
  selectedVoice!: string;
  choosedImage!: string;
  isRegistered: boolean = true;
  browserLanguage!: string;
  currentPosition: number = 0;
  horoTitle: string = 'My daily horoscope';
  ipAddress!: string;
  language: string = 'en';
  publication: any;
  dailyHoroscopes: any[] = [];
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

    this.route.queryParams.subscribe((params) => {
      this.jId = params['phone'] || localStorage.getItem('jId');
      this.pseudo = params['pseudo'] || localStorage.getItem('pseudo');
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.getUserByjId();
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
    this.getUserByjId();
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
    });

    loading.present();
    return () => loading.dismiss();
  }

  getUserByjId() {
    try {
      this.http
        .get(`https://apihoroverse.vercel.app/users/${this.jId}`)
        .subscribe(
          (user: any) => {
            this.pseudo = user.pseudo;
            this.sign = user.sign;
            this.onImageChange();
            this.getDailyHoroscope();
            localStorage.setItem('idUser', user._id);
            localStorage.setItem('sign', this.sign);

            localStorage.setItem('pseudo', this.pseudo);
            localStorage.setItem('jId', this.jId);
            const log = {
              level: 'debug',
              message: 'utilisateur recupere',
              userId: localStorage.getItem('jId'),
              ipAddress: this.ipAddress,
            };
            this.http
              .post('https://apihoroverse.vercel.app/logs', log)
              .subscribe(
                (response) => {
                  console.log('Réponse:', response);
                },
                (error) => {
                  console.error('Erreur lors de la requête POST logs:', error);
                }
              );
          },
          (error) => {
            console.log(error);
            if (error.status === 404) {
              localStorage.setItem('jId', this.jId);
              localStorage.setItem('phone', this.jId);
              localStorage.setItem('pseudo', this.pseudo);
              this.router.navigateByUrl('/astrosign');
            }
          }
        );
    } catch (error) {
      console.log(error);
      const log = {
        level: 'error',
        message: 'Erreur de recuperation du user' + error,
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

  adviceList = [
    'Tips for Singles : Join or create a book club dedicated to spiritual literature.',
    'Another Advice : Your second piece of advice goes here.',
    // Ajoutez d'autres conseils selon vos besoins
  ];

  extractSuffix(advice: string): string {
    const parts = advice.split(':');
    return parts.length > 1 ? parts[1].trim() : '';
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
      case 'AQUARIUS':
        this.sign = 'Verseau';
        break;
      case 'PISCES':
        this.sign = 'Poissons';
        break;
      case 'ARIES':
        this.sign = 'Bélier';
        break;
      case 'TAURUS':
        this.sign = 'Taureau';
        break;
      case 'GEMINI':
        this.sign = 'Gémeaux';
        break;
      case 'CANCER':
        this.sign = 'Cancer';
        break;
      case 'LEO':
        this.sign = 'Lion';
        break;
      case 'VIRGO':
        this.sign = 'Vierge';
        break;
      case 'LIBRA':
        this.sign = 'Balance';
        break;
      case 'SCORPIO':
        this.sign = 'Scorpion';
        break;
      case 'SAGITTARIUS':
        this.sign = 'Sagittaire';
        break;
      case 'CAPRICORN':
        this.sign = 'Capricorne';
        break;
      default:
        break;
    }
  }

  goToSettings() {
    this.router.navigateByUrl('/settings', { skipLocationChange: false });
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

  async recallDailyHoroscope() {
    const dismissLoading = await this.showLoading();
    try {
      this.http
        .get(`apihoroverse.vercel.app/daily/${this.dateAujourdhui}`)
        .subscribe(async (result: any) => {
          this.textToSpeak = result[this.sign];
          const removeCharacter = result[this.sign];
          this.horoscope = removeCharacter.split('~');
          console.log(this.horoscope);
        });
      dismissLoading();
    } catch (error) {
      dismissLoading();
      console.log(error);
    }
  }

  async recallWeeklyHoroscope() {
    const dismissLoading = await this.showLoading();
    try {
      this.http
        .get(`https://apihoroverse.vercel.app/weekly/${this.dateAujourdhui}`)
        .subscribe(async (result: any) => {
          this.horoscope = result[this.sign];
        });
      dismissLoading();
    } catch (error) {
      dismissLoading();
      console.log(error);
    }
  }

  async recallMonthlyHoroscope() {
    const dismissLoading = await this.showLoading();
    try {
      this.http
        .get(`https://apihoroverse.vercel.app/monthly/${this.dateAujourdhui}`)
        .subscribe(async (result: any) => {
          this.horoscope = result[this.sign];
        });
      dismissLoading();
    } catch (error) {
      dismissLoading();
      console.log(error);
    }
  }

  async recallYearlyHoroscope() {
    const dismissLoading = await this.showLoading();
    try {
      this.http
        .get(`https://apihoroverse.vercel.app/yearly/${this.dateAujourdhui}`)
        .subscribe(async (result: any) => {
          this.horoscope = result[this.sign];
        });
      dismissLoading();
    } catch (error) {
      dismissLoading();
      console.log(error);
    }
  }

  async getDailyHoroscope() {
    (this.dailyShowed = true), (this.weeklyShowed = false);
    this.monthlyShowed = false;
    this.yearlyShowed = false;
    const url = `https://apihoroverse.vercel.app/daily/${this.dateAujourdhui}`;

    this.http.get(url).subscribe(
      (result: any) => {
        this.textToSpeak = result[this.sign];
        const removeCharacter = result[this.sign];
        this.horoscope = removeCharacter.split('|');
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
    (this.dailyShowed = false), (this.weeklyShowed = true);
    this.monthlyShowed = false;
    this.yearlyShowed = false;
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
    (this.dailyShowed = false), (this.weeklyShowed = false);
    this.monthlyShowed = true;
    this.yearlyShowed = false;
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
    (this.dailyShowed = false), (this.weeklyShowed = false);
    this.monthlyShowed = false;
    this.yearlyShowed = true;
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
