import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { Plataforma } from 'src/interfaces/Plataforma';
import { ConfirmacaoExclusaoComponent } from '../../confirmacao-exclusao/confirmacao-exclusao.component';
import { ConfirmacaoExclusaoProfessorComponent } from '../../confirmacao-exclusao-professor/confirmacao-exclusao-professor.component';

@Component({
  selector: 'app-cards-plataformas',
  templateUrl: './cards-plataformas.component.html',
  styleUrls: ['./cards-plataformas.component.css'],
})
export class CardsPlataformasComponent {
  @Input() plataforma!: Plataforma;
  @Output() excluirPlataforma = new EventEmitter<{
    idUsuario: number;
    palavraConfirmacao: string;
    idExcluir: number;
  }>();

  constructor(private dialog: MatDialog, private authService: AuthService) {}

  abrirConfirmacaoExcluir() {
    const dialogRef = this.dialog.open(ConfirmacaoExclusaoComponent, {
          width: '484px',
          height: '219.952px',
          panelClass: 'cardExclusao',
          data: {
            titulo: "Plataforma",
          }
  });

    dialogRef.afterClosed().subscribe((palavraConfirmacao) => {
      if (palavraConfirmacao) {
        if (this.plataforma.id != null) {
          this.excluirPlataforma.emit({
            idUsuario: this.getUsuarioDados().id,
            palavraConfirmacao: palavraConfirmacao,
            idExcluir: this.plataforma.id,
          });
        }
      }
    });
  }
    
  getUsuarioDados() {
    return this.authService.getUsuarioDados();
  }
}
