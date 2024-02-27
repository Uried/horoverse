import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'horoscopes'
})
export class HoroscopesPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
