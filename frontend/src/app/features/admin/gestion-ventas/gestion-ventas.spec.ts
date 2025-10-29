import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionVentas } from './gestion-ventas';

describe('GestionVentas', () => {
  let component: GestionVentas;
  let fixture: ComponentFixture<GestionVentas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionVentas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionVentas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
