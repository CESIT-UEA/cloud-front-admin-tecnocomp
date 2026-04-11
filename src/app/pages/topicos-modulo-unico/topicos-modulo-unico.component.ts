import { ApiAdmService } from 'src/app/services/api-adm.service';
import { Component, OnInit } from '@angular/core';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { Topico } from 'src/interfaces/topico/Topico';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginationService, PaginationState } from 'src/app/services/pagination.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-topicos-modulo-unico',
  templateUrl: './topicos-modulo-unico.component.html',
  styleUrls: ['./topicos-modulo-unico.component.css']
})
export class TopicosModuloUnicoComponent implements OnInit {
  topicos: Topico[] = [];
  idModulo!: number;
  pagination: PaginationState;

  constructor(
    private apiService: ApiAdmService,
    private route: ActivatedRoute,
    private paginationService: PaginationService,
    private authService: AuthService,
    private router: Router
  ){
    this.pagination = this.paginationService.createPaginationState();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id_modulo');
    if (id) {
      this.carregarTopicos(+id, this.pagination.currentPage);
      this.idModulo = +id;
    }
  }

  // Handler para mudanças de página
  onPageChange(page: number): void {
    this.carregarTopicos(this.idModulo, page);
  }

  carregarTopicos(moduloId: number, page: number): void {
    this.apiService.obterTopicoCompleto(moduloId, page).subscribe(
      (response) => {
        this.topicos = response.topico.map((topico) => ({
          ...topico,
          videoUrls: [],
          saibaMais: [],
          referencias: [],
          exercicios: [],
        }));

        // Para cada tópico, buscar os dados completos
        // this.topicos.forEach((topico, index) => {
        //   if (topico.id != null) {
        //     this.apiService.obterTopicoCompleto(topico.id, page).subscribe(
        //       (topicoCompleto) => {
        //         this.topicos[index] = {
        //           ...this.topicos[index],
        //           ...topicoCompleto,
        //         };
        //       },
        //       (error) =>
        //         console.error(
        //           'Erro ao carregar dados completos do tópico:',
        //           error
        //         )
        //     );
        //   }
        // });
        
        // Atualizar o estado de paginação
        this.paginationService.updatePaginationState(
          this.pagination,
          response.infoTopicosPorModulos.totalPaginas,
          response.infoTopicosPorModulos.totalRegistros
        );
      },
      (error) => {
        if (error.status === 404) {
           this.apiService.message('Módulo não encontrado ou você não tem acesso.');
           if (this.authService.isAdmin()){
              this.router.navigate(['tecnocomp/modulos']);
            } else {
              this.router.navigate(['/tecnocomp/meus-modulos'])
            }
        } 
        
      }
    );
  }

  excluirTopico({
    idUsuario,
    palavraConfirmacao,
    idExcluir,
  }: {
    idUsuario: number;
    palavraConfirmacao: string;
    idExcluir: number;
  }) {
    
    this.apiService.excluirTopico(idExcluir, idUsuario, palavraConfirmacao).subscribe(
      () => {
        this.apiService.message('Tópico excluído com sucesso!')
        this.topicos = this.topicos.filter((topico) => topico.id !== idExcluir);
        this.pagination = this.paginationService.createPaginationState();
        this.carregarTopicos(this.idModulo, this.pagination.currentPage)
      },
      (error) => {
        console.log(error);
        this.apiService.message(error.error.error)
      }
    );
  }
}
