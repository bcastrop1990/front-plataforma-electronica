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
import { NgxSpinnerService } from 'ngx-spinner';
import {
  DetalleFirma,
  DetalleLibro,
  ObtenerDetalleFirmaOut,
  ObtenerDetalleLibroOut,
} from 'src/app/core/gestion-solicitudes/models/gestion.model';
import { RpDetalleComponent } from '../rp-detalle/rp-detalle.component';
import { RpDocumentoComponent } from '../rp-documento/rp-documento.component';

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
  solicitante: string = '';

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

  //Model Views
  obtenerDetalleLibroOut!: ObtenerDetalleLibroOut;
  detalleLibro!: DetalleLibro;

  obtenerDetalleFirmaOut!: ObtenerDetalleFirmaOut;
  detalleFirma!: DetalleFirma;

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
  resetDep: boolean = false;
  displayedColumns: string[] = [
    'nroSolicitud',
    'fechaRegistro',
    'tipoRegistro',
    'oficinaAutorizada',
    'solicitante',
    'fechaRecepcion',
    'fechaAsignacion',
    'fechaAtencion',
    'analistaAsignado',
    'estado',
    'detalleSolicitud',
    'docAtencion',
  ];

  /*
    DATOS FALTANTES
    'solicitante'
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
    private gestionService: GestionService,
    private spinner: NgxSpinnerService
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
      codigoDepartamento: [''],
      codigoProvincia: [''],
      codigoDistrito: [''],
      codigoOrec: [''],
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

    this.solicitante = this.busquedaIn.dniSolicitante; // PROV

    this.busquedaIn.fechaIni = fIni ? formatDate(fIni, 'yyyy-MM-dd', 'EN') : '';
    this.busquedaIn.fechaFin = fFin ? formatDate(fFin, 'yyyy-MM-dd', 'EN') : '';
    this.busquedaIn.page = e ? e.pageIndex + 1 : this.environment.START_PAGE;
    this.busquedaIn.size = e ? e.pageSize : this.environment.ROWS_PAGE;

    this.gestionService.listSolicitudes(this.busquedaIn).subscribe(
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

  btnView(row: ReporteData): void {
    if (!row.tipoRegistro) {
      this.utilService.getAlert(
        'Aviso',
        'No se ha obtenido el tipo de registro.'
      );
      return;
    }

    // LIBRO
    if (row.tipoRegistro === this.environment.TIPO_REGISTRO_LIBRO) {
      this.spinner.show();
      this.gestionService.getDetailLibro(row.numeroSolicitud).subscribe(
        (data: ObtenerDetalleLibroOut) => {
          this.spinner.hide();
          this.obtenerDetalleLibroOut = data;
        },
        (error) => {
          this.spinner.hide();
        },
        () => {
          this.spinner.hide();
          if (this.obtenerDetalleLibroOut.code !== this.environment.CODE_000) {
            this.utilService.getAlert(
              `Aviso:`,
              `${this.obtenerDetalleLibroOut.message}`
            );
            return;
          }
          this.detalleLibro = this.obtenerDetalleLibroOut.data;
          // ENVIAR RESPONSE A MODAL DETALLE
          this.getDetalle(
            'Detalle de Solicitud',
            this.detalleLibro,
            row.tipoRegistro
          );
        }
      );
    }

    // FIRMA - Muestra fomatos - FORMATO A SEGUIR
    if (row.tipoRegistro === this.environment.TIPO_REGISTRO_FIRMA) {
      this.spinner.show();
      this.gestionService.getDetailFirma(row.numeroSolicitud).subscribe(
        (data: ObtenerDetalleFirmaOut) => {
          this.spinner.hide();
          this.obtenerDetalleFirmaOut = data;
        },
        (error) => {
          this.spinner.hide();
        },
        () => {
          this.spinner.hide();
          if (this.obtenerDetalleFirmaOut.code !== this.environment.CODE_000) {
            this.utilService.getAlert(
              `Aviso:`,
              `${this.obtenerDetalleFirmaOut.message}`
            );
            return;
          }
          this.detalleFirma = this.obtenerDetalleFirmaOut.data;
          // ENVIAR RESPONSE A MODAL DETALLE
          this.getDetalle(
            'Detalle de Solicitud',
            this.detalleFirma,
            row.tipoRegistro
          );
        }
      );
    }
  }

  getDetalle(title: string, detalle: any, tipo: string) {
    return this.dialog.open(RpDetalleComponent, {
      width: '1100px',
      data: { title: title, detalle: detalle, tipo: tipo },
    });
  }

  getDep(ubigeo: string) {
    this.resetDep = false;
    this.form.controls['codigoDepartamento'].setValue(ubigeo);

    this.form.controls['codigoProvincia'].setValue('');
    this.form.controls['codigoDistrito'].setValue('');
    this.form.controls['codigoOrec'].setValue('');
  }

  getPro(ubigeo: string) {
    this.form.controls['codigoProvincia'].setValue(ubigeo);

    this.form.controls['codigoDistrito'].setValue('');
    this.form.controls['codigoOrec'].setValue('');
  }

  getDis(ubigeo: string) {
    this.form.controls['codigoDistrito'].setValue(ubigeo);

    this.form.controls['codigoOrec'].setValue('');
  }

  getOficinaAutorizada(idOficinaOrec: string) {
    this.form.controls['codigoOrec'].setValue(idOficinaOrec);
  }

  btnDoc(row: ReporteData) {
    if (!row.tipoRegistro) {
      this.utilService.getAlert(
        'Aviso',
        'No se ha obtenido el tipo de registro.'
      );
      return;
    }

    if (row.tipoRegistro === this.environment.TIPO_REGISTRO_LIBRO) {
      this.spinner.show();
      this.gestionService.getDetailLibro(row.numeroSolicitud).subscribe(
        (data: ObtenerDetalleLibroOut) => {
          this.spinner.hide();
          this.obtenerDetalleLibroOut = data;
        },
        (error) => {
          this.spinner.hide();
        },
        () => {
          this.spinner.hide();
          if (this.obtenerDetalleLibroOut.code !== this.environment.CODE_000) {
            this.utilService.getAlert(
              `Aviso:`,
              `${this.obtenerDetalleLibroOut.message}`
            );
            return;
          }
          this.detalleLibro = this.obtenerDetalleLibroOut.data;
          this.getDetalleDocumento(
            'Documentos de Atención',
            this.detalleLibro,
            row.tipoRegistro
          );
        }
      );
    }

    if (row.tipoRegistro === this.environment.TIPO_REGISTRO_FIRMA) {
      this.spinner.show();
      this.gestionService.getDetailFirma(row.numeroSolicitud).subscribe(
        (data: ObtenerDetalleFirmaOut) => {
          this.spinner.hide();
          this.obtenerDetalleFirmaOut = data;
        },
        (error) => {
          this.spinner.hide();
        },
        () => {
          this.spinner.hide();
          if (this.obtenerDetalleFirmaOut.code !== this.environment.CODE_000) {
            this.utilService.getAlert(
              `Aviso:`,
              `${this.obtenerDetalleFirmaOut.message}`
            );
            return;
          }
          this.detalleFirma = this.obtenerDetalleFirmaOut.data;
          this.getDetalleDocumento(
            'Documentos de Atención',
            this.detalleFirma,
            row.tipoRegistro
          );
        }
      );
    }
  }

  getDetalleDocumento(title: string, detalle: any, tipo: string) {
    return this.dialog.open(RpDocumentoComponent, {
      width: '1100px',
      data: { title: title, detalle: detalle, tipo: tipo },
    });
  }
}
