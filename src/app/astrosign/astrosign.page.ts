
import { Component, Inject, OnInit, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { LOCALE_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ModalController } from '@ionic/angular';
import { PickerController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-astrosign',
  templateUrl: './astrosign.page.html',
  styleUrls: ['./astrosign.page.scss'],
})
export class AstrosignPage implements OnInit {
  days = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ];
  months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  selectedMonth = 'Jan';
  selectedDay = 1;

  constructor(
    private http: HttpClient,
    private router: Router,
    private translate: TranslateService,
    private afMessaging: AngularFireMessaging,
    public modalCtrl: ModalController,
    private pickerCtrl: PickerController,
    private loadingCtrl: LoadingController,

    @Inject(LOCALE_ID) public locale: string
  ) {
    translate.setDefaultLang('en');
    const browserLang = translate.getBrowserLang();

    translate.use(browserLang!.match(/en|fr/) ? browserLang! : 'en');
    if (browserLang == 'fr'){
      this.onTranslate()
    }
  }

  selectedDate!: string;
  astrologicalSign!: string;
  jId!: string;
  pseudo!: string;
  phone!: Number;
  showModal = false;
  tokenFCM!: string;
  browserLanguage!: string;
  ipAddress!: string;
  welcomeMessage: string =
    'Hello, what is your first name, day and month of birth?';
  firstname: string = 'Firstname';

  async ngOnInit() {
    try {
      await this.getIPAddress();
      console.log('Adresse IP:', this.ipAddress);
      // Utilisez this.ipAddress comme nécessaire dans votre application
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse IP:", error);
    }
    this.jId = localStorage.getItem('jId') || '';
    this.pseudo = localStorage.getItem('pseudo') || '';
    this.phone = parseInt(localStorage.getItem('phone') || '0');
    this.requestFirebaseToken();
    this.getAstrologicalSign()
  }

  selectDay(day: any) {
    this.selectedDay = day;
  }

  selectMonth(month: any) {
    this.selectedMonth = month;
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
    });

    loading.present();
    return () => loading.dismiss();
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

  getAstrologicalSign() {
    this.selectedDate = `${this.selectedDay}-${this.selectedMonth}`;

    this.astrologicalSign = this.calculateAstrologicalSign(this.selectedDate);

    if (this.browserLanguage == 'fr-FR') {
      this.translateWelcomeMessage();
      this.onTranslate();
    }
  }

  calculateAstrologicalSign(selectedDate: string): string {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const selectedDateParts = selectedDate.split('-');
    const day = parseInt(selectedDateParts[0], 10);
    const monthAbbreviation = selectedDateParts[1];

    const month =
      monthNames.findIndex((name) => name === monthAbbreviation) + 1;

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return 'AQUARIUS';
    } else if (
      (month === 2 && day >= 19 && day < 30) ||
      (month === 3 && day <= 20)
    ) {
      return 'PISCES';
    } else if (
      (month === 3 && day >= 21) ||
      (month === 4 && day <= 19 && day < 31)
    ) {
      return 'ARIES';
    } else if (
      (month === 4 && day >= 20 && day < 31) ||
      (month === 5 && day <= 20)
    ) {
      return 'TAURUS';
    } else if (
      (month === 5 && day >= 21) ||
      (month === 6 && day <= 20 && day < 31)
    ) {
      return 'GEMINI';
    } else if (
      (month === 6 && day >= 21 && day < 31) ||
      (month === 7 && day <= 22)
    ) {
      return 'CANCER';
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return 'LEO';
    } else if (
      (month === 8 && day >= 23) ||
      (month === 9 && day <= 22 && day < 31)
    ) {
      return 'VIRGO';
    } else if (
      (month === 9 && day >= 23 && day < 31) ||
      (month === 10 && day <= 22)
    ) {
      return 'LIBRA';
    } else if (
      (month === 10 && day >= 23) ||
      (month === 11 && day <= 21 && day < 31)
    ) {
      return 'SCORPIO';
    } else if (
      (month === 11 && day >= 22 && day < 31) ||
      (month === 12 && day <= 21)
    ) {
      return 'SAGITTARIUS';
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      return 'CAPRICORN';
    } else {
      return 'Entrez un jour valide';
    }
  }

  showAlertModal() {
    this.showModal = true;
    setTimeout(() => {
      this.hideInformationModal();
    }, 3000); // Temps en millisecondes avant de masquer la fenêtre modale
    const log = {
      level: 'error',
      message: 'Erreur, pas de selection du jour daniverssaire',
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

  hideInformationModal() {
    this.showModal = false;
  }

  requestFirebaseToken() {
    this.afMessaging.requestToken.subscribe(
      (token: any) => {
        console.log(token);
        this.tokenFCM = token;
        localStorage.setItem('tokenFCM', this.tokenFCM);
      },
      (error) => {
        console.error('Impossible de récupérer le token FCM', error);
      }
    );
  }

  async createNewUser() {
    const dismissLoading = await this.showLoading();
    if (!this.selectedDate) {
      this.showAlertModal();
    } else {
      const credentials = {
        jId: this.jId,
        pseudo: this.pseudo,
        phone: this.jId,
        sign: this.astrologicalSign,
        tokenFCM: this.tokenFCM,
      };

      try {
        this.http
          .post('apihoroverse.vercel.app/users/', credentials)
          .subscribe((res) => {
            console.log('user Created');
            this.router.navigateByUrl('/home');
            //this.router.navigate(['home'])
          });
        dismissLoading();
        const log = {
          level: 'logging',
          message: 'Nouvel utilisateur cree',
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
      } catch (error: any) {
        console.log(error.message);
        dismissLoading();
        const log = {
          level: 'error',
          message: 'Erreur lors de la creation dun nouvel utilisateur' + error,
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

  onTranslate() {
    switch (this.astrologicalSign) {
      case 'AQUARIUS':
        this.astrologicalSign = 'Verseau';
        break;
      case 'PISCES':
        this.astrologicalSign = 'Poissons';
        break;
      case 'ARIES':
        this.astrologicalSign = 'Bélier';
        break;
      case 'TAURUS':
        this.astrologicalSign = 'Taureau';
        break;
      case 'GEMINI':
        this.astrologicalSign = 'Gémeaux';
        break;
      case 'CANCER':
        this.astrologicalSign = 'Cancer';
        break;
      case 'LEO':
        this.astrologicalSign = 'Lion';
        break;
      case 'VIRGO':
        this.astrologicalSign = 'Vierge';
        break;
      case 'LIBRA':
        this.astrologicalSign = 'Balance';
        break;
      case 'SCORPIO':
        this.astrologicalSign = 'Scorpion';
        break;
      case 'SAGITTARIUS':
        this.astrologicalSign = 'Sagittaire';
        break;
      case 'CAPRICORN':
        this.astrologicalSign = 'Capricorne';
        break;
      default:
        break;
    }
  }

  translateWelcomeMessage() {
    this.welcomeMessage =
      'Bonjour, quel est votre prénom votre jour et mois de naissance?';
    this.firstname = 'Prénom';
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
