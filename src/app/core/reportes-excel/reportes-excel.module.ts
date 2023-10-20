import { NgModule } from '@angular/core';
import { RpDashboardComponent } from './components/rp-dashboard/rp-dashboard.component';
import { RpReporteComponent } from './components/rp-reporte/rp-reporte.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppMaterialModule } from 'src/app/app-material.module';
import { MastersModule } from 'src/app/masters/masters.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActasRegistralesModule } from '../actas-registrales/actas-registrales.module';
import { GestionSolicitudesRoutingModule } from '../gestion-solicitudes/gestion-solicitudes-routing.module';

@NgModule({
  imports: [
    CommonModule,
    GestionSolicitudesRoutingModule,
    ReactiveFormsModule,
    AppMaterialModule,
    NgxSpinnerModule,
    SharedModule,
    MastersModule,
    ActasRegistralesModule,
  ],
  exports: [],
  declarations: [RpDashboardComponent, RpReporteComponent],
})
export class ReportesExcelModule {}
