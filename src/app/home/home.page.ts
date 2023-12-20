import { Component, OnInit } from '@angular/core';
import { HoroscopeService } from '../sevices/horoscope/horoscope-api.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { franc } from 'franc-min';
import axios from 'axios';

declare var responsiveVoice : any
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  isOpenMenu = false;
  sign!: string;
  horoscope!: string;
  today!: string;
  currentMonth!: string;
  pseudo!: string;
  phone!: string;
  jId!: string;
  isSpeaking: boolean = false;
  selectedVoice!: string;
  choosedImage!: string;
  isRegistered: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.phone = params['phone'];
      this.jId = params['jId'] || localStorage.getItem('jId');
    });

    this.getUserByjId();
    this.today = this.getCurrentDay();
    this.currentMonth = this.getCurrentMonth();
    this.translateService.setDefaultLang('en');

    const browserLang = this.translateService.getBrowserLang();
    if (browserLang) {
      this.translateService.use(browserLang);
    } else {
      this.translateService.use('en');
    }
  }

  getUserByjId() {
    try {
      this.http
        .get(`https://apihoroverse.vercel.app/users/${this.jId}`)
        .subscribe(
          (user: any) => {
            this.pseudo = user.pseudo;
            console.log(user);
            this.sign = user.sign;
            this.getDailyHoroscope();
            this.onImageChange();
            localStorage.setItem('sign', this.sign);
            localStorage.setItem('pseudo', this.pseudo);
            localStorage.setItem('jId', this.jId);
          },
          (error) => {
            console.log(error);
            if (error.status === 404) {
              localStorage.setItem('jId', this.jId);
              localStorage.setItem('phone', this.phone);
              this.router.navigateByUrl('/astrosign');
            }
          }
        );
    } catch (error) {
      console.log(error);
    }
  }

  async translateHoroscope() {
    const url = `https://api.mymemory.translated.net/get`;

    const horoscopeSegments = this.segmentText(this.horoscope, 500);

    const translatedSegments = [];

    try {
      for (const segment of horoscopeSegments) {
        const response = await axios.get(url, {
          params: {
            q: segment,
            langpair: `en|fr`,
          },
        });

        const translatedSegment = response.data.responseData.translatedText;
        translatedSegments.push(translatedSegment);
      }

      const translatedHoroscope = translatedSegments.join(' '); // Concaténer les segments traduits
      this.horoscope = translatedHoroscope;
      console.log(this.horoscope); // Afficher le résultat en console
    } catch (error) {
      console.error(error);
    }
  }

  segmentText(text: any, maxLength: any) {
    const segments = [];
    let currentSegment = '';

    const words = text.split(' ');

    for (const word of words) {
      if (currentSegment.length + word.length + 1 <= maxLength) {
        currentSegment += (currentSegment === '' ? '' : ' ') + word;
      } else {
        segments.push(currentSegment);
        currentSegment = word;
      }
    }

    if (currentSegment !== '') {
      segments.push(currentSegment);
    }

    return segments;
  }

  async getDailyHoroscope() {
    const apiUrl = `https://apihoroverse.vercel.app/api/horoscope/${this.sign}`;
    try {
      this.http.get(apiUrl).subscribe((result: any) => {
        this.horoscope = result.horoscope;
        this.translateHoroscope(); // Appeler translateHoroscope() ici
      });
    } catch (error) {
      console.error(error);
    }
  }

  getCurrentDay(): string {
    const date = new Date();
    const options = { weekday: 'long' } as const;
    return date.toLocaleDateString('en-US', options);
  }

  getCurrentMonth(): string {
    const date = new Date();
    const options = { month: 'long' } as const;
    return date.toLocaleDateString('en-US', options);
  }

  getLanguageForResponsiveVoice(text: string): string {
    const detectedLanguage = franc(this.horoscope);
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
    let detectedLanguage = franc(this.horoscope);
    this.selectedVoice = this.getVoiceForLanguage(detectedLanguage);
    responsiveVoice.speak(this.horoscope, this.selectedVoice, {
      onend: () => {
        this.onEnd();
      },
    });
  }

  getVoiceForLanguage(languageCode: string): string {
    // Correspondance entre les codes de langue et les voix disponibles
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

  goToSettings() {
    this.router.navigateByUrl('/settings');
  }
}
