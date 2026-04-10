import { Component, OnInit } from '@angular/core';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { PaginationService, PaginationState } from 'src/app/services/pagination.service';
import { PreviousRouteService } from 'src/app/services/previous-route.service';
import { User } from 'src/interfaces/user';

@Component({
  selector: 'app-usuarios-page',
  templateUrl: './usuarios-page.component.html',
  styleUrls: ['./usuarios-page.component.css']
})
export class UsuariosPageComponent implements OnInit {
  usuarios: User[] = [];
  pagination: PaginationState;
  totalPaginas!: number;
  totalRegistro!: number;

  constructor(
    private userService: ApiAdmService,
    private paginationService: PaginationService
  ) {
    this.pagination = this.paginationService.createPaginationState();
  }

  ngOnInit(): void {
    this.carregarUsuariosPaginados(this.pagination.currentPage);
  }

  // Handler para mudanças de página
  onPageChange(page: number): void {
    this.carregarUsuariosPaginados(page);
  }

  excluirUsuario({ idAdm, palavraConfirmacao, idExcluir }: { idAdm: number; palavraConfirmacao: string; idExcluir: number }) {
    this.userService.excluirUsuario(idAdm, palavraConfirmacao, idExcluir).subscribe(
      () => {
        this.userService.message('Usuário excluído com sucesso!')
        
        this.usuarios = this.usuarios.filter((user) => user.id !== idExcluir);
        this.pagination = this.paginationService.createPaginationState();
        this.carregarUsuariosPaginados(this.pagination.currentPage)
      },
      (error) => {
        console.log(error);
        this.userService.message(error.error.error)
      }
    );
  }

  carregarUsuariosPaginados(page: number) {
    this.userService.listarUsers(page).subscribe(
      (response) => {
        this.usuarios = response.users;
        this.totalPaginas = response.infoUsers.totalPaginas
        this.totalRegistro = response.infoUsers.totalRegistros
        this.paginationService.updatePaginationState(
          this.pagination,
          response.infoUsers.totalPaginas,
          response.infoUsers.totalRegistros
        );
      },
      (error) => {
        console.error('Erro ao carregar usuários:', error);
      }
    );
  }
}
