import { Component, Inject, OnInit, DoCheck } from '@angular/core';
//import { HoroscopeService } from '../sevices/horoscope/horoscope-api.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Route, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { franc } from 'franc-min';
import axios from 'axios';
import { LOCALE_ID } from '@angular/core';

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
  others: string = 'Others';
  sign!: string;
  horoscope!: string;
  pseudo!: string;
  phone!: string;
  jId!: string;
  isSpeaking: boolean = false;
  selectedVoice!: string;
  choosedImage!: string;
  isRegistered: boolean = true;
  browserLanguage!: string;
  horoTitle: string = 'My daily horoscope';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.route.queryParams.subscribe((params) => {
      this.phone = params['phone'];
      this.jId = params['jId'] || localStorage.getItem('jId');
      this.pseudo = params['pseudo'] || localStorage.getItem('pseudo');
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.getUserByjId();
      });
  }

  ngOnInit() {
    this.getUserByjId();

    this.translateService.setDefaultLang('fr');

    const browserLang = navigator.language;

    this.browserLanguage = browserLang!;
  }

  getUserByjId() {
    console.log(this.jId);
    try {
      this.http
        .get(`https://apihoroverse.vercel.app/users/${this.jId}`)
        .subscribe(
          (user: any) => {
            this.pseudo = user.pseudo;
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
              localStorage.setItem('pseudo', this.pseudo);
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
    } catch (error) {
      console.error(error);
    }
  }

  segmentText(text: any, delimiter: any) {
    const segments = text.split(delimiter);
    return segments.map((segment: string) => segment.trim()); // Supprimer les espaces en début et fin de segment
  }

  async getDailyHoroscope() {
    const apiUrl = `https://apihoroverse.vercel.app/api/horoscope/${this.sign}`;
    try {
      this.http.get(apiUrl).subscribe((result: any) => {
        this.horoscope = result.horoscope;
        console.log(result);
        result.forEach((obj: any) => {
          const text = obj.text.replace(/<[^>]+>/g, ''); // remove html characters
          this.horoscope = text;
        });
        if (this.browserLanguage == 'fr-FR') {
          //this.translateHoroscope(); // Appeler translateHoroscope() ici
          this.onTranslate();
          this.horoTitle = 'Mon horoscope du jour';
        }
      });
    } catch (error) {
      console.error(error);
    }
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
    this.others = 'Others';
  }
  goToSettings() {
    this.router.navigateByUrl('/settings', { skipLocationChange: false });
  }
}
