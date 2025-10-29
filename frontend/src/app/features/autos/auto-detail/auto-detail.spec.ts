import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoDetailComponent } from './auto-detail'; // ✅ Importar desde './auto-detail'

describe('AutoDetailComponent', () => {
  let component: AutoDetailComponent;
  let fixture: ComponentFixture<AutoDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});