import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { HomePage } from '../home/home.page';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  selectedDate!: string;
  astrologicalSign!: string;
  choosedImage!: string;
  pseudo!: string;
  jId!: string;
  horoscope!: string;
  sign!: string;
  browserLanguage!: string;
  ipAddress!: string;

  constructor(
    private router: Router,
    private http: HttpClient,
    private location: Location,
    private translate: TranslateService,
    @Inject(LOCALE_ID) public locale: string
  ) {
     translate.setDefaultLang('en');
     const browserLang = translate.getBrowserLang();
     console.log(browserLang);

     translate.use(browserLang!.match(/en|fr/) ? browserLang! : 'en');

       if (browserLang == 'fr') {
         this.onTranslate();
       }
  }

  async ngOnInit() {
    try {
      await this.getIPAddress();
      console.log('Adresse IP:', this.ipAddress);
      // Utilisez this.ipAddress comme nécessaire dans votre application
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse IP:", error);
    }
    this.astrologicalSign = localStorage.getItem('sign') || '';
    this.pseudo = localStorage.getItem('pseudo') || '';
    this.jId = localStorage.getItem('jId') || '';
    this.onImageChange();
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  getAstrologicalSign() {
    const date = new Date(this.selectedDate);
    this.astrologicalSign = this.calculateAstrologicalSign(date);
    this.onImageChange();
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

  onImageChange() {
    switch (this.astrologicalSign) {
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
        this.sign = 'Sagittaire';
        break;
      case 'CAPRICORN':
        this.astrologicalSign = 'Capricorne';
        break;
      default:
        break;
    }
  }

  changeAstrologicalSign() {
    console.log(this.astrologicalSign);

    const requestBody = {
      sign: this.astrologicalSign,
    };
    try {
      this.http
        .put(`https://apihoroverse.vercel.app/users/${this.jId}`, requestBody)
        .pipe(
          map((response) => {
            console.log(response);
            // Traitez la réponse si nécessaire
            return response;
          }),
          catchError((error) => {
            console.error(
              'Erreur lors de la mise à jour du signe astrologique',
              error
            );
            // Gérez l'erreur si nécessaire
            return throwError(error);
          })
        )
        .subscribe(() => {
          this.router.navigateByUrl('/home', { skipLocationChange: false });
        });
      const log = {
        level: 'debug',
        message: 'Modification de son signe astrologique',
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
        message: 'Erreur lors de la modification du signe astrologique' + error,
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
