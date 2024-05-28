import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Webpage } from './webpage';
import { Page } from './page';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root' // This provides the service globally in the application
})
export class WebpageService {

  private webpagesUrl = 'http://localhost:3066/webpages';
  private webpageUrl = 'http://localhost:3066/detail';
  //private webpagesUrl = 'http://appserver-01.alunos.di.fc.ul.pt:3066/webpages';
  //private webpageUrl = 'http://appserver-01.alunos.di.fc.ul.pt:3066/detail'; // alterar para funcionar no dos stores

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  initiateEvaluation(webpageId: string): Observable<any> {
    const url = `${this.webpagesUrl}/${webpageId}`;
    return this.http.post<any>(url, {}).pipe(
      tap(_ => this.log(`Initiated evaluation for webpage id=${webpageId}`)),
      catchError(this.handleError<any>('initiateEvaluation'))
    );
  }

  /** GET webpages from the server */
  getWebpages(): Observable<Webpage[]> {
    return this.http.get<Webpage[]>(this.webpagesUrl)
      .pipe(
        tap(_ => this.log('fetched webpages')),
        catchError(this.handleError<Webpage[]>('getWebpages', []))
      );
  }

  getWebpage(id: string): Observable<Webpage> {
    const url = `${this.webpageUrl}/${id}`;
    return this.http.get<Webpage>(url).pipe(
      tap(_ => this.log(`fetched webpage id=${id}`)),
      catchError(this.handleError<Webpage>(`getWebpage id=${id}`))
    );
  }

  getWebpageById(id: string): Observable<Webpage> {
    // Return an Observable that fetches the webpage data by ID
    return this.http.get<Webpage>(`${this.webpageUrl}/webpages/${id}`);
  }

  getWebpagePages(webpageId: string): Observable<Page[]> {
    const url = `${this.webpageUrl}/${webpageId}/pages`;
    return this.http.get<Page[]>(url).pipe(
      tap(_ => this.log(`fetched pages for webpage id=${webpageId}`)),
      catchError(this.handleError<Page[]>(`getWebpagePages id=${webpageId}`, []))
    );
  }

  // Method to get sorted webpages by last evaluation time in ascending order
  getWebpagesSortedByEvaluationAsc(): Observable<Webpage[]> {
    return this.http.get<Webpage[]>('http://localhost:3066/webpages/sorted_evaluation_asc');
  }

  // Method to get sorted webpages by registration time in ascending order
  getWebpagesSortedByRegisteredAsc(): Observable<Webpage[]> {
    return this.http.get<Webpage[]>('http://localhost:3066/webpages/sorted_registered_asc');
  }

  // Method to get sorted webpages by last evaluation time in descending order
  getWebpagesSortedByEvaluationDesc(): Observable<Webpage[]> {
    return this.http.get<Webpage[]>('http://localhost:3066/webpages/sorted_evaluation_desc');
  }

  // Method to get sorted webpages by registration time in descending order
  getWebpagesSortedByRegisteredDesc(): Observable<Webpage[]> {
    return this.http.get<Webpage[]>('http://localhost:3066/webpages/sorted_registered_desc');
  }

  // Method to get webpages filtered by monitoring status
  getWebpagesByStatus(status: string): Observable<Webpage[]> {
    return this.http.get<Webpage[]>(`/webpages/status/${status}`);
  }

  /** POST: add a new webpage to the server */
  addWebpage(webpage: Webpage): Observable<Webpage> {
    webpage.status = 'Por avaliar';
    return this.http.post<Webpage>(this.webpagesUrl, webpage, this.httpOptions).pipe(
      tap((newWebpage: Webpage) => this.log(`added webpage w/ id=${newWebpage._id}`)),
      catchError(this.handleError<Webpage>('addWebpage'))
    );
  }

  addPage(webpageId: string, url: string): Observable<any> {
    return this.http.post<any>(`${this.webpageUrl}/${webpageId}`, { url });
  }

  deleteWebpage(webpageId: string): Observable<any> {
    const url = `${this.webpagesUrl}/${webpageId}`;
    return this.http.delete<any>(url);
  }

  deletePage(webpageId: string, pageId: string): Observable<any> {
    const url = `${this.webpageUrl}/${webpageId}/${pageId}`;
    return this.http.delete<any>(url);
  }

  generateReport(webpageId: string, pageId: string): Observable<any> {
    const url = `${this.webpageUrl}${webpageId}/${pageId}/report`; // URL for generateReport
    return this.http.get<any>(url); // Make the GET request to generate the report
  }

  evaluateWebpage(webpageId: string, pageIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.webpageUrl}/${webpageId}/report`, { pageIds });
  }

  // Method to get the report for a specific webpage ID
  getReport(webpageId: string): Observable<any> {
    const url = `${this.webpageUrl}/${webpageId}/getReport`; // URL for getReport
    return this.http.get<any>(url); // Make the GET request to retrieve the report
  }

  generateFile(webpageId: string, reportType: string): Observable<any> {
    return this.http.post(`${this.webpageUrl}/${webpageId}/generateFile/${reportType}`, {}, {
      responseType: 'blob' // Set the responseType to 'blob'
    });
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  /** Log a WebpageService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`WebpageService: ${message}`);
  }
}
