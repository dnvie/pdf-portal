import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfEditComponent } from './pdf-edit.component';

describe('PdfEditComponent', () => {
  let component: PdfEditComponent;
  let fixture: ComponentFixture<PdfEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
