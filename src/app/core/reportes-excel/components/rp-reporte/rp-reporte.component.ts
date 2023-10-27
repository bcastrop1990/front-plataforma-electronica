import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OptionsComponent } from 'src/app/masters/components/options/options.component';
import { Options, OptionsOut } from 'src/app/masters/models/option.model';
import { MaestrosService } from 'src/app/masters/services/maestros.service';
import { UtilService } from 'src/app/shared/services/util.service';
import { User } from 'src/app/auth/models/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { BusquedaData } from 'src/app/core/gestion-solicitudes/models/busqueda.model';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs/internal/Subscription';
import { SeguridadService } from 'src/app/shared/services/seguridad.service';

@Component({
  selector: 'app-rp-reporte',
  templateUrl: './rp-reporte.component.html',
  styleUrls: ['./rp-reporte.component.scss'],
})
export class RpReporteComponent implements OnInit {
  environment: any;
  message!: string;

  //ADAPTAR PARA LA PAGINA
  dataResult!: MatTableDataSource<BusquedaData>;
  selection = new SelectionModel<BusquedaData>(true, []);
  length = 0;

  title!: string;
  form!: FormGroup;

  user?: User;
  subUser!: Subscription;

  estadoSolicitudOut!: OptionsOut;
  estadoSolicitud: Options[] = [];

  tipoRegistroOut!: OptionsOut;
  tipoRegistro: Options[] = [];

  analistasOut!: OptionsOut;
  analistas: Options[] = [];

  @ViewChild('cboAnalista') cboAnalista!: OptionsComponent;
  @ViewChild('cboEstadoSolicitud') cboEstadoSolicitud!: OptionsComponent;
  @ViewChild('cboTipoRegistro') cboTipoRegistro!: OptionsComponent;

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataResult.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataResult.data);
  }

  //Opcion predeterminada
  codigoEstado: string = '3';

  constructor(
    private maestrosService: MaestrosService,
    public utilService: UtilService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private seguridadService: SeguridadService
  ) {
    this.subUser = this.seguridadService
      .getObsUser()
      .subscribe((data: User) => {
        this.user = data;
      });
  }

  ngOnInit(): void {
    this.title = 'Generar Reporte';
    this.environment = environment;
    this.form = this.formBuilder.group({
      codigoEstado: [this.codigoEstado],
      fechaIni: [''],
      fechaFin: [''],
      codigoTipoRegistro: [
        this.esAnalista() ? this.environment.TIPO_REGISTRO_LIBRO_ID : '',
      ],
      codigoAnalistaAsignado: [this.esAnalista() ? this.user?.dni : ''],
    });
    this.getAnalistas();
    this.getEstadosSolicitud();
    this.getTipoRegistro();
  }

  esAnalista(): boolean {
    return this.user?.perfil.codigo === this.environment.PERFIL_ANALISTA;
  }

  getEstadosSolicitud(): void {
    this.maestrosService.listEstadoSolicitud().subscribe(
      (data: OptionsOut) => {
        this.estadoSolicitudOut = data;
      },
      (error) => {},
      () => {
        if (this.estadoSolicitudOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(
            `Aviso:`,
            `${this.estadoSolicitudOut.message}`
          );
          return;
        }
        this.estadoSolicitud = this.estadoSolicitudOut.data;
      }
    );
  }

  clearDate(formControl: string[]) {
    formControl.forEach((item) => {
      this.form.controls[item].setValue('');
    });
  }

  setEstadoSolicitud(id: any) {
    this.form.controls['codigoEstado'].setValue(id);
    // this.getListaBusqueda();
  }

  getTipoRegistro(): void {
    this.maestrosService.listTipoRegistro().subscribe(
      (data: OptionsOut) => {
        this.tipoRegistroOut = data;
      },

      (error) => {},
      () => {
        if (this.tipoRegistroOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(
            `Aviso:`,
            `${this.tipoRegistroOut.message}`
          );
          return;
        }
        if (this.esAnalista()) {
          this.tipoRegistro = this.tipoRegistroOut.data.filter(
            (x) => x.codigo === this.environment.TIPO_REGISTRO_LIBRO_ID
          );
        } else {
          this.tipoRegistro = this.tipoRegistroOut.data;
        }
      }
    );
  }

  setTipoRegistro(id: any) {
    this.form.controls['codigoTipoRegistro'].setValue(id);
  }

  getAnalistas(): void {
    this.maestrosService.listAnalistas().subscribe(
      (data: OptionsOut) => {
        this.analistasOut = data;
      },
      (error) => {},
      () => {
        if (this.analistasOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.analistasOut.message}`);
          return;
        }
        if (this.esAnalista()) {
          this.analistas = this.analistasOut.data.filter(
            (x) => x.codigo === this.user?.dni
          );
        } else {
          this.analistas = this.analistasOut.data;
        }
      }
    );
  }

  setAnalista(id: any) {
    this.form.controls['codigoAnalistaAsignado'].setValue(id);
  }

  //Todo: Crear servicio que reciba tipo de solicitud, fecha,estadoS
  //Todo: Implementar todas las oficinas autorizadas
  //Todo: Implementar a el solicitante
  //Todo: Consultar sobre la tabla
}
