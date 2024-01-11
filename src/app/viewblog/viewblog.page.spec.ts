import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewblogPage } from './viewblog.page';

describe('ViewblogPage', () => {
  let component: ViewblogPage;
  let fixture: ComponentFixture<ViewblogPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ViewblogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
