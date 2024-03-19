import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilService } from 'src/app/shared/services/util.service';

@Component({
  selector: 'app-gs-analista',
  templateUrl: './gs-analista.component.html',
  styleUrls: ['./gs-analista.component.scss'],
})
export class GsAnalistaComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public utilService: UtilService,
    public dialog: MatDialogRef<GsAnalistaComponent>,
    @Inject(MAT_DIALOG_DATA) public dataDialog: any
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      id: ['', Validators.required],
    });
  }

  setAnalista(id: any) {
    this.form.controls['id'].setValue(id);
  }

  confirm() {
    if (this.form.invalid) {
      this.utilService.getAlert(`Aviso:`, 'Se debe elegir un analista');
      return;
    }
    this.dialog.close({ sw: true, id: this.form.controls['id'].value });
  }

  cancel() {
    this.dialog.close({ sw: false, id: 0 });
  }

  @HostListener('window:keyup.esc') onKeyUp() {
    this.cancel();
  }
}
