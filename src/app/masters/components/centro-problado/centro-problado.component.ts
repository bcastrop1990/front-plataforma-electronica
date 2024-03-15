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
import { UtilService } from '../../../shared/services/util.service';
import { UbigeoService } from '../../services/ubigeo.service';
import { Ubigeo, UbigeoOut } from '../../models/ubigeo.model';

@Component({
  selector: 'app-centro-problado',
  templateUrl: './centro-problado.component.html',
  styleUrls: ['./centro-problado.component.scss'],
})
export class CentroProbladoComponent implements OnInit, OnChanges {
  environment: any;
  form!: FormGroup;

  ubigeoOut!: UbigeoOut;
  ubigeo!: Ubigeo[];

  @Input() encontrado: boolean = false;
  @Input() exComunidadNativa: boolean = false;

  @Input() required: boolean = false;
  @Input() idDepartamento: string = '';
  @Input() idProvincia: string = '';
  @Input() idDistrito: string = '';

  @Input() departamentoEncontrado: string = '';
  @Input() provinciaEncontrado: string = '';
  @Input() distritoEncontrado: string = '';
  @Input() centroEncontrado: string = '';

  @Output() ubigeoSelected: EventEmitter<string> = new EventEmitter();
  @Output() selected: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    public utilService: UtilService,
    private ubigeoService: UbigeoService
  ) {}

  ngOnInit(): void {
    this.environment = environment;

    this.form = this.formBuilder.group({
      sUbigeo: ['', this.required ? [Validators.required] : []],
    });

    this.validate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.form) {
      this.validate();
    }
  }

  validate(): void {
    if (this.centroEncontrado) {
      this.listarCentroPoblado(
        this.departamentoEncontrado,
        this.provinciaEncontrado,
        this.distritoEncontrado
      );
      this.form.controls['sUbigeo'].setValue(this.centroEncontrado);
      this.encontrado = true;
    } else {
      if (this.idDepartamento && this.idProvincia && this.idDistrito) {
        this.listarCentroPoblado(
          this.idDepartamento,
          this.idProvincia,
          this.idDistrito
        );
      } else {
        this.form.controls['sUbigeo'].setValue('');
        this.ubigeo = [];
      }
    }
  }

  listarCentroPoblado(
    idDepartamento: string,
    idProvincia: string,
    idDistrito: string
  ): void {
    this.ubigeoService
      .listCentroPoblado(idDepartamento, idProvincia, idDistrito)
      .subscribe(
        (data: UbigeoOut) => {
          this.ubigeoOut = data;
        },
        (error) => {},
        () => {
          if (this.ubigeoOut.code !== this.environment.CODE_000) {
            this.utilService.getAlert(`Aviso:`, `${this.ubigeoOut.message}`);
            return;
          }
          this.selected.emit(false);

          this.ubigeo = this.ubigeoOut.data.filter((centro) => {
            return centro.coDeno !== '02';
          });
        }
      );
  }

  emitSelected(value: string) {
    this.selected.emit(value ? true : false);
    localStorage.setItem('comunidad', '01');
  }

  emitCentroPoblado(value: string) {
    this.ubigeoSelected.emit(value ? value : '');
  }
}
