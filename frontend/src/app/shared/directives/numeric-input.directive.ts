import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumericInput]',
  standalone: true
})
export class NumericInputDirective {
  @HostListener('keypress', ['$event'])
  onKeypress(event: KeyboardEvent): void {
    const char = String.fromCharCode(event.which);
    if (!/[0-9]/.test(char)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (!/^[0-9]*$/.test(pastedText)) {
      event.preventDefault();
    }
  }
}
