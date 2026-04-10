import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { ConfirmacaoExclusaoComponent } from '../../confirmacao-exclusao/confirmacao-exclusao.component';
import { AuthService } from 'src/app/auth/auth.service';
import { PreviousRouteService } from 'src/app/services/previous-route.service';
import { ConfirmacaoExclusaoProfessorComponent } from '../../confirmacao-exclusao-professor/confirmacao-exclusao-professor.component';

@Component({
  selector: 'app-cards-modulos',
  templateUrl: './cards-modulos.component.html',
  styleUrls: ['./cards-modulos.component.css'],
})
export class CardsModulosComponent implements OnInit {
  @Input() modulo!: Modulo;
  @Input() moduloParaAdmin!: boolean;
  @Output() excluirModulo = new EventEmitter<{
    idUsuario: number;
    palavraConfirmacao: string;
    idExcluir: number;
  }>();

  constructor(
    private dialog: MatDialog, 
    private authService: AuthService,
    private previousRouter: PreviousRouteService
  ) {}

  ngOnInit(): void {
      
  }

  abrirConfirmacaoExcluir(): void {
    const dialogRef = this.dialog.open(ConfirmacaoExclusaoComponent, {
          width: '484px',
          height: '219.952px',
          panelClass: 'cardExclusao',
          data: {
            titulo: "Módulo"
          }
          
      });
      dialogRef.afterClosed().subscribe((palavraConfirmacao) => {
      if (palavraConfirmacao) {
        if (this.modulo.id != null) {
          this.excluirModulo.emit({
            idUsuario: this.authService.getUsuarioDados().id,
            palavraConfirmacao: palavraConfirmacao,
            idExcluir: this.modulo.id,
          });
        }
      }
      });
   
  }

  verMais(): void {
    // Lógica para exibir mais detalhes do módulo
    console.log('Ver mais sobre o módulo:', this.modulo);
  }
}
