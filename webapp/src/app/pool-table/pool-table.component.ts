import {Component, OnInit, ViewChild} from '@angular/core';
import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";
import {MatPaginator, MatSort, PageEvent, Sort} from "@angular/material";
import {PoolService} from "../pool.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";


@Component({
  selector: 'app-pool-table',
  templateUrl: './pool-table.component.html',
  styleUrls: ['./pool-table.component.css']
})
export class PoolTableComponent implements OnInit {

  displayedColumns = ['score', 'country', 'ip', 'fee', 'active_miners', 'hash_rate', 'ping', 'uptime'];
  dataSource = new PoolDataSource();

  lastSort: Sort = {
    active: "fee",
    direction: ""
  };

  lastPage: PageEvent = {
    length: 0,
    pageSize: 5,
    pageIndex: 0
  };

  bussy = false;
  numberOfEntries: number;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private poolService: PoolService) {
  }

  ngOnInit() {
    this.poolService.listPools(
      {
        pageSize: 5,
        pageIndex: 0,
        length: 5
      }, this.lastSort).subscribe(
      (res) => {
        this.numberOfEntries = res.length;
        this.dataSource.setData(res.result);
        this.bussy = false;
      },
      (err) => {
        this.bussy = false;
      }
    );
    this.sort.sortChange.subscribe((it) => {
      this.lastSort = it;
      this.paginator.pageIndex = 0;
      this.changePage({
        pageSize: this.lastPage.pageSize,
        pageIndex: 0,
        length: 0
      })
    })
  }

  changePage(event: PageEvent) {
    // Page index change
    this.bussy = true;
    this.lastPage = event;
    this.poolService.listPools(event, this.lastSort).subscribe(
      (res) => {
        this.numberOfEntries = res.length;
        this.dataSource.setData(res.result);
        this.bussy = false;
      },
      (err) => {
        this.bussy = false;
      }
    );
  }
}


export interface PoolEntry {
  country: string,
  ip: string,
  fee: number
}

class PoolDataSource extends DataSource<any> {
  data: Subject<any> = new Subject();

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.data.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
  }

  setData(result) {
    this.data.next(result);
  }
}
