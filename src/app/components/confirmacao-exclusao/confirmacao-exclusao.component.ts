import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-confirmacao-exclusao',
  templateUrl: './confirmacao-exclusao.component.html',
  styleUrls: ['./confirmacao-exclusao.component.css']
})
export class ConfirmacaoExclusaoComponent implements OnInit{
  palavraConfirmacao = new FormControl('', Validators.required);
  placeholder!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { titulo: string },
    public dialogRef: MatDialogRef<ConfirmacaoExclusaoComponent>
  ) {}

  ngOnInit(): void {
    this.placeholder = `Nome ${this.data.titulo}`
  }

  onConfirmar(): void {
    if (this.palavraConfirmacao.invalid) {
      this.palavraConfirmacao.markAsTouched();
      return;
  }

  this.dialogRef.close(this.palavraConfirmacao.value);
  }

  onCancelar(): void {
    this.dialogRef.close();
  }
}
