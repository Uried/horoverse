import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AstrosignPage } from './astrosign.page';

describe('AstrosignPage', () => {
  let component: AstrosignPage;
  let fixture: ComponentFixture<AstrosignPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AstrosignPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
