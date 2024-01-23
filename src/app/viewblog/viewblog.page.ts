import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { BlogService } from '../blog.service';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-viewblog',
  templateUrl: './viewblog.page.html',
  styleUrls: ['./viewblog.page.scss'],
})
export class ViewblogPage implements OnInit {
  browserLanguage!: string;
  title!: string;
  content!: string;
  image!: string;
  idBlog: string = localStorage.getItem('idBlog') || '';
  blog!: any[];
  ipAddress!: string;

  constructor(
    private translateService: TranslateService,
    private router: Router,
    private blogService: BlogService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.getBlog();
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

    const browserLang = navigator.language;

    this.browserLanguage = browserLang!;
    if (this.browserLanguage == 'fr-FR') {
    }

    this.getBlog();
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 2000,
    });

    loading.present();
    return () => loading.dismiss();
  }

  async getBlog() {
     const dismissLoading = await this.showLoading();
    const idBlog = this.route.snapshot.paramMap.get('id')!;
    this.idBlog = idBlog;
    this.blogService.getBlogById(idBlog).subscribe(
      (blog: any) => {
        // Utilisez les données du blog ici
        this.title = blog.title;
        this.image = blog.image;
        this.content = blog.content;
        dismissLoading()
      },
      (error) => {
        dismissLoading()
        console.log(error);
        const log = {
          level: 'error',
          message: 'Erreur lors de laffichage du blog' + error,
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
    );
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
