import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent {
  expandedSection: string | null = null;

  toggleSection(section: string, event: Event): void {
    event.preventDefault();
    this.expandedSection = this.expandedSection === section ? null : section;
  }

  openContactModal(event: Event): void {
    event.preventDefault();
    // Emitir evento para que el navbar abra el modal
    window.dispatchEvent(new CustomEvent('openContactModal'));
  }
}
