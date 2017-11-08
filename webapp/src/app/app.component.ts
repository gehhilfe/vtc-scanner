import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material";
import {DonateDialogComponent} from "./donate-dialog/donate-dialog.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Vertcoin Scanner';

  constructor(private router: Router, private dialog: MatDialog) {
  };

  openPools() {
    this.router.navigate(['pools']);
  }

  openNodes() {
    this.router.navigate(['nodes']);
  }

  openMining() {
    this.router.navigate(['mining']);
  }

  openDonate() {
    this.dialog.open(DonateDialogComponent, {
      width: '600px'
    });
  }
}
