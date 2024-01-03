import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { LOCALE_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { checkServiceWorkerConflicts } from 'src/service-worker-utils';

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
    @Inject(LOCALE_ID) public locale: string
  ) {
    checkServiceWorkerConflicts();
  }

  selectedDate!: string;
  astrologicalSign!: string;
  symbolSign!: string
  jId!: string;
  pseudo!: string;
  phone!: Number;
  showModal = false;
  tokenFCM!: string;
  browserLanguage!: string;

  ngOnInit() {
    this.jId = localStorage.getItem('jId') || '';
    this.phone = parseInt(localStorage.getItem('phone') || '0');
    this.requestFirebaseToken();

    const browserLang = navigator.language ;
    this.browserLanguage = browserLang;
    this.translateService.use(browserLang);

  }

  getAstrologicalSign() {
    const date = new Date(this.selectedDate);
    this.astrologicalSign = this.calculateAstrologicalSign(date);

    if (this.browserLanguage == 'fr-FR') {
      this.onTranslate();
    }
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

  showAlertModal() {
    this.showModal = true;
    setTimeout(() => {
      this.hideInformationModal();
    }, 3000); // Temps en millisecondes avant de masquer la fenêtre modale
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
        phone: this.phone,
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
      } catch (error: any) {
        console.log(error.message);
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
}

