import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner-overlay',
  template: `
    <div class="spinner-overlay">
      <mat-spinner></mat-spinner>
    </div>
  `,
  styleUrls: ['./spinner-overlay.component.css']
})
export class SpinnerOverlayComponent {} 