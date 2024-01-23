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
  constructor(
    private http: HttpClient,
    private router: Router,
    private translateService: TranslateService,
    private afMessaging: AngularFireMessaging,
    public modalCtrl: ModalController,
    private pickerCtrl: PickerController,
    private loadingCtrl: LoadingController,
    @Inject(LOCALE_ID) public locale: string
  ) {}

  selectedDate!: string;
  astrologicalSign!: string;
  symbolSign!: string;
  jId!: string;
  pseudo!: string;
  phone!: Number;
  showModal = false;
  tokenFCM!: string;
  browserLanguage!: string;
  ipAddress!: string;
  welcomeMessage: string = 'Hello, what is your first name and your birthday?';
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
    const browserLang = navigator.language;
    this.browserLanguage = browserLang;
    this.translateService.use(browserLang);
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      
    });

    loading.present();
    return () => loading.dismiss();
  }

  async openDatePicker() {
    const picker = await this.pickerCtrl.create({
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'OK',
          handler: (value: any) => {
            this.selectedDate = `${value.day.text}-${value.month.text}`;
            this.getAstrologicalSign();

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

    await picker.present();
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

  getAstrologicalSign() {
    this.astrologicalSign = this.calculateAstrologicalSign(this.selectedDate);
    console.log(this.astrologicalSign);

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

    if (
      isNaN(day) ||
      isNaN(month) ||
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12
    ) {
      return 'Entrez une date valide';
    }

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

  createNewUser() {
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
          .post('https://apihoroverse.vercel.app/users/', credentials)
          .subscribe((res) => {
            console.log('user Created');
            this.router.navigateByUrl('/home');
            //this.router.navigate(['home'])
          });
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
      case 'aquarius':
        this.symbolSign = 'Verseau';
        break;
      case 'pisces':
        this.symbolSign = 'Poissons';
        break;
      case 'aries':
        this.symbolSign = 'Bélier';
        break;
      case 'taurus':
        this.symbolSign = 'Taureau';
        break;
      case 'gemini':
        this.symbolSign = 'Gémeaux';
        break;
      case 'cancer':
        this.symbolSign = 'Cancer';
        break;
      case 'leo':
        this.symbolSign = 'Lion';
        break;
      case 'virgo':
        this.symbolSign = 'Vierge';
        break;
      case 'libra':
        this.symbolSign = 'Balance';
        break;
      case 'scorpio':
        this.symbolSign = 'Scorpion';
        break;
      case 'sagittarius':
        this.symbolSign = 'Sagittaire';
        break;
      case 'capricorn':
        this.symbolSign = 'Capricorne';
        break;
      default:
        break;
    }
  }

  translateWelcomeMessage() {
    this.welcomeMessage =
      "Bonjour, quel est votre prénom et votre date d'anniversaire ?";
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

