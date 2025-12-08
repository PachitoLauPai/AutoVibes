import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientProfileComponent } from './client-profile';
import { AuthService } from '../../../../core/services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

describe('ClientProfileComponent', () => {
  let component: ClientProfileComponent;
  let fixture: ComponentFixture<ClientProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'currentUser',
      'isLoggedIn',
      'isCliente',
      'getCurrentUserObservable',
      'actualizarPerfil',
      'cambiarContrasena'
    ]);

    mockAuthService.currentUser.and.returnValue({
      id: 1,
      nombre: 'Juan',
      email: 'juan@example.com',
      apellido: 'Perez',
      dni: '123456',
      telefono: '1234567890',
      direccion: 'Calle 1',
      activo: true,
      rol: { id: 1, nombre: 'CLIENTE', descripcion: 'Cliente', activa: true }
    });

    mockAuthService.getCurrentUserObservable.and.returnValue(of(null));
    mockAuthService.actualizarPerfil.and.returnValue(of({} as any));
    mockAuthService.cambiarContrasena.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ClientProfileComponent, CommonModule, ReactiveFormsModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load current user on init', () => {
    fixture.detectChanges();
    expect(component.currentUser).toBeTruthy();
  });

  it('should toggle edit mode', () => {
    fixture.detectChanges();
    expect(component.isEditingProfile).toBeFalse();
    component.toggleEditMode();
    expect(component.isEditingProfile).toBeTrue();
  });

  it('should toggle password mode', () => {
    fixture.detectChanges();
    expect(component.isChangingPassword).toBeFalse();
    component.togglePasswordMode();
    expect(component.isChangingPassword).toBeTrue();
  });
});
