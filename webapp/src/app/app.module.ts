import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {
  MatButtonModule, MatIconModule, MatPaginatorModule, MatTableModule, MatToolbarModule, MatInputModule,
  MatFormFieldModule, MatListModule, MatProgressBarModule, MatSlideToggleModule, MatExpansionModule, MatSortModule,
  MatTabsModule, MatButtonToggleModule, MatCardModule, MatDialogModule, MatProgressSpinnerModule, MatStepperModule,
  MatIconRegistry
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
import {MiningComponent} from './mining/mining.component';
import {NodeComponent} from './node/node.component';
import {AgmCoreModule, GoogleMapsAPIWrapper} from '@agm/core';
import {NodeService} from "./node.service";
import {AgmJsMarkerClustererModule, ClusterManager} from '@agm/js-marker-clusterer';
import { DonateDialogComponent } from './donate-dialog/donate-dialog.component';
import {ClipboardModule} from "ngx-clipboard/dist";
import {HttpModule} from "@angular/http";
const appRoutes: Routes = [
  {
    path: 'pools',
    component: PoolComponent
  },
  {
    path: 'mining',
    component: MiningComponent
  },
  {
    path: 'nodes',
    component: NodeComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/pools'
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
    PoolComponent,
    MiningComponent,
    NodeComponent,
    DonateDialogComponent
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBPnvee1X_h5dmYlQLj77rb6evHQC8NxRQ'
    }),
    AgmJsMarkerClustererModule,
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
    HttpModule,
    MatSortModule,
    MatCardModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    ChartsModule,
    MatDialogModule,
    ClipboardModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    RouterModule.forRoot(appRoutes)
  ],
  entryComponents: [
    DonateDialogComponent
  ],
  providers: [
    PoolService,
    StatsService,
    NodeService,
    ClusterManager,
    GoogleMapsAPIWrapper
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
