import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Ubigeo, UbigeoOut } from '../../models/ubigeo.model';
import { UtilService } from '../../../shared/services/util.service';
import { UbigeoService } from '../../services/ubigeo.service';
import { SessionService } from 'src/app/core/actas-registrales/services/sesion.service';
import { OficinaOut } from 'src/app/core/actas-registrales/models/libro.model';

@Component({
  selector: 'app-ubigeo',
  templateUrl: './ubigeo.component.html',
  styleUrls: ['./ubigeo.component.scss'],
})
export class UbigeoComponent implements OnInit, OnChanges {
  environment: any;
  form!: FormGroup;

  label!: string;

  ubigeoOut!: UbigeoOut;
  ubigeo!: Ubigeo[];

  encontrado: boolean = false;

  oficinaEncontrada!: OficinaOut;

  departamentoPrueba: string = 'ANCASH';
  provinciaPrueba: string = 'CARHUAZ';
  distritoPrueba: string = 'CARHUAZ';

  //!NO VA ACA
  centroPrueba?: string = '';
  ofaPrueba: string = 'OFICINA REGISTRAL AFILIADA DE CARHUAZ';

  @Input() required: boolean = false;
  @Input() type: string = '';
  @Input() idDepartamento: string = '';
  @Input() idProvincia: string = '';

  @Output() ubigeoSelected: EventEmitter<string> = new EventEmitter();
  @Input() reset: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    public utilService: UtilService,
    private ubigeoService: UbigeoService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.environment = environment;

    this.form = this.formBuilder.group({
      sUbigeo: ['', this.required ? [Validators.required] : []],
    });

    this.fnValidate();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.fnValidate();
    if (this.reset) {
      this.form.controls['sUbigeo'].setValue('');
    }
  }

  fnValidate(): void {
    if (this.form) {
      this.callUbigeo(this.type);
    }
  }

  callUbigeo(type: string): void {
    switch (type) {
      case 'DEP':
        this.label = 'Departamento';
        this.listarDep();
        // if (this.selectEmpty) {
        //   this.form.controls['sUbigeo'].setValue('');
        // }
        break;
      case 'PRO':
        this.label = 'Provincia';

        this.form.controls['sUbigeo'].setValue('');
        this.ubigeo = [];

        if (this.idDepartamento) {
          this.listarPro(this.idDepartamento);
          this.form.controls['sUbigeo'].setValue('');
        }
        break;
      case 'DIS':
        this.label = 'Distrito';

        this.form.controls['sUbigeo'].setValue('');
        this.ubigeo = [];

        if (this.idDepartamento) {
          this.form.controls['sUbigeo'].setValue('');
          this.ubigeo = [];
        }
        if (this.idDepartamento && this.idProvincia) {
          this.listarDis(this.idDepartamento, this.idProvincia);
          this.form.controls['sUbigeo'].setValue('');
        }
        break;
    }
  }

  /*
  listarDep(): void {
    this.ubigeoService.listDep().subscribe(
      (data: UbigeoOut) => {
        this.ubigeoOut = data;
      },
      (error) => {},
      () => {
        if (this.ubigeoOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.ubigeoOut.message}`);
          return;
        }
        this.ubigeo = this.ubigeoOut.data;
      }
    );
  }
  */

  listarDep(): void {
    this.ubigeoService.listDep().subscribe(
      (data: UbigeoOut) => {
        this.ubigeoOut = data;
      },
      (error) => {},
      () => {
        if (this.ubigeoOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.ubigeoOut.message}`);
          return;
        }
        this.ubigeo = this.ubigeoOut.data;
        const selectedUbigeo = this.ubigeo.find(
          (item) => item.descripcion === this.departamentoPrueba
        );

        if (selectedUbigeo) {
          /*
          setTimeout(() => {
            this.form.get('sUbigeo')?.setValue(selectedUbigeo.codigo.trim());
            this.encontrado = true;
          }, 1000);
          */
        }
      }
    );
  }

  listarPro(idDepartamento: string): void {
    this.ubigeoService.listPro(idDepartamento).subscribe(
      (data: UbigeoOut) => {
        this.ubigeoOut = data;
      },
      (error) => {},
      () => {
        if (this.ubigeoOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.ubigeoOut.message}`);
          return;
        }
        this.ubigeo = this.ubigeoOut.data;
      }
    );
  }

  listarDis(idDepartamento: string, idProvincia: string): void {
    this.ubigeoService.listDis(idDepartamento, idProvincia).subscribe(
      (data: UbigeoOut) => {
        this.ubigeoOut = data;
      },
      (error) => {},
      () => {
        if (this.ubigeoOut.code !== this.environment.CODE_000) {
          this.utilService.getAlert(`Aviso:`, `${this.ubigeoOut.message}`);
          return;
        }
        this.ubigeo = this.ubigeoOut.data;
      }
    );
  }

  setActivateValidation() {
    if (this.form.valid) {
      return;
    }

    if (this.required) {
      this.setValidatorRequired();
    }
  }

  setValidatorRequired() {
    if (this.form.controls['sUbigeo'].invalid) {
      this.form.controls['sUbigeo'].setValidators([Validators.required]);
      this.form.controls['sUbigeo'].setErrors({ required: true });
    }
    this.form.markAllAsTouched();
  }

  emitUbigeo(value: string) {
    this.ubigeoSelected.emit(value ? value : '');
  }
}
