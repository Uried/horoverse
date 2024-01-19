import { Component, Inject, OnInit, DoCheck } from '@angular/core';
//import { HoroscopeService } from '../sevices/horoscope/horoscope-api.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Route, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { franc } from 'franc-min';
import axios from 'axios';
import { LOCALE_ID } from '@angular/core';
import { PublicationService } from '../sevices/publication/publication.service';

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
  opinion: string = 'Opinions';
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
  ipAddress!: string;
  publication: any;
  dateAujourdhui = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService,
    private publicationService: PublicationService,
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

  async ngOnInit() {

    try {
      await this.getIPAddress();
      console.log('Adresse IP:', this.ipAddress);
      // Utilisez this.ipAddress comme nécessaire dans votre application
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse IP:", error);
    }

    this.translateService.setDefaultLang('fr');
    if (this.browserLanguage == 'fr-FR') {
      this.translateToFrench();
    }
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
            this.getAllPublications();
            this.onImageChange();
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
              localStorage.setItem('phone', this.phone);
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
      localStorage.setItem('myHoroscope', translatedHoroscope);
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
        result.forEach((obj: any) => {
          const text = obj.text.replace(/<[^>]+>/g, ''); // remove html characters
          this.horoscope = text;
        });
        if (this.browserLanguage == 'fr-FR') {

        }
      });
    } catch (error) {
      console.error(error);
      const log = {
        level: 'error',
        message: 'Erreur de recuperation de lhoroscope' + error,
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
    this.getHoroscopes()
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
    this.opinion = 'Avis';
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

 async getAllPublications() {
  try {
    this.publicationService.getAllPublications().subscribe(
      async (publications: any) => {
        let publicationFound = false;

        for (const publication of publications) {
          const publicationDate = new Date(publication.date)
            .toISOString()
            .split('T')[0];

          if (publicationDate === this.dateAujourdhui) {
            this.horoscope = publication[this.sign];
            publicationFound = true;
            break;
          }
        }

        if (!publicationFound) {
          await this.getDailyHoroscope();
        }
        if (this.browserLanguage == 'fr-FR') {
          this.translateHoroscope();
           this.onTranslate();
           this.horoTitle = 'Mon horoscope du jour';
           this.translateToFrench();
        }
      }
    );

  } catch (error) {
    console.log(error);

    const log = {
      level: 'error',
      message:
        'Erreur lors de la récupération de lhistorique des horoscopes' + error,
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


  async getHoroscopes() {
    const horoscopes: { [key: string]: string } = {};
    const signArray = [
      'aries',
      'pisces',
      'gemini',
      'taurus',
      'libra',
      'scorpio',
      'cancer',
      'leo',
      'virgo',
      'sagittarius',
      'capricorn',
      'aquarius',
    ];

    let successfulRequests = 0;

    for (const sign of signArray) {
      const apiUrl = `https://apihoroverse.vercel.app/api/horoscope/${sign}`;
      try {
        const result: any = await this.http.get(apiUrl).toPromise();
        result.forEach((obj: any) => {
          const text = obj.text.replace(/<[^>]+>/g, ''); // remove html characters
          horoscopes[sign] = text;
        });

        successfulRequests++;

        // Vérifier si toutes les requêtes ont réussi
        if (successfulRequests === signArray.length) {
          // Effectuer la requête POST une fois que toutes les requêtes sont terminées
          await this.http
            .post('http://localhost:5400/savehoroscopes', { horoscopes })
            .toPromise();
        }
      } catch (error) {
        console.error(`Erreur pour le signe ${sign}:`, error);
      }
    }

    console.log(horoscopes);
    return horoscopes;
  }
}
