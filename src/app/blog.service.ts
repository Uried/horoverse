import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(private http: HttpClient) {}

  apiUrl = 'http://localhost:5900/blogs/';

  getBlogById(id: string): Observable<any> {
    const _id = id;
    return this.http.get(`${this.apiUrl}${_id}`);
  }
}
