import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { BlogsPage } from './blogs.page';

describe('NewsPage', () => {
  let component: BlogsPage;
  let fixture: ComponentFixture<BlogsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(BlogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
