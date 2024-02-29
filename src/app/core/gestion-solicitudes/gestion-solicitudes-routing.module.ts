import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GsBusquedaComponent } from './components/gs-busqueda/gs-busqueda.component';
import { GsDashboardComponent } from './components/gs-dashboard/gs-dashboard.component';
import { GuardianUserInternalGuard } from '../../shared/guards/guardian-user-internal.guard';
import { GsAtencionComponent } from './components/gs-atencion/gs-atencion.component';
import { GsEdicionFirma2Component } from './components/gs-edicion-firma/gs-edicion-firma.component';
import { GsEdicionLibroComponent } from './components/gs-edicion-libro/gs-edicion-libro.component';

const routes: Routes = [
  {
    path: '',
    component: GsDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'busqueda',
        pathMatch: 'full',
      },
      {
        path: 'busqueda',
        component: GsBusquedaComponent,
        canActivate: [GuardianUserInternalGuard],
      },
      {
        path: 'atencion/:id',
        component: GsAtencionComponent,
        canActivate: [GuardianUserInternalGuard],
      },
      {
        path: 'edicion-firma/:id',
        component: GsEdicionFirma2Component,
        canActivate: [GuardianUserInternalGuard],
      },
      {
        path: 'edicion-libro/:id',
        component: GsEdicionLibroComponent,
        canActivate: [GuardianUserInternalGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionSolicitudesRoutingModule {}
