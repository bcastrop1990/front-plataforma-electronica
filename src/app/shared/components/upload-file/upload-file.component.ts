import {
  Component,
  EventEmitter,
  Input,
  IterableDiffers,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FileInput, FileValidator } from 'ngx-material-file-input';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { requiredFileMinSize } from '../../helpers/requiredFileMinContentSize';
import { requiredFileType } from '../../helpers/requireFileTypeValidator';
import {
  DeleteOut,
  RemoveOut,
  UploadOut,
} from '../../models/upload-file.model';
import { UploadFileService } from '../../services/upload-file.service';
import { UtilService } from '../../services/util.service';
import { environment } from '../../../../environments/environment';
import { TipoArchivo } from '../../../masters/models/maestro.model';
import { Archivos } from 'src/app/core/gestion-solicitudes/models/gestion.model';
import {
  ArchivoDetalle,
  ArchivoSustento,
} from 'src/app/core/actas-registrales/models/libro.model';
import { ContentObserver } from '@angular/cdk/observers';

export interface List {
  idSolicitud?: number; // [ALTA: 1, ACTULIZAR: 2, SUSTENTO: 3`]
  idArchivo?: number;
  idTipoArchivo?: string;
  idFile: string;
  fileName: string;
  fileTypeId: string;
  fileTypeDesc: string;
  file?: File;
}

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss'],
})
export class UploadFileComponent implements OnInit, OnChanges {
  @Input() addLabel!: string;
  @Input() minRequired: number = 0;
  @Input() maxPermitted: number = -1;

  @Input() textHelp!: string;
  @Input() textRequired!: string;
  @Input() textFilesAllowed!: string;
  @Input() textMaxFileSize!: string;
  @Input() textMinFileSize!: string;
  @Input() fileTypeAllowed!: string[];
  @Input() fileMinSize!: number; // bytes
  @Input() fileMaxSize!: number; // bytes
  @Input() textResponseMaxFileMessage!: string;

  @Input() requiredTipoArchivo: boolean = false;
  @Input() arrayTipoArchivo!: TipoArchivo[];

  @Input() disabledAll: boolean = false;

  @Output() doRefreshData: EventEmitter<List[]> = new EventEmitter();
  @Output() doResponseMaxAllowed: EventEmitter<string> = new EventEmitter();

  @Input() arrayArchivoSustento!: ArchivoSustento[]; //bcastro: lista de archivos sustentos: se utiliza desde editar firma
  @Input() arrayArchivoDetalle!: Archivos[]; //bcastro: lista de archivos sustentos: se utiliza desde editar firma

  @Input() arrayTipoArchivoAlta!: TipoArchivo[] | [];
  @Input() arrayTipoArchivoActualizar!: TipoArchivo[] | [];

  @Input() idTipoSoliciutdSelect!: number;
  @Input() cambioBaja: boolean = false;

  form!: FormGroup;
  data: List[] = [];
  loading = false;

  readonly maxSize = this.fileMaxSize ? this.fileMaxSize : 1050000;
  readonly minSize = this.fileMinSize ? this.fileMinSize : 1024;

  inputDisable: boolean = true;

  lastAttachUplaoding!: boolean;
  arrayArchivoDetalleEliminar: string[] = [];
  arrayArchivoSustentoEliminar: number[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private storageService: UploadFileService,
    private utilService: UtilService,
    private uploadFileService: UploadFileService
  ) {}

  ngOnInit(): void {
    this.deleteLs();
    this.form = this.formBuilder.group({
      idTipoArchivo: [
        { value: '', disabled: this.disabledAll },
        [Validators.required],
      ],
      file: [
        { value: '', disabled: this.disabledAll },
        [
          FileValidator.maxContentSize(this.maxSize),
          requiredFileMinSize(this.minSize),
          requiredFileType(this.fileTypeAllowed),
        ],
      ],
    });
    if (this.data.length < this.minRequired) {
      if (this.requiredTipoArchivo) {
        this.form.controls['idTipoArchivo'].setValidators([
          Validators.required,
        ]);
      }
      this.form.controls['file'].setValidators([Validators.required]);
    }
    this.setActivateValidation();
    this.lastAttachUplaoding = false;

    if (this.arrayArchivoDetalle) {
      this.arrayArchivoDetalle.forEach((item) => {
        this.arrayTipoArchivoAlta.forEach((tipo) => {
          if (item.idTipoArchivo === tipo.codigo) {
            this.arrayTipoArchivo;
            let item2: List;
            const fileTypeSelected = this.form.controls['idTipoArchivo'].value;
            item2 = {
              idSolicitud: 1,
              idFile: item.idArchivo,
              idTipoArchivo: item.idTipoArchivo,
              fileName: item.nombreOriginal,
              fileTypeId: this.requiredTipoArchivo ? fileTypeSelected : '',
              fileTypeDesc: tipo.descripcion,
            };
            this.postUploadSuccess(item2);
          }
        });

        this.arrayTipoArchivoActualizar.forEach((tipo) => {
          if (item.idTipoArchivo === tipo.codigo) {
            this.arrayTipoArchivo;
            let item2: List;
            const fileTypeSelected = this.form.controls['idTipoArchivo'].value;
            item2 = {
              idSolicitud: 2,
              idFile: item.idArchivo,
              idTipoArchivo: item.idTipoArchivo,
              fileName: item.nombreOriginal,
              fileTypeId: this.requiredTipoArchivo ? fileTypeSelected : '',
              fileTypeDesc: tipo.descripcion,
            };
            this.postUploadSuccess(item2);
          }
        });
      });
    }

    if (this.arrayArchivoSustento) {
      this.arrayArchivoSustento.forEach((item) => {
        this.arrayTipoArchivo.forEach((tipo) => {
          if (item.idTipoArchivo === tipo.codigo) {
            let item2: List;
            const fileTypeSelected = this.form.controls['idTipoArchivo'].value;
            item2 = {
              idSolicitud: 3,
              idArchivo: item.idArchivo,
              idTipoArchivo: item.idTipoArchivo,
              idFile: item.codigo,
              fileName: item.nombreOriginal,
              fileTypeId: this.requiredTipoArchivo ? fileTypeSelected : '',
              fileTypeDesc: tipo.descripcion,
            };
            this.postUploadSuccess(item2);
          }
        });
      });
    }
  }

  deleteLs() {
    localStorage.removeItem('idFileDetalle');
    localStorage.removeItem('idFileSustento');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.form) {
      this.setDisabledInputs();
    }

    if (this.cambioBaja) {
      this.deleteAll(this.arrayArchivoDetalle);
    }
  }

  setDisabledInputs(): void {
    if (this.disabledAll) {
      this.form.controls['idTipoArchivo'].disable();
      this.form.controls['file'].disable();
    } else {
      this.form.controls['idTipoArchivo'].enable();
      this.form.controls['file'].enable();
    }
  }

  setActivateValidation() {
    if (this.data.length < this.minRequired) {
      this.setValidatorRequired();
    } else {
      this.cleanValidatorRequired();
    }
    this.setValidatorFile();
  }

  setValidatorRequired() {
    if (this.requiredTipoArchivo) {
      this.form.controls['idTipoArchivo'].setValidators([Validators.required]);
      this.form.controls['idTipoArchivo'].setErrors({ required: true });
    }
    this.form.controls['file'].setValidators([Validators.required]);
    this.form.controls['file'].setErrors({ required: true });
    this.form.markAllAsTouched();
  }

  cleanValidatorRequired() {
    if (this.requiredTipoArchivo) {
      this.form.controls['idTipoArchivo'].setValidators(null);
      this.form.controls['idTipoArchivo'].setErrors(null);
    }
    this.form.controls['file'].setValidators(null);
    this.form.controls['file'].setErrors(null);
  }

  setValidatorFile() {
    if (this.requiredTipoArchivo) {
      this.form.controls['idTipoArchivo'].setValidators([]);
    }
    this.form.controls['file'].setValidators([
      FileValidator.maxContentSize(this.maxSize),
      requiredFileMinSize(this.minSize),
      requiredFileType(this.fileTypeAllowed),
    ]);
    this.form.markAllAsTouched();
  }

  resetFile(event: any) {
    event.target.value = null;
  }

  attach(file: FileInput) {
    //VALIDANDO CANTIDAD DE TIPO ARCHIVO
    let uniqueValues = new Set();
    let todosSonUnicos = false;

    if (this.data.length > 0) {
      this.data.forEach((archivo) => {
        if (
          this.form.controls['idTipoArchivo'].value === archivo.idTipoArchivo
        ) {
          todosSonUnicos = true;
        }
        if (this.form.controls['idTipoArchivo'].value === archivo.fileTypeId) {
          todosSonUnicos = true;
        }
      });
    }

    if (todosSonUnicos) {
      this.emitResponseDifferenteTypeFile();
      return;
    }

    /*
    this.data.forEach((item) => {
      if (uniqueValues.has(item.idTipoArchivo)) {
        todosSonUnicos = false;
      } else {
        uniqueValues.add(item.idTipoArchivo);
      }
      if (uniqueValues.has(this.form.controls['idTipoArchivo'].value)) {
        todosSonUnicos = false;
      } else {
        uniqueValues.add(this.form.controls['idTipoArchivo'].value);
      }
    });

    if (!todosSonUnicos) {
      this.emitResponseDifferenteTypeFile();
      return;
    }

    */

    //Fin

    if (
      this.requiredTipoArchivo &&
      !this.form.controls['idTipoArchivo'].value
    ) {
      this.form.controls['file'].reset();
      this.setActivateValidation();
      this.utilService.getAlert(
        'Aviso',
        'Debe seleccionar un tipo de archivo.'
      );
      return;
    }

    //todo: modificar para que reciba una lista

    this.lastAttachUplaoding = false;
    if (this.form.controls['file'].valid) {
      if (this.data.length < this.maxPermitted) {
        this.lastAttachUplaoding = true;
        if (file) {
          let item: List;
          this.loading = true;
          const fileFormData = new FormData();
          fileFormData.append('file', file.files[0]);
          this.storageService.upload(fileFormData).subscribe(
            (data: UploadOut) => {
              const fileTypeSelected =
                this.form.controls['idTipoArchivo'].value;
              item = {
                idFile: data.data,
                fileName: file.files[0].name,
                fileTypeId: this.requiredTipoArchivo ? fileTypeSelected : '',
                fileTypeDesc: this.requiredTipoArchivo
                  ? this.arrayTipoArchivo.filter(
                      (x) => x.codigo === fileTypeSelected
                    )[0].descripcion
                  : '',
                file: file.files[0],
              };
              this.postUploadSuccess(item);
            },
            (error) => {
              this.postUploadError();
              this.loading = false;
            },
            () => {
              this.loading = false;
            }
          );
          this.form.controls['file'].reset();
          // this.form.controls['idTipoArchivo'].reset();
          this.setActivateValidation();
        }
      } else {
        this.emitResponseMaxAllowed();
      }
    }
  }

  deleteAll(array: Archivos[]) {
    const modalChangePassword = this.utilService.getConfirmation(
      'Eliminar archivos',
      'Esto eliminara todos los archivos \n¿Seguro que desea eliminar?'
    );

    modalChangePassword.afterClosed().subscribe((result) => {
      if (result) {
        array.forEach((archivo) => {
          this.arrayArchivoDetalleEliminar.push(archivo.idArchivo);
          localStorage.setItem(
            'idFileDetalle',
            JSON.stringify(this.arrayArchivoDetalleEliminar)
          );
        });

        this.data.splice(0);
        this.setActivateValidation();
        this.emitRefreshData();
      }
    });
  }

  delete(file: List) {
    const modalChangePassword = this.utilService.getConfirmation(
      'Eliminar',
      '¿Desea eliminar el archivo?'
    );

    modalChangePassword.afterClosed().subscribe((result) => {
      if (result) {
        if (this.arrayArchivoDetalle) {
          this.arrayArchivoDetalle.forEach((item) => {
            if (item.idArchivo === file.idFile) {
              this.arrayArchivoDetalleEliminar.push(file.idFile);
              localStorage.setItem(
                'idFileDetalle',
                JSON.stringify(this.arrayArchivoDetalleEliminar)
              );
            }
          });
        }

        if (this.arrayArchivoSustento) {
          this.arrayArchivoSustento.forEach((item) => {
            if (item.idArchivo === file.idArchivo) {
              this.arrayArchivoSustentoEliminar.push(file.idArchivo);
              localStorage.setItem(
                'idFileSustento',
                JSON.stringify(this.arrayArchivoSustentoEliminar)
              );
            }
          });
        }

        if (!this.arrayArchivoSustento || !this.arrayArchivoDetalle) {
          this.uploadFileService
            .delete(file.idFile)
            .subscribe((data: DeleteOut) => {});
        }

        this.data.splice(this.data.indexOf(file, 0), 1);
        this.setActivateValidation();
        this.emitRefreshData();

        //TODO: mandar array a servicio
      }
    });
  }

  downloadFile(index: number, item: List) {
    if (item.file) {
      this.genera(item.file, item.fileName);
    }
  }

  genera(blob: Blob, name: string) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    const newBlob = new Blob([blob], { type: 'application/octet-stream' });

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    //   window.navigator.msSaveOrOpenBlob(newBlob);
    //   return;
    // }

    // For other browsers:
    // Create a link pointing to the ObjectURL containing the blob.
    const data = window.URL.createObjectURL(newBlob);

    const link = document.createElement('a');
    link.href = data;
    link.download = `${name}`;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
    );

    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(data);
      link.remove();
    }, 100);
  }

  private postUploadSuccess(item: List) {
    this.data.push(item);
    // if (this.data.length < this.maxPermitted) {
    //   this.form.controls['file'].enable();
    //   this.form.controls['idTipoArchivo'].enable();
    // }
    this.form.controls['file'].enable();
    this.form.controls['idTipoArchivo'].enable();
    this.emitRefreshData();
  }

  private postUploadError() {
    if (this.data.length > 0) {
      let indexItem = this.data.length - 1;
      this.data.splice(indexItem, 1);
      this.setActivateValidation();
      this.emitRefreshData();
    }
  }

  private refresh() {
    if (this.data.length >= this.maxPermitted) {
      this.inputDisable = false;
      this.form.controls['file'].disable();
    } else {
      this.inputDisable = true;
      this.form.controls['file'].enable();
    }
  }

  emitResponseMaxAllowed() {
    this.doResponseMaxAllowed.emit(
      `${
        this.textResponseMaxFileMessage
          ? this.textResponseMaxFileMessage
          : 'Máximo de archivos permitidos: '
      } ${this.maxPermitted}`
    );
    this.form.controls['file'].reset();
  }

  emitResponseDifferenteTypeFile() {
    this.doResponseMaxAllowed.emit(
      `${
        this.textResponseMaxFileMessage
          ? this.textResponseMaxFileMessage
          : 'Solo se permite un archivo por cada Tipo de Archivo'
      }`
    );
    this.form.controls['file'].reset();
  }

  emitRefreshData() {
    // const array = this.data.map(value => value.idFile);
    const array = this.data;
    this.doRefreshData.emit(array);
  }

  valid(): boolean {
    let valor = true;

    const count = this.data.length;
    if (count < this.minRequired || count > this.maxPermitted) {
      valor = false;
    }
    return valor;
  }

  reset(): void {
    this.data = [];
    this.refresh();
  }
}
