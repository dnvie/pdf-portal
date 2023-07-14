import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfTagResultsComponent } from './pdf-tag-results.component';

describe('PdfTagResultsComponent', () => {
  let component: PdfTagResultsComponent;
  let fixture: ComponentFixture<PdfTagResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfTagResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfTagResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
