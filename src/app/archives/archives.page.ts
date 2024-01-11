import { Component, OnInit } from '@angular/core';
import { PublicationService } from '../sevices/publication/publication.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
@Component({
  selector: 'app-archives',
  templateUrl: './archives.page.html',
  styleUrls: ['./archives.page.scss'],
})
export class ArchivesPage implements OnInit{
  publications: [] = []
  sign: string = localStorage.getItem("sign") || ""
  constructor(private publicationService: PublicationService, private router: Router) {

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.getAllPublications()
      });
   }

  ngOnInit() {
    this.getAllPublications()


  }

  getAllPublications(){
    try {
      this.publicationService.getAllPublications().subscribe((publications:any) => {
        this.publications = publications
        console.log(this.publications);
        publications.forEach((publication:any) => {
          console.log(publication[this.sign]);

        })

      })
    } catch (error) {
      console.log(error);

    }
  }

  showComments(){
    this.router.navigateByUrl('/comment')
  }

}
