import { Component, OnInit } from '@angular/core';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { PaginationService, PaginationState } from 'src/app/services/pagination.service';
import { Plataforma } from 'src/interfaces/Plataforma';

@Component({
  selector: 'app-plataforma-page',
  templateUrl: './plataforma-page.component.html',
  styleUrls: ['./plataforma-page.component.css']
})
export class PlataformaPageComponent implements OnInit {
  plataformas: Plataforma[] = [];
  pagination: PaginationState;

  constructor(
    private apiService: ApiAdmService,
    private paginationService: PaginationService
  ) {
    this.pagination = this.paginationService.createPaginationState();
  }

  ngOnInit(): void {
    this.carregarPlataformasPaginadas(this.pagination.currentPage);
  }

  // Handler para mudanças de página
  onPageChange(page: number): void {
    this.carregarPlataformasPaginadas(page);
  }

  excluirPlataforma({ idUsuario, palavraConfirmacao, idExcluir }: { idUsuario: number; palavraConfirmacao: string; idExcluir: number }) {
    this.apiService.excluirPlataforma(idUsuario, palavraConfirmacao, idExcluir).subscribe(
      () => {
        this.apiService.message("Plataforma excluída com sucesso!")
        this.plataformas = this.plataformas.filter((plataforma) => plataforma.id !== idExcluir);
        this.pagination = this.paginationService.createPaginationState();
        this.carregarPlataformasPaginadas(this.pagination.currentPage)
      },
      (error) => {
        console.error('Erro ao excluir plataforma:', error);
        if (error.status === 401) {
          this.apiService.message('Senha incorreta.')
        } else if (error.status === 403) {
          this.apiService.message('Você não tem permissão para realizar essa ação.')
        } else if (error.status === 404) {
          this.apiService.message('Plataforma não encontrada.')
        }
          else if (error.status === 409) {
            this.apiService.message('Não é possível excluir a plataforma porque existem alunos vinculados.');

        } else {
          this.apiService.message(error.error.error)
        }
      }
    );
  }

  carregarPlataformasPaginadas(page: number) {
    this.apiService.listarPlataformas(page).subscribe(
      (response) => {
        console.log(response.plataformas);
        this.plataformas = response.plataformas;
        this.paginationService.updatePaginationState(
          this.pagination,
          response.infoPlataformas.totalPaginas,
          response.infoPlataformas.totalRegistros
        );
        console.log(response);
      },
      (error) => {
        console.error('Erro ao carregar plataformas:', error);
      }
    );
  }
}
