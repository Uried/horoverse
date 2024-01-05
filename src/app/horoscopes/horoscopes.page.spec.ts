import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HoroscopesPage } from './horoscopes.page';

describe('HoroscopesPage', () => {
  let component: HoroscopesPage;
  let fixture: ComponentFixture<HoroscopesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HoroscopesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
