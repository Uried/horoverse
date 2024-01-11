import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArchivesPage } from './archives.page';

describe('ArchivesPage', () => {
  let component: ArchivesPage;
  let fixture: ComponentFixture<ArchivesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ArchivesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
