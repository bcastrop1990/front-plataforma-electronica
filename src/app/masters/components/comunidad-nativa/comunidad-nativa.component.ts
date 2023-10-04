import { Component, OnInit, Input } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { environment } from 'src/environments/environment';
import {UtilService} from "../../../shared/services/util.service";

@Component({
  selector: 'app-comunidad-nativa',
  templateUrl: './comunidad-nativa.component.html',
  styleUrls: ['./comunidad-nativa.component.scss']
})
export class ComunidadNativaComponent implements OnInit {

  environment: any;
  form!: FormGroup;

  @Input() required: boolean = false;

  constructor(private formBuilder: FormBuilder,
              public utilService: UtilService) { }

  ngOnInit(): void {
    this.environment = environment;

    this.form = this.formBuilder.group({
      idComunidadNativa: ['', this.required ? [Validators.required] : []],
    });
  }

}
