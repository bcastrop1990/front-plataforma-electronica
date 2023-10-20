import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { User } from 'src/app/auth/models/user.model';
import { BusquedaData } from 'src/app/core/seguimiento/models/busqueda.model';
import { OptionsComponent } from 'src/app/masters/components/options/options.component';
import { Options, OptionsOut } from 'src/app/masters/models/option.model';
import { MaestrosService } from 'src/app/masters/services/maestros.service';
import { UtilService } from 'src/app/shared/services/util.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gs-reasignar',
  templateUrl: './gs-reasignar.component.html',
  styleUrls: ['./gs-reasignar.component.scss'],
})
export class GsReasignarComponent implements OnInit {
  environment: any;
  title!: string;
  //ESTADO INICIAL DEL ICONO
  asingado = false;
  form!: FormGroup;

  dataResult!: MatTableDataSource<BusquedaData>;
  selection = new SelectionModel<BusquedaData>(true, []);

  analistasOut!: OptionsOut;
  analistas: Options[] = [];

  @ViewChild('cboAnalista') cboAnalista!: OptionsComponent;
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

  user?: User;

  constructor(
    public utilService: UtilService,
    private maestrosService: MaestrosService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any,
    public dialog2: MatDialogRef<GsReasignarComponent>
  ) {}

  ngOnInit(): void {
    this.environment = environment;
    this.getAnalistas();
    this.form = this.formBuilder.group({
      codigoAnalistaAsignado: [this.esAnalista() ? this.user?.dni : ''],
    });
  }

  esAnalista(): boolean {
    return this.user?.perfil.codigo === this.environment.PERFIL_ANALISTA;
  }

  cancel() {
    this.dialog2.close();
  }

  // OBTENER LA LISTA DE ANALISTAS
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
    console.log(id);
    this.form.controls['codigoAnalistaAsignado'].setValue(id);
  }
}
