import { Component, OnInit } from '@angular/core';
import { SeguridadService } from 'src/app/shared/services/seguridad.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-libro-dashboard',
  templateUrl: './libro-dashboard.component.html',
  styleUrls: ['./libro-dashboard.component.scss'],
})
export class LibroDashboardComponent implements OnInit {
  environment: any;
  title!: string;

  constructor(private seguridadService: SeguridadService) {}

  ngOnInit(): void {
    this.environment = environment;
    if (this.isExternal) {
      this.title = 'Libro de Actas Registrales';
    }
    if (this.isInternal) {
      this.title = 'Libro de Actas Registrales Manuales';
    }
  }

  get isExternal(): boolean {
    return !this.seguridadService.getUserInternal();
  }

  get isInternal(): boolean {
    return this.seguridadService.getUserInternal();
  }
}
