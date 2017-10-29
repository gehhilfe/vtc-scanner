import { Component, OnInit } from '@angular/core';
import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";


@Component({
  selector: 'app-pool-table',
  templateUrl: './pool-table.component.html',
  styleUrls: ['./pool-table.component.css']
})
export class PoolTableComponent implements OnInit {

  displayedColumns = ['country', 'fee', 'ip'];
  dataSource = new PoolDataSource();

  constructor() { }

  ngOnInit() {
  }

}


export interface PoolEntry {
  country: string,
  ip: string,
  fee: number
}

const data: PoolEntry[] = [
  {country: 'de', ip: '192.168.2.1:9171', fee: 0.25},
  {country: 'uk', ip: '192.168.2.1:9171', fee: 0.25},
  {country: 'us', ip: '192.168.2.1:9171', fee: 0.25},
  {country: 'uk', ip: '192.168.2.1:9171', fee: 0.25},
  {country: 'hk', ip: '192.168.2.1:9171', fee: 0.25},
  {country: 'ch', ip: '192.168.2.1:9171', fee: 0.25},
  {country: 'jp', ip: '192.168.2.1:9171', fee: 0.25},
]

class PoolDataSource extends DataSource<any> {
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return Observable.of(data);
  }

  disconnect(collectionViewer: CollectionViewer): void {
    throw new Error("Method not implemented.");
  }
}
