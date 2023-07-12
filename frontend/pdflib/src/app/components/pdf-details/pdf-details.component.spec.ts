import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfDetailsComponent } from './pdf-details.component';

describe('PdfDetailsComponent', () => {
  let component: PdfDetailsComponent;
  let fixture: ComponentFixture<PdfDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
