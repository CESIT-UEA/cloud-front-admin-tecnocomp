import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AlunoGerenciamentoService } from 'src/app/services/aluno-gerenciamento.service';
import { AlunoModulo } from 'src/interfaces/modulo/aluno-modulo.interface';
import { DialogConfirmarRemocaoComponent } from '../dialog-confirmar-remocao/dialog-confirmar-remocao.component';
import { DialogEditarAlunoComponent } from '../dialog-editar-aluno/dialog-editar-aluno.component';
import { PaginationService, PaginationState } from 'src/app/services/pagination.service';

@Component({
  selector: 'app-gerenciar-alunos',
  templateUrl: './gerenciar-alunos.component.html',
  styleUrls: ['./gerenciar-alunos.component.css'],
})
export class GerenciarAlunosComponent {
  moduloId!: number;
  alunos: AlunoModulo[] = [];
  totalAlunos = 0;
  paginacao = {
  totalPaginas: 0,
  totalRegistros: 0
};
  pagination: PaginationState;

  filtros: {
    nome?: string;
    email?: string;
    ativo?: boolean;
    progressoMin?: number;
    notaMin?: number;
  } = {};

  constructor(
    private route: ActivatedRoute,
    private alunoService: AlunoGerenciamentoService,
    private dialog: MatDialog,
    private paginationService: PaginationService
  ) {
    this.pagination = this.paginationService.createPaginationState();
  }

  ngOnInit(): void {
    this.moduloId = +this.route.snapshot.paramMap.get('id')!;
    this.carregarAlunos(this.pagination.currentPage);
    
  }


  // Handler para mudanças de página
  onPageChange(page: number): void {
    this.carregarAlunos(page);
  }

  carregarAlunos(page: number): void {
    this.alunoService
      .getAlunosPorModulo(this.moduloId, page, this.filtros)
      .subscribe({
        next: (res) => {
          this.alunos = res.alunos
          console.log(this.alunos) 
          this.totalAlunos = res.infoAlunos.totalRegistros;
        this.paginationService.updatePaginationState(
          this.pagination, 
          res.infoAlunos.totalPaginas, 
          res.infoAlunos.totalRegistros
        );
        this.pagination.currentPage = page;
        },
        error: (err) => console.error('Erro ao carregar alunos:', err),
      });
  }

  confirmarRemocao(aluno: AlunoModulo): void {
    const dialogRef = this.dialog.open(DialogConfirmarRemocaoComponent, {
      width: '350px',
      data: {
        titulo: 'Remover Aluno',
        mensagem: `Deseja remover o aluno "${aluno.Aluno?.nome}" deste módulo?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.alunoService.deletarAluno(aluno.id_aluno).subscribe(() => {
          this.carregarAlunos(this.pagination.currentPage);
        });
      }
    });
  }

  editarAluno(aluno: AlunoModulo): void {
    const dialogRef = this.dialog.open(DialogEditarAlunoComponent, {
      width: '400px',
      data: aluno,
    });

    dialogRef
      .afterClosed()
      .subscribe((dadosAtualizados: Partial<AlunoModulo>) => {
        if (dadosAtualizados) {
          this.alunoService
            .atualizarAluno(aluno.id, dadosAtualizados)
            .subscribe(() => {
              this.carregarAlunos(this.pagination.currentPage);
            });
        }
      });
  }

  aplicarFiltros(): void {
    this.carregarAlunos(this.pagination.currentPage);
  }

  limparFiltros(): void {
    this.filtros = {};
    this.carregarAlunos(this.pagination.currentPage);
  }

  // Assunto --> Altera o valor dos filtros numéricos manualmente (Soma ou Subtração)
  alterarValorFiltro(campo: 'progressoMin' | 'notaMin', delta: number): void {
    const valorAtual = this.filtros[campo] ?? 0;
    const novoValor = valorAtual + delta;
    
    // Assunto --> Impede que o valor seja menor que zero (Filtros de progresso/nota não são negativos)
    this.filtros[campo] = novoValor < 0 ? 0 : novoValor;
  }
}
