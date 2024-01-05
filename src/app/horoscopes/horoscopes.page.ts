import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { franc } from 'franc-min';
import axios from 'axios';
@Component({
  selector: 'app-horoscopes',
  templateUrl: './horoscopes.page.html',
  styleUrls: ['./horoscopes.page.scss'],
})
export class HoroscopesPage implements OnInit {
  constructor(
    private http: HttpClient,
    private translateService: TranslateService
  ) {
    this.onImageChange();
  }

  ngOnInit() {
    this.translateService.setDefaultLang('fr');

    const browserLang = navigator.language;

    this.browserLanguage = browserLang!;
    if (this.browserLanguage == 'fr-FR') {
      this.translateToFrench();
      this.translateHoroscope(); // Appeler translateHoroscope() ici
    }
    this.getHoroscopeBySunSign();
    this.onImageChange();
  }
  browserLanguage!: string;
  home: string = 'Home';
  news: string = 'News';
  others: string = 'Others';
  guidePhrase: string = 'Select an astrological sign';
  public horoscope: string = '';
  public selectedSign: string = 'aries';
  public choosedImage: string = '';
  public sunsign: string = '';
  public signs: string[] = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
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

  async getHoroscopeBySunSign() {
    const apiUrl = `https://apihoroverse.vercel.app/api/horoscope/${this.selectedSign}`;
    try {
      this.http.get(apiUrl).subscribe((result: any) => {
        this.horoscope = result.horoscope;
        console.log(result);
        result.forEach((obj: any) => {
          const text = obj.text.replace(/<[^>]+>/g, ''); // remove html characters
          this.horoscope = text;
          this.onImageChange();
          this.onTranslate();
          if(this.browserLanguage == "fr-FR"){
            //this.translateHoroscope();
          }
        });
      });
    } catch (error) {
      console.error(error);
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

  onImageChange() {
    switch (this.selectedSign) {
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
    switch (this.selectedSign) {
      case 'aquarius':
        this.sunsign = 'Verseau';
        break;
      case 'pisces':
        this.sunsign = 'Poissons';
        break;
      case 'aries':
        this.sunsign = 'Bélier';
        break;
      case 'taurus':
        this.sunsign = 'Taureau';
        break;
      case 'gemini':
        this.sunsign = 'Gémeaux';
        break;
      case 'cancer':
        this.sunsign = 'Cancer';
        break;
      case 'leo':
        this.sunsign = 'Lion';
        break;
      case 'virgo':
        this.sunsign = 'Vierge';
        break;
      case 'libra':
        this.sunsign = 'Balance';
        break;
      case 'scorpio':
        this.sunsign = 'Scorpion';
        break;
      case 'sagittarius':
        this.sunsign = 'Sagittaire';
        break;
      case 'capricorn':
        this.sunsign = 'Capricorne';
        break;
      default:
        break;
    }
  }

  translateToFrench() {
    this.home = 'Acceuil';
    this.news = 'Infos';
    this.others = 'Others';
    this.guidePhrase = 'Sélectionnez un signe astrologique';
    this.onTranslate();
  }
}
