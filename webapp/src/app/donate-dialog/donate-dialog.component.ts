import {Component, Inject, OnInit, Renderer, Renderer2} from '@angular/core';
import {DOCUMENT} from "@angular/platform-browser";
import {MatDialogRef} from "@angular/material";
import {ClipboardService} from "ngx-clipboard/dist";

@Component({
  selector: 'app-donate-dialog',
  templateUrl: './donate-dialog.component.html',
  styleUrls: ['./donate-dialog.component.css']
})
export class DonateDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DonateDialogComponent>,
              private clipboard: ClipboardService,
              private renderer: Renderer) {
  }

  ngOnInit() {
  }

  copyGehhilfe() {
    this.clipboard.copyFromContent("VsrYmjmGtTfV2p7ofyR2urXgrzm9yU9veA", this.renderer)
  }

  copyDev() {
    this.clipboard.copyFromContent("VpBsRnN749jYHE9hT8dZreznHfmFMdE1yG", this.renderer)
  }
}
