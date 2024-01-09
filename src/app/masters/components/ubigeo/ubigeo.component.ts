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

  @Input() required: boolean = false;
  @Input() type: string = '';
  @Input() idDepartamento: string = '';
  @Input() idProvincia: string = '';
  @Input() departamentoEncontrado: string = '';
  @Input() provinciaEncontrado: string = '';
  @Input() distritoEncontrado: string = '';

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
        if (this.departamentoEncontrado) {
          console.log(
            'ID DEPARTAMENTO DENTRO DE DES: ' + this.departamentoEncontrado
          );
          this.form.controls['sUbigeo'].setValue(this.departamentoEncontrado);
          this.encontrado = true;
        }
        this.label = 'Departamento';
        this.listarDep();
        break;
      case 'PRO':
        this.label = 'Provincia';

        this.form.controls['sUbigeo'].setValue('');
        this.ubigeo = [];

        if (this.departamentoEncontrado) {
          this.listarPro(this.departamentoEncontrado);
          this.form.controls['sUbigeo'].setValue(this.provinciaEncontrado);
          this.encontrado = true;
        } else if (this.idDepartamento) {
          this.listarPro(this.idDepartamento);
          this.form.controls['sUbigeo'].setValue('');
        }
        break;
      case 'DIS':
        console.log('DIS: ' + this.distritoEncontrado);

        this.label = 'Distrito';

        this.form.controls['sUbigeo'].setValue('');
        this.ubigeo = [];

        if (this.distritoEncontrado) {
          this.listarDis(this.departamentoEncontrado, this.provinciaEncontrado);
          this.form.controls['sUbigeo'].setValue(this.distritoEncontrado);
          this.encontrado = true;
        } else {
          if (this.idDepartamento) {
            this.form.controls['sUbigeo'].setValue('');
            this.ubigeo = [];
          }
          if (this.idDepartamento && this.idProvincia) {
            this.listarDis(this.idDepartamento, this.idProvincia);
            this.form.controls['sUbigeo'].setValue('');
          }
        }
        break;
    }
  }

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
