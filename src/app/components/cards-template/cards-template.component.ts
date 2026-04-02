import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { ConfirmacaoExclusaoComponent } from '../confirmacao-exclusao/confirmacao-exclusao.component';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { DialogConfirmarRemocaoComponent } from '../dialog-confirmar-remocao/dialog-confirmar-remocao.component';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cards-template',
  templateUrl: './cards-template.component.html',
  styleUrls: ['./cards-template.component.css'],
})
export class CardsTemplateComponent {
  @Input() modulo!: Modulo;
  @Output() excluirModulo = new EventEmitter<{
    idAdm: number;
    senhaAdm: string;
    idExcluir: number;
  }>();

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private admService: ApiAdmService,
    private router: Router
  ) {}

  confirmarClonagem(): void {
    const dialogRef = this.dialog.open(DialogConfirmarRemocaoComponent, {
      width: '484px',
      height: '200px',
      panelClass: 'dialog-custom',
      data: {
        titulo: 'Clonar Módulo',
        mensagem: 'Gostaria de clonar este módulo para seu espaço pessoal??',
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        if (this.modulo?.id != null) {
          this.admService.clonarTemplate(this.modulo.id).subscribe(() => {
          this.admService.message(`Módulo ${this.modulo.nome_modulo} clonado com sucesso`)
          if (this.authService.isAdmin()){
            this.router.navigate(['/tecnocomp/modulos'])
          } else {
            this.router.navigate(['/tecnocomp/meus-modulos'])
          }
        });
        }
      }
    });
  }

  verMais(): void {
    console.log('Ver mais sobre o módulo:', this.modulo);
  }
}
