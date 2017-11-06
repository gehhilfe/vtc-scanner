import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {
  MatButtonModule, MatIconModule, MatPaginatorModule, MatTableModule, MatToolbarModule, MatInputModule,
  MatFormFieldModule, MatListModule, MatProgressBarModule, MatSlideToggleModule, MatExpansionModule, MatSortModule,
  MatTabsModule, MatButtonToggleModule
} from "@angular/material";
import {PoolTableComponent} from './pool-table/pool-table.component';
import {FlexLayoutModule} from "@angular/flex-layout";
import {AddPoolFormComponent} from './add-pool-form/add-pool-form.component';
import {HttpClientModule} from "@angular/common/http";
import {PoolService} from "./pool.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HashRatePipe} from './hash-rate.pipe';
import {UptimePipe} from './uptime.pipe';
import {MomentModule} from "angular2-moment";
import {TimesPipe} from './times.pipe';
import {ChartComponent} from './chart/chart.component';
import {StatsService} from "./stats.service";
import {ChartsModule} from "ng2-charts";
import {PoolComponent} from './pool/pool.component';
import {RouterModule, Routes} from "@angular/router";

const appRoutes: Routes = [
  {
    path: '',
    component: PoolComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    PoolTableComponent,
    AddPoolFormComponent,
    HashRatePipe,
    UptimePipe,
    TimesPipe,
    ChartComponent,
    PoolComponent
  ],
  imports: [
    MomentModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatListModule,
    BrowserModule,
    MatListModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonToggleModule,
    FormsModule,
    MatExpansionModule,
    MatSortModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    ChartsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    PoolService,
    StatsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
