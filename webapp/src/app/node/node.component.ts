import {Component, OnInit, ViewChild} from '@angular/core';
import {AgmMap, GoogleMapsAPIWrapper} from '@agm/core';
import {LatLngBounds, LatLngBoundsLiteral, MapTypeStyle, LatLng} from '@agm/core';
import {NodeDto, NodeService} from "../node.service";

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.css']
})
export class NodeComponent implements OnInit {

  lat: number;
  lng: number;

  nodes: NodeDto[];
  @ViewChild(AgmMap) map: AgmMap;

  constructor(
    private nodeService: NodeService,
    private mapApi: GoogleMapsAPIWrapper
  ) { }

  ngOnInit() {
    this.nodeService.listNodes().subscribe((res) => {
      this.nodes = res;
    });
  }

}
