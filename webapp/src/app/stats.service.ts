import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs/Observable";

export interface StatsDto {
  type: string,
  date: Date,
  value: number
}

@Injectable()
export class StatsService {

  constructor(private http: HttpClient) {
  }

  private apiUrl = 'api/stats/';

  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  getStats(type: string): Observable<StatsDto[]> {
    return this.http
      .get<StatsDto[]>(this.apiUrl + type, {headers: this.headers});
  }
}
