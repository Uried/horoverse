import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OthersignPage } from './othersign.page';

describe('OthersignPage', () => {
  let component: OthersignPage;
  let fixture: ComponentFixture<OthersignPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(OthersignPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
