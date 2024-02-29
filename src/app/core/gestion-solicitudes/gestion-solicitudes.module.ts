import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestionSolicitudesRoutingModule } from './gestion-solicitudes-routing.module';
import { GsBusquedaComponent } from './components/gs-busqueda/gs-busqueda.component';
import { GsDashboardComponent } from './components/gs-dashboard/gs-dashboard.component';
import {SharedModule} from "../../shared/shared.module";
import {ReactiveFormsModule} from "@angular/forms";
import {AppMaterialModule} from "../../app-material.module";
import {NgxSpinnerModule} from "ngx-spinner";
import {MastersModule} from "../../masters/masters.module";
import { GsAnalistaComponent } from './components/gs-analista/gs-analista.component';
import { GsDetalleComponent } from './components/gs-detalle/gs-detalle.component';
import { GsDetalleFilesComponent } from './components/gs-detalle-files/gs-detalle-files.component';
import { GsAtencionComponent } from './components/gs-atencion/gs-atencion.component';
import { GsEdicionFirma2Component } from './components/gs-edicion-firma/gs-edicion-firma.component';
import { GsEdicionLibroComponent } from './components/gs-edicion-libro/gs-edicion-libro.component';
import {ActasRegistralesModule} from "../actas-registrales/actas-registrales.module";
import { GsReasignarComponent } from './components/gs-reasignar/gs-reasignar.component';
import { GsModificarComponent } from './components/gs-modificar/gs-modificar.component';
import { GsEditarSolicitudComponent } from './components/gs-editar-solicitud/gs-editar-solicitud.component';
import { FirmasModule } from '../firmas/firmas.module';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';

@NgModule({
  declarations: [
    GsBusquedaComponent,
    GsDashboardComponent,
    GsAnalistaComponent,
    GsDetalleComponent,
    GsDetalleFilesComponent,
    GsAtencionComponent,
    GsEdicionFirma2Component,
    GsReasignarComponent,
    GsModificarComponent,
    GsEditarSolicitudComponent,
    GsEdicionLibroComponent,
    ConfirmationModalComponent,
  ],
  imports: [
    CommonModule,
    GestionSolicitudesRoutingModule,
    ReactiveFormsModule,
    AppMaterialModule,
    NgxSpinnerModule,
    SharedModule,
    MastersModule,
    ActasRegistralesModule,
    FirmasModule
  ],
  exports: [
    GsAnalistaComponent
  ]
})
export class GestionSolicitudesModule { }
