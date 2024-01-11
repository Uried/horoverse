import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(private http: HttpClient) {}

  apiUrl = 'https://apihoroverse.vercel.app/blogs/';

  getBlogById(id: string): Observable<any> {
    const _id = id;
    return this.http.get(`${this.apiUrl}${_id}`);
  }
}
