import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private enableLogging = environment.enableLogging;

  log(message: string, ...args: any[]): void {
    if (this.enableLogging) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.enableLogging) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.enableLogging) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: any, ...args: any[]): void {
    // Los errores siempre se muestran, pero con formato consistente
    console.error(`[ERROR] ${message}`, error, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (this.enableLogging && !environment.production) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

