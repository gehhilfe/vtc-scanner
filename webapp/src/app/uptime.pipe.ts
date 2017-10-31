import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uptime'
})
export class UptimePipe implements PipeTransform {

  transform(value: Date): any {
    const now = new Date();
    let diff = now.getTime() - new Date(value).getTime();
    return diff;
  }

}
