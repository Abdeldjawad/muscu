import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'getMaintenanceCalories',
  standalone: true
})
export class GetMaintenanceCalories implements PipeTransform {

  transform(value: any): number {
    switch (value.sexe) {
      case 'male':
        return 66 + (13.7 * value.poids) + (5 * value.taille) - (6.5 * value.age);
      case 'female':
        return 655 + (9.6 * value.poids) + (1.8 * value.taille) - (4.7 * value.age);
      default:
        return 0;
    }
  }

}
