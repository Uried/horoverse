import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class HoroscopeService {
  constructor(private http: HttpClient) {}

  getMonthlyHoroscope(sign: string) {
    const url = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/monthly?sign=${sign}`;

    // Ajoutez les en-têtes appropriés pour autoriser les requêtes CORS
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Autorise toutes les origines, vous pouvez spécifier des domaines spécifiques ici
    });

    // Utilisez les en-têtes dans votre requête
    return this.http.get(url, { headers });
  }
}
