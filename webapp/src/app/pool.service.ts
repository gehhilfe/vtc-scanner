import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/delay";
import {PageEvent, Sort} from "@angular/material";

export interface PoolDto {
  id: string,
  errCounter: number,
  version: string,
  fee: number,
  country: string,
  loc: number[],
  uptime: number
}

export interface PaginatedPoolDto {
  result: PoolDto[],
  length: number
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
  }

  listPools(page: PageEvent, sort: Sort) {
    let httpParams = new HttpParams()
      .set('pageIndex', page.pageIndex.toString())
      .set('pageSize', page.pageSize.toString());

    if(sort.active === "fee") {
      if(sort.direction === "asc")
        httpParams = httpParams.set("sortfee", "1");
      if(sort.direction === "desc")
        httpParams = httpParams.set("sortfee", "-1");
    }

    return this.http
      .get<PaginatedPoolDto>(this.apiUrl, {
        headers: this.headers,
        params: httpParams
      })
  }
}
