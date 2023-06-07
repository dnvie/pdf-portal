import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfOverviewComponent } from './pdf-overview.component';

describe('PdfOverviewComponent', () => {
  let component: PdfOverviewComponent;
  let fixture: ComponentFixture<PdfOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
