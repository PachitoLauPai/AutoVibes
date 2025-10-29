import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

// Para clase interceptor, NO uses withInterceptors
// En su lugar, usa provideHttpClient sin withInterceptors
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // El interceptor de clase se registra automáticamente si está en providers
  ]
};