import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {StatsDto, StatsService} from "../stats.service";
import {BaseChartDirective} from "ng2-charts";
import {DateFormatPipe, MomentModule} from "angular2-moment";

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  _unit: string;
  data: StatsDto[];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  private _type = '';
  public lineChartData: Array<any> = [{data: [], label: 'label'}];
  public lineChartLabels: Array<any> = [];
  public lineChartOptions: any = {
    responsive: true
  };
  public lineChartColors: Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }];
  public lineChartLegend: boolean = false;
  public lineChartType: string = 'line';
  private _scale: number;

  public high = 0;
  public low = 0;
  public average = 0;

  @Input()
  set type(type: string) {
    this._type = type;
  }

  get type(): string {
    return this._type;
  }

  @Input()
  set scale(scale: number) {
    this._scale = scale;
    //this.type = this._type;
  }

  get(scale: number) {
    return this._scale;
  }

  @Input()
  set unit(unit: string) {
    this._unit = unit;
  }

  get unit() {
    return this._unit;
  }

  constructor(private statsService: StatsService) {
  }

  ngOnInit() {
    this.statsService.getStats(this.type).subscribe((res) => {
      this.data = res;
      this.lineChartLabels = res.map((it) => new DateFormatPipe().transform(it.date, 'LT'));
      this.chart.chart.config.data.labels = this.lineChartLabels;
      this.lineChartData = [{
        data: res.map((it) => it.value / this._scale),
        label: this.type
      }];

      this.high = Math.round(this.lineChartData[0].data.reduce((acc, it) => Math.max(acc, it)));
      this.low = Math.round(this.lineChartData[0].data.reduce((acc, it) => Math.min(acc, it)));
      this.average = Math.round(this.lineChartData[0].data.reduce((acc, it) => acc + it)/this.lineChartData[0].data.length);
    })
  }

  timeScale(event: Event) {
    console.log(event);
  }
}
