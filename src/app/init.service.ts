import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InitService {

  private apiUrl = 'http://localhost:3066/init'; // Adjust this URL according to your backend configuration

  constructor(private http: HttpClient) { }

  initializeDatabase(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
