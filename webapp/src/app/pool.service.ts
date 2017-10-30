import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import {Observable} from "rxjs/Observable";

export interface PoolDto {
  id: string,
  errCounter: number,
  version: string,
  fee: number,
  location: string,
  uptime: number
}

@Injectable()
export class PoolService {
  constructor(private http: HttpClient) {
  }

  private apiUrl = 'api/pools/';

  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  addPool(ip: String): Observable<PoolDto> {
    return this.http
      .post<PoolDto>(this.apiUrl, JSON.stringify({ip: ip}), {headers: this.headers})
      .do(console.log)
  }
}
