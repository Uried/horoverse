import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  private apiUrl = 'https://apihoroverse.vercel.app/publications/';

  constructor(private http: HttpClient) {}

  // Récupérer une publication par son idArch
  getPublicationById(id: string): Observable<any> {
    const add = '/byId/';
    const url = this.apiUrl + add + id;

    return this.http.get(url);
  }

  // Récupérer toutes les publications
  getAllPublications(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Récupérer tous les commentaires d'une publication
  getComments(publicationId: string): Observable<any> {
    const url = this.apiUrl + publicationId + '/comments';
    return this.http.get(url);
  }

  // Récupérer toutes les réponses d'un commentaire
  getResponses(publicationId: string, commentId: string): Observable<any> {
    const url =
      this.apiUrl + publicationId + '/comments/' + commentId + '/responses';
    return this.http.get(url);
  }

  // Ajouter un commentaire à une publication
  addComment(publicationId: string, comment: any): Observable<any> {
    const url = this.apiUrl + publicationId + '/comments';
    return this.http.post(url, comment);
  }

  // Supprimer un commentaire d'une publication
  deleteComment(publicationId: string, commentId: string): Observable<any> {
    const url = this.apiUrl + publicationId + '/comments/' + commentId;
    return this.http.delete(url);
  }

  // Ajouter une réponse à un commentaire
  addResponse(
    publicationId: string,
    commentId: string,
    response: any
  ): Observable<any> {
    const url =
      this.apiUrl + publicationId + '/comments/' + commentId + '/responses';
    return this.http.post(url, response);
  }

  // Supprimer une réponse d'un commentaire
  deleteResponse(
    publicationId: string,
    commentId: string,
    responseId: string
  ): Observable<any> {
    const url =
      this.apiUrl +
      publicationId +
      '/comments/' +
      commentId +
      '/responses/' +
      responseId;
    return this.http.delete(url);
  }

  // Ajouter une publication
  addPublication(publication: any): Observable<any> {
    return this.http.post(this.apiUrl, publication);
  }

  // Supprimer une publication par son id
  deletePublicationById(id: string): Observable<any> {
    const url = this.apiUrl + id;
    return this.http.delete(url);
  }
}
