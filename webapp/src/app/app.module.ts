import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {
  MatButtonModule, MatIconModule, MatPaginatorModule, MatTableModule, MatToolbarModule, MatInputModule,
  MatFormFieldModule, MatListModule, MatProgressBarModule, MatSlideToggleModule, MatExpansionModule, MatSortModule
} from "@angular/material";
import { PoolTableComponent } from './pool-table/pool-table.component';
import {FlexLayoutModule} from "@angular/flex-layout";
import { AddPoolFormComponent } from './add-pool-form/add-pool-form.component';
import {HttpClientModule} from "@angular/common/http";
import {PoolService} from "./pool.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { HashRatePipe } from './hash-rate.pipe';
import { UptimePipe } from './uptime.pipe';
import {MomentModule} from "angular2-moment";

@NgModule({
  declarations: [
    AppComponent,
    PoolTableComponent,
    AddPoolFormComponent,
    HashRatePipe,
    UptimePipe
  ],
  imports: [
    MomentModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    BrowserModule,
    MatListModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatExpansionModule,
    MatSortModule,
    MatSlideToggleModule,
    ReactiveFormsModule
  ],
  providers: [
    PoolService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
