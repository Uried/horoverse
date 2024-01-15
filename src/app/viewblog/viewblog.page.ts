import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { BlogService } from '../blog.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-viewblog',
  templateUrl: './viewblog.page.html',
  styleUrls: ['./viewblog.page.scss'],
})
export class ViewblogPage implements OnInit {
  browserLanguage!: string;
  title!: string
  content!: string
  image!: string
  idBlog: string = localStorage.getItem("idBlog") || ""
  blog!: any[];

  constructor(private translateService: TranslateService,
    private router : Router,
    private blogService: BlogService,
    private http: HttpClient) {

      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          this.getBlog(this.idBlog);
        });
    }

  ngOnInit() {
    this.translateService.setDefaultLang('fr');

    const browserLang = navigator.language;

    this.browserLanguage = browserLang!;
    if (this.browserLanguage == 'fr-FR') {

    }

    this.getBlog(this.idBlog)
  }

  getBlog(id: string){
    this.idBlog = localStorage.getItem('idBlog')!
    console.log(this.idBlog);

    this.blogService.getBlogById(this.idBlog).subscribe(
      (blog: any) => {
        // Utilisez les données du blog ici
        console.log(blog);
        this.title = blog.title
        this.image = blog.image
        this.content = blog.content
      },
      (error) => {
        console.log(error);
      }
    );
  }


 
}
