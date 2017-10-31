import { Component, OnInit } from '@angular/core';
import {PoolService} from "../pool.service";
import {FormControl, Validators} from "@angular/forms";

const IP_DOMAIN_PORT_REGEX = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9]):([0-9]{1,5})|[a-z0-9]+([\-\.][a-z0-9]+)*\.[a-z]{2,6}:([0-9]{1,5})$/;

@Component({
  selector: 'app-add-pool-form',
  templateUrl: './add-pool-form.component.html',
  styleUrls: ['./add-pool-form.component.css']
})
export class AddPoolFormComponent implements OnInit {

  ipFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(IP_DOMAIN_PORT_REGEX)
  ]);

  bussy = false;

  constructor(
    private poolService: PoolService
  ) { }

  ngOnInit() {
  }

  addPool() {
    this.bussy = true;
    this.poolService.addPool(this.ipFormControl.value).subscribe(
      (res) => {
        this.bussy = false;
      }, (err) => {
        this.bussy = false;
      }
    );
  }
}
