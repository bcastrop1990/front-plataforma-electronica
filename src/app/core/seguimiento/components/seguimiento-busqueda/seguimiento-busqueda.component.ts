import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  BusquedaData,
  BusquedaIn,
  BusquedaOut,
  DocumentosRespuesta,
  DocumentosRespuestaOut,
  Fechas,
} from '../../models/busqueda.model';
import { UtilService } from '../../../../shared/services/util.service';
import { SeguimientoService } from '../../services/seguimiento.service';
import { environment } from 'src/environments/environment';
import { formatDate } from '@angular/common';
import { UploadFileService } from '../../../../shared/services/upload-file.service';
import {
  GetFileData,
  GetFileOut,
} from '../../../../shared/models/upload-file.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ModalDocumentosComponent } from '../modal-documentos/modal-documentos.component';
import { DateAdapter } from '@angular/material/core';
import { GestionService } from 'src/app/core/gestion-solicitudes/services/gestion.service';
import {
  DetalleFirma,
  DetalleLibro,
  ObtenerDetalleFirmaOut,
  ObtenerDetalleLibroOut,
} from 'src/app/core/gestion-solicitudes/models/gestion.model';
import { SeguimientoDetalleComponent } from '../seguimiento-detalle/seguimiento-detalle.component';

@Component({
  selector: 'app-seguimiento-busqueda',
  templateUrl: './seguimiento-busqueda.component.html',
  styleUrls: ['./seguimiento-busqueda.component.scss'],
})
export class SeguimientoBusquedaComponent implements OnInit {
  environment: any;

  form!: FormGroup;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  displayedColumns: string[] = [
    'nroSolicitud',
    'fechaRegistro',
    'tipoRegistro',
    'estado',
    'docRegistrado',
    'docRespuesta',
  ];
  dataResult!: MatTableDataSource<BusquedaData>;
  length = 0;
  aux = 0;

  busquedaIn!: BusquedaIn;
  busquedaOut!: BusquedaOut;

  getFileOut!: GetFileOut;
  getFileData!: GetFileData;

  fechasOut!: Fechas;
  fecha!: Fechas;

  documentosRespuestaOut!: DocumentosRespuestaOut;
  documentosRespuesta!: DocumentosRespuesta[];

  lista!: BusquedaData[];

  obtenerDetalleLibroOut!: ObtenerDetalleLibroOut;
  detalleLibro!: DetalleLibro;

  obtenerDetalleFirmaOut!: ObtenerDetalleFirmaOut;
  detalleFirma!: DetalleFirma;

  fecIni = new Date();
  fecFin = new Date();

  message!: string;

  rangeMax: number = 30;
  rangeMaxMessage: string = `El rango máximo es de ${this.rangeMax} días.`;

  constructor(
    private formBuilder: FormBuilder,
    public utilService: UtilService,
    private seguimientoService: SeguimientoService,
    private uploadService: UploadFileService,
    private spinner: NgxSpinnerService,
    private dateAdapter: DateAdapter<Date>,
    public dialog: MatDialog,
    private gestionService: GestionService
  ) {}

  ngOnInit(): void {
    this.environment = environment;

    this.form = this.formBuilder.group({
      numeroSolicitud: [
        '',
        [
          Validators.minLength(12),
          Validators.maxLength(12),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      fechaInicio: [''],
      fechaFin: [''],
    });

    this.getLista();
  }

  btnClean() {
    this.form.controls['numeroSolicitud'].setValue('');
    this.form.controls['fechaInicio'].setValue('');
    this.form.controls['fechaFin'].setValue('');
  }

  btnSearch() {
    this.getLista();
  }

  changeDateRange() {
    const start = this.form.get('fechaInicio')?.value;
    const end = this.form.get('fechaFin')?.value;

    if (start && end) {
      const startMoreMax = this.dateAdapter.addCalendarDays(
        start,
        this.rangeMax
      );
      if (startMoreMax < end) {
        this.form.get('fechaFin')?.setErrors({ maxRange: true });
      }
    }
  }

  getLista(e?: PageEvent): void {
    this.length = 0;
    this.message = 'Cargando...';

    if (this.form.invalid) {
      this.utilService.getAlert(
        'Aviso',
        'Debe completar los datos de búsqueda correctamente.'
      );
      return;
    }

    const fInicio = this.form.controls['fechaInicio'].value;
    const fFin = this.form.controls['fechaFin'].value;

    const busquedaIn = new BusquedaIn();
    busquedaIn.page = e ? e.pageIndex + 1 : this.environment.START_PAGE;
    busquedaIn.size = e ? e.pageSize : this.environment.ROWS_PAGE;

    this.fechasOut = this.seguimientoService.getSharedData();

    if (this.aux == 0 && this.fechasOut) {
      busquedaIn.fechaIni = this.fechasOut.fechaIni;
      busquedaIn.fechaFin = this.fechasOut.fechaFin;
      busquedaIn.numeroSolicitud = this.fechasOut.numeroSolicitud!;
      this.aux++;
    } else {
      busquedaIn.fechaIni = fInicio
        ? formatDate(fInicio, 'yyyy-MM-dd', 'EN')
        : '';
      busquedaIn.fechaFin = fFin ? formatDate(fFin, 'yyyy-MM-dd', 'EN') : '';
      busquedaIn.numeroSolicitud = this.form.controls['numeroSolicitud'].value;
    }

    this.seguimientoService.listSolicitudes(busquedaIn).subscribe(
      (data: BusquedaOut) => {
        console.log(busquedaIn);
        this.busquedaOut = data;
      },
      (error) => {},
      () => {
        if (this.busquedaOut.code !== this.environment.CODE_000) {
          this.message = this.busquedaOut.message;
          return;
        }
        this.lista = this.busquedaOut.data;
        console.log(this.lista);
        this.dataResult = new MatTableDataSource<BusquedaData>(this.lista);
        this.dataResult.sort = this.sort;
        this.length = this.busquedaOut.totalElements;
        if (!length || length <= 0) {
          this.message = 'No se encontraron registros.';
        }
      }
    );
  }

  clearSesionDate() {}

  clearDate(formControl: string[]) {
    formControl.forEach((item) => {
      this.form.controls[item].setValue('');
    });
  }

  btnDownloadFile(codigo: string): void {
    this.uploadService.getFile(codigo).subscribe(
      (data: GetFileOut) => {
        this.getFileOut = data;
      },
      (error) => {},
      () => {
        if (this.getFileOut.code !== this.environment.CODE_000) {
          this.message = this.getFileOut.message;
          return;
        }
        this.getFileData = this.getFileOut.data;
        this.genera(this.getFileData.archivo, `${this.getFileData.nombre}.pdf`);
      }
    );
  }

  genera(base64: string, name: string) {
    const linkSource = `data:application/pdf;base64, ${base64}`;
    const link = document.createElement('a');
    const fileName = name;

    link.href = linkSource;
    link.download = fileName;
    link.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
    );

    setTimeout(function () {
      window.URL.revokeObjectURL(linkSource);
      link.remove();
    }, 100);
  }

  btnVerArchivosRespuesta(numeroSolicitud: string): void {
    if (!numeroSolicitud) {
      this.utilService.getAlert(
        'Aviso',
        'No se ha obtenido el número de solicitud.'
      );
      return;
    }

    this.spinner.show();
    this.seguimientoService.getDocumentosRespuesta(numeroSolicitud).subscribe(
      (data: DocumentosRespuestaOut) => {
        this.spinner.hide();
        this.documentosRespuestaOut = data;
      },
      (error) => {
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
        if (this.documentosRespuestaOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(
            `Aviso:`,
            `${this.documentosRespuestaOut.message}`
          );
          return;
        }
        this.documentosRespuesta = this.documentosRespuestaOut.data;
        // ENVIAR RESPONSE A MODAL DETALLE
        this.getDetalle('Documentos de Respuesta', this.documentosRespuesta);
      }
    );
  }

  getDetalle(title: string, detalle: any) {
    return this.dialog.open(ModalDocumentosComponent, {
      width: '1100px',
      data: { title: title, files: detalle },
    });
  }

  btnVer(tipo: string, nroSolicitud: string) {
    //FIRMA
    if (tipo === environment.TIPO_REGISTRO_FIRMA) {
      this.spinner.show();
      this.gestionService.getDetailFirma(nroSolicitud).subscribe(
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
          //Enviar a modal
          this.getDetalleSustento(
            'Detalle de Solicitud',
            this.detalleFirma,
            tipo
          );
        }
      );
    }
    //LIBRO
    if (tipo == environment.TIPO_REGISTRO_LIBRO) {
      this.spinner.show();
      this.gestionService.getDetailLibro(nroSolicitud).subscribe(
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
          this.getDetalleSustento(
            'Detalle de Solicitud',
            this.detalleLibro,
            tipo
          );
        }
      );
    }
  }

  getDetalleSustento(title: string, detalle: any, tipo: string) {
    return this.dialog.open(SeguimientoDetalleComponent, {
      width: '800px',
      data: { title: title, detalle: detalle, tipo: tipo },
    });
  }
}
