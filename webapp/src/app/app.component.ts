import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog, MatIconRegistry} from "@angular/material";
import {DonateDialogComponent} from "./donate-dialog/donate-dialog.component";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Vertcoin Scanner';

  constructor(private router: Router, private dialog: MatDialog,
              private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    this.iconRegistry.addSvgIcon('discord',
      sanitizer.bypassSecurityTrustResourceUrl('/assets/discord.svg'));
    this.iconRegistry.addSvgIcon('donate',
      sanitizer.bypassSecurityTrustResourceUrl('/assets/donate.svg'));
    this.iconRegistry.addSvgIcon('reddit',
      sanitizer.bypassSecurityTrustResourceUrl('/assets/reddit.svg'));
    this.iconRegistry.addSvgIcon('github',
      sanitizer.bypassSecurityTrustResourceUrl('/assets/github.svg'));
    this.iconRegistry.addSvgIcon('star',
      sanitizer.bypassSecurityTrustResourceUrl('/assets/star.svg'));
    this.iconRegistry.addSvgIcon('content_copy',
      sanitizer.bypassSecurityTrustResourceUrl('/assets/content_copy.svg'));
    this.iconRegistry.addSvgIcon('menu',
      sanitizer.bypassSecurityTrustResourceUrl('/assets/menu.svg'));
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
    this.dialog.open(DonateDialogComponent);
  }

  openLink(url: string) {
    window.location.href = url;
  }
}
