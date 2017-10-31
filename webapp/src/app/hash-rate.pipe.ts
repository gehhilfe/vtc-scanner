import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hashRate'
})
export class HashRatePipe implements PipeTransform {

  transform(value: number) {
    let suffixes = ['Hs', 'KHs', 'MHs', 'GHs', 'THs', 'PHs'];
    let newValue = value;
    let _div: number;
    for(_div = 0; _div < suffixes.length && newValue > 1000; _div++) {
      newValue /= 1000;
    }
    newValue = Math.floor(newValue);
    return newValue+" "+suffixes[_div];
  }
}
