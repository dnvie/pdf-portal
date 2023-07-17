import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfSearchResultsComponent } from './pdf-search-results.component';

describe('PdfTagResultsComponent', () => {
  let component: PdfSearchResultsComponent;
  let fixture: ComponentFixture<PdfSearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfSearchResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
