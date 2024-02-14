import { Component, HostListener, Inject, OnInit } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import {
  GetFileOut,
  GetFileData,
  RemoveOut,
} from 'src/app/shared/models/upload-file.model';
import { UploadFileService } from 'src/app/shared/services/upload-file.service';
import { UtilService } from 'src/app/shared/services/util.service';
import { environment } from 'src/environments/environment';
import { GsDetalleFilesComponent } from '../gs-detalle-files/gs-detalle-files.component';
import { MaestrosService } from 'src/app/masters/services/maestros.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  LenguaOut,
  Lengua,
  Articulo,
  ArticuloOut,
  TipoArchivo,
  TipoArchivoOut,
} from 'src/app/masters/models/maestro.model';
import { List } from 'src/app/shared/components/upload-file/upload-file.component';
import {
  ObtenerAtencion,
  ObtenerAtencionOut,
} from '../../models/atencion.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { GestionService } from '../../services/gestion.service';

@Component({
  selector: 'app-gs-editar-solicitud',
  templateUrl: './gs-editar-solicitud.component.html',
  styleUrls: ['./gs-editar-solicitud.component.scss'],
})
export class GsEditarSolicitudComponent implements OnInit {
  environment: any;

  form!: FormGroup;

  getFileOut!: GetFileOut;
  getFileData!: GetFileData;

  lenguaOut!: LenguaOut;
  lengua!: Lengua[];

  articuloOut!: ArticuloOut;
  articulo!: Articulo[];

  tipoArchivoOut!: TipoArchivoOut;
  tipoArchivoSustento!: TipoArchivo[];

  removeArchivoOut!: RemoveOut;

  obtenerAtencionOut!: ObtenerAtencionOut;
  obtenerAtencion!: ObtenerAtencion;

  cantidad!: number[];

  arrayFilesSustento!: List[];
  bolProccessing: boolean = false;

  constructor(
    public dialog: MatDialogRef<GsEditarSolicitudComponent>,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
    private uploadService: UploadFileService,
    private utilService: UtilService,
    public dialogOpen: MatDialog,
    private maestroService: MaestrosService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private gestionService: GestionService
  ) {
    this.cantidad = [];
    for (let i = 1; i <= 10; ++i) {
      this.cantidad.push(i);
    }
  }

  ngOnInit(): void {
    this.environment = environment;

    this.form = this.formBuilder.group({
      cantidad: ['', [Validators.required]],
      codigoLengua: ['', [Validators.required]],
      codigoArticulo: ['', [Validators.required]],
      numeroUltimaActa: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(15),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
    });

    this.getAtender(this.dataDialog.nroSolicitud);
    this.listarLenguas(this.dataDialog.detalle.codigoOrec);
    this.listarArticulos();
    this.dataDi();
  }

  cancel() {
    this.dialog.close();
  }

  dataDi() {
    console.log(this.dataDialog);
  }

  btnViewFiles(files: any[]): void {
    if (files.length <= 0) {
      this.utilService.getAlert('Aviso', 'No hay formatos asociados.');
      return;
    }
    this.getDetalleFiles('Formatos', files);
  }

  getDetalleFiles(title: string, files: any[]) {
    return this.dialogOpen.open(GsDetalleFilesComponent, {
      width: '850px',
      data: { title: title, files: files, editar: '01' },
    });
  }

  download(codigo: string, nombre: string) {
    this.uploadService.getFile(codigo).subscribe(
      (data: GetFileOut) => {
        this.getFileOut = data;
      },
      (error) => {},
      () => {
        if (this.getFileOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert('Aviso', this.getFileOut.message);
          return;
        }
        this.getFileData = this.getFileOut.data;
        this.genera(this.getFileData.archivo, nombre);
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

  @HostListener('window:keyup.esc') onKeyUp() {
    this.cancel();
  }

  getAtender(numeroSolicitud: string): void {
    this.spinner.show();
    this.gestionService.getAtencionSolicitud(numeroSolicitud).subscribe(
      (data: ObtenerAtencionOut) => {
        this.spinner.hide();
        this.obtenerAtencionOut = data;
      },
      (error) => {
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
        if (this.obtenerAtencionOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(
            `Aviso:`,
            `${this.obtenerAtencionOut.message}`
          );
          return;
        }
        this.obtenerAtencion = this.obtenerAtencionOut.data;

        this.obtenerAtencion.detalleSolicitudLibro.forEach((item) => {
          console.log(item);
        });
      }
    );
  }

  listarLenguas(codigo: string): void {
    this.maestroService.listLenguasOficina(codigo).subscribe(
      (data: LenguaOut) => {
        this.lenguaOut = data;
      },
      (error) => {},
      () => {
        if (this.lenguaOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.lenguaOut.message}`);
          return;
        }
        this.lengua = this.lenguaOut.data;
        this.lengua.sort((a, b) => (a.codigo > b.codigo ? 1 : -1));
      }
    );
  }

  listarArticulos(): void {
    this.maestroService.listArticulos().subscribe(
      (data: ArticuloOut) => {
        this.articuloOut = data;
      },
      (error) => {},
      () => {
        if (this.articuloOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.articuloOut.message}`);
          return;
        }
        this.articulo = this.articuloOut.data;
      }
    );
  }

  listarTipoArchivo(idTipoUso: string): void {
    this.maestroService.listTipoArchivos(idTipoUso).subscribe(
      (data: TipoArchivoOut) => {
        this.tipoArchivoOut = data;
      },
      (error) => {},
      () => {
        if (this.tipoArchivoOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.tipoArchivoOut.message}`);
          return;
        }
        this.tipoArchivoSustento = this.tipoArchivoOut.data;
      }
    );
  }

  showResponse(message: string) {
    this.utilService.getAlert('Aviso', message);
  }

  getFilesArray(arr: List[]): void {
    this.arrayFilesSustento = arr;
  }

  btnBorrarSustento(codigo: string) {
    console.log(codigo);
    this.uploadService.removeSustento(codigo).subscribe(
      (data: RemoveOut) => {
        this.removeArchivoOut = data;
      },
      (error) => {},
      () => {
        if (this.removeArchivoOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(
            `Aviso:`,
            `${this.removeArchivoOut.message}`
          );
          return;
        }
      }
    );
  }
}
