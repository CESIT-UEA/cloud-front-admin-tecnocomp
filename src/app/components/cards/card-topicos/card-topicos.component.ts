import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Topico } from 'src/interfaces/topico/Topico';
import { ConfirmacaoExclusaoComponent } from '../../confirmacao-exclusao/confirmacao-exclusao.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { VerAoVivoService } from 'src/app/services/ver-ao-vivo.service';
import { Router } from '@angular/router';
import { ConfirmacaoExclusaoProfessorComponent } from '../../confirmacao-exclusao-professor/confirmacao-exclusao-professor.component';

@Component({
  selector: 'app-card-topicos',
  templateUrl: './card-topicos.component.html',
  styleUrls: ['./card-topicos.component.css']
})
export class CardTopicosComponent implements OnInit {

  ngOnInit(): void {}

  @Input() topico!: Topico;
  @Input() idModulo!: number;
  @Input() indice!: number;

  @Output() excluirTopico = new EventEmitter<{
    idUsuario: number;
    palavraConfirmacao: string;
    idExcluir: number;
  }>();

  constructor(private dialog: MatDialog, private authService: AuthService, private verAoVivo: VerAoVivoService, private router: Router) {}

  abrirConfirmacaoExcluir(): void {
      const dialogRef = this.dialog.open(ConfirmacaoExclusaoComponent, {
        width: '484px',
        height: '219.952px',
        panelClass: 'dialog-remove-custom',
        data: {
          titulo: "tópico",
        }
      });

      dialogRef.afterClosed().subscribe((palavraConfirmacao) => {
        if (palavraConfirmacao) {
          if (this.topico.id != null) {
            this.excluirTopico.emit({
              idUsuario: this.authService.getUsuarioDados().id,
              palavraConfirmacao: palavraConfirmacao,
              idExcluir: this.topico.id,
            });
          }
        }
      });
    
  }

  sincronizarTopico(idTopico: number){
    this.verAoVivo.controll_topico = idTopico;
    this.router.navigate([`/ver-ao-vivo/${this.idModulo}/topicos`])
  }
}