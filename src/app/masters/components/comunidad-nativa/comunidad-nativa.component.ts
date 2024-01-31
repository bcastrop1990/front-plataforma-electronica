import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilService } from 'src/app/shared/services/util.service';
import { environment } from 'src/environments/environment';
import { UbigeoOut, Ubigeo } from '../../models/ubigeo.model';
import { UbigeoService } from '../../services/ubigeo.service';

@Component({
  selector: 'app-comunidad-nativa',
  templateUrl: './comunidad-nativa.component.html',
  styleUrls: ['./comunidad-nativa.component.scss'],
})
export class ComunidadNativaComponent implements OnInit {
  environment: any;
  form!: FormGroup;

  ubigeoOut!: UbigeoOut;
  ubigeo!: Ubigeo[];

  @Input() encontrado: boolean = false;
  @Input() exCentroPoblado: boolean = false;

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
      this.listarComunidadNativa(
        this.departamentoEncontrado,
        this.provinciaEncontrado,
        this.distritoEncontrado
      );
      this.form.controls['sUbigeo'].setValue(this.centroEncontrado);
      this.encontrado = true;
    } else {
      if (this.idDepartamento && this.idProvincia && this.idDistrito) {
        this.listarComunidadNativa(
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

  listarComunidadNativa(
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
          this.ubigeo = this.ubigeoOut.data.filter((centro) => {
            return centro.coDeno === '02';
          });
        }
      );
  }

  emitSelected() {
    this.selected.emit(true);
    localStorage.setItem('comunidad', '02');
  }

  emitCentroPoblado(value: string) {
    this.ubigeoSelected.emit(value ? value : '');
  }
}
