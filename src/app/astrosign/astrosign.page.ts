import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-astrosign',
  templateUrl: './astrosign.page.html',
  styleUrls: ['./astrosign.page.scss'],
})
export class AstrosignPage implements OnInit {
  constructor() {}

  ngOnInit() {}

  selectedDate!: string;
  astrologicalSign!: string;

  getAstrologicalSign() {
    const date = new Date(this.selectedDate);
    this.astrologicalSign = this.calculateAstrologicalSign(date);
  }

  calculateAstrologicalSign(date: Date): string {
   const month = date.getMonth() + 1; // Les mois sont indexés à partir de 0, donc on ajoute 1
  const day = date.getDate();

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return "Verseau";
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return "Poissons";
  } else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return "Bélier";
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return "Taureau";
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return "Gémeaux";
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return "Cancer";
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return "Lion";
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return "Vierge";
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return "Balance";
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return "Scorpion";
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return "Sagittaire";
  } else {
    return "Capricorne";
  }
}

}

