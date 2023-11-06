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
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs/internal/Subscription';
import { SeguridadService } from 'src/app/shared/services/seguridad.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { formatDate } from '@angular/common';
import { GestionService } from 'src/app/core/gestion-solicitudes/services/gestion.service';
import { MatSort } from '@angular/material/sort';
import {
  ReporteOut,
  ReportesIn,
  ReporteData,
} from 'src/app/core/gestion-solicitudes/models/busquedaReporte.model';

@Component({
  selector: 'app-rp-reporte',
  templateUrl: './rp-reporte.component.html',
  styleUrls: ['./rp-reporte.component.scss'],
})
export class RpReporteComponent implements OnInit {
  environment: any;
  message!: string;
  limit!: any;
  length = 0;

  //VARIABLES CENTRALES PARA LA TABLA
  dataResult!: MatTableDataSource<ReporteData>;
  selection = new SelectionModel<ReporteData>(true, []);

  title!: string;
  form!: FormGroup;

  user?: User;
  subUser!: Subscription;

  //CREANDO MODELOS LAS BUSQUEDAS
  busquedaIn!: ReportesIn;
  busquedaOut!: ReporteOut;

  estadoSolicitudOut!: OptionsOut;
  estadoSolicitud: Options[] = [];

  tipoRegistroOut!: OptionsOut;
  tipoRegistro: Options[] = [];

  analistasOut!: OptionsOut;
  analistas: Options[] = [];

  listaEstadoSolicitud!: ReporteData[];

  fecIni = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    new Date().getDate()
  );
  fecFin = new Date();

  @ViewChild('cboAnalista') cboAnalista!: OptionsComponent;
  @ViewChild('cboEstadoSolicitud') cboEstadoSolicitud!: OptionsComponent;
  @ViewChild('cboTipoRegistro') cboTipoRegistro!: OptionsComponent;

  //ESTRUCTURANDO VALORES DE LA TABLA
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  displayedColumns: string[] = [
    'nroSolicitud',
    'fechaRegistro',
    'tipoRegistro',
    'detalleSolicitud',
    'oficinaAutorizada',
    'solicitante',
    'fechaRecepcion',
    'fechaAsignacion',
    'fechaAtencion',
    'analistaAsignado',
    'docAtencion',
    'estado',
  ];

  /*
    DATOS FALTANTES
    'detalleSolicitud',
    'oficinaAutorizada',
    'docAtencion',
  */

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataResult.data.length;
    return numSelected === numRows;
  }
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
    private seguridadService: SeguridadService,
    private gestionService: GestionService
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
      dniSolicitante: [''],
      apellidoPaterno: [''],
      apellidoMaterno: [''],
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
    this.getListaBusqueda();
  }

  esAnalista(): boolean {
    return this.user?.perfil.codigo === this.environment.PERFIL_ANALISTA;
  }

  btnSearch() {
    this.getListaBusqueda();
  }

  getListaBusqueda(e?: PageEvent): void {
    this.length = 0;
    this.message = 'Cargando...';

    const fIni = this.form.controls['fechaIni'].value;
    const fFin = this.form.controls['fechaFin'].value;

    this.busquedaIn = new ReportesIn();
    this.busquedaIn = this.form.getRawValue();

    console.log('getListaBusqueda - Reportes: ' + this.busquedaIn.codigoEstado);

    this.busquedaIn.fechaIni = fIni ? formatDate(fIni, 'yyyy-MM-dd', 'EN') : '';
    this.busquedaIn.fechaFin = fFin ? formatDate(fFin, 'yyyy-MM-dd', 'EN') : '';
    this.busquedaIn.page = e ? e.pageIndex + 1 : this.environment.START_PAGE;
    this.busquedaIn.size = e ? e.pageSize : this.environment.ROWS_PAGE;

    this.gestionService.listReportesSolicitudes(this.busquedaIn).subscribe(
      (data: ReporteOut) => {
        this.busquedaOut = data;
      },
      (error) => {},
      () => {
        if (this.busquedaOut.code !== this.environment.CODE_000) {
          this.message = this.busquedaOut.message;
          return;
        }
        //LIMPIANDO SECCION
        this.selection.clear();
        //ASIGNAR VALORES
        this.listaEstadoSolicitud = this.busquedaOut.data;
        this.listaEstadoSolicitud.forEach((item) => {});
        this.dataResult = new MatTableDataSource<ReporteData>(
          this.listaEstadoSolicitud
        );

        console.log(this.dataResult);

        this.dataResult.sort = this.sort;
        this.length = this.busquedaOut.totalElements;
        if (!length || length <= 0) {
          this.message = 'No se encontraron registros';
        }
      }
    );
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
