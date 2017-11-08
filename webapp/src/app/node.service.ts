import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {LatLng} from "@agm/core";

export interface NodeDto extends LatLng {
  _id: string,
  userAgent: string,
  location: {
    type: string,
    coordinates: number[]
  }
}

@Injectable()
export class NodeService {

  constructor(private http: HttpClient) {
  }

  private apiUrl = 'api/nodes/';

  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  listNodes() {
    return this.http
      .get<NodeDto[]>(this.apiUrl, {
        headers: this.headers
      });
  }
}
