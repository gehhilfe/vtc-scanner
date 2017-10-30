import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {
  MatButtonModule, MatIconModule, MatPaginatorModule, MatTableModule, MatToolbarModule, MatInputModule,
  MatFormFieldModule, MatListModule
} from "@angular/material";
import { PoolTableComponent } from './pool-table/pool-table.component';
import {FlexLayoutModule} from "@angular/flex-layout";
import { AddPoolFormComponent } from './add-pool-form/add-pool-form.component';
import {HttpClientModule} from "@angular/common/http";
import {PoolService} from "./pool.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    PoolTableComponent,
    AddPoolFormComponent
  ],
  imports: [
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule,
    BrowserModule,
    MatListModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    PoolService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
