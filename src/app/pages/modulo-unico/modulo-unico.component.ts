import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { Topico } from 'src/interfaces/topico/Topico';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  selector: 'app-modulo-unico',
  templateUrl: './modulo-unico.component.html',
  styleUrls: ['./modulo-unico.component.css'],
})
export class ModuloUnicoComponent implements OnInit {
  modulo!: Modulo | null;
  topicos: Topico[] = [];
  idModulo!: number;

  progress = 0;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiAdmService,
    private router: Router,
    private snackBar: MatSnackBar,
    private uploadService: UploadService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {

      this.carregarModulo(+id);
      // this.carregarTopicos(+id);
      console.log('teste', this.modulo?.ebookUrlGeral)
    }
    if (this.modulo?.id != null) {
      this.idModulo = this.modulo.id;
    }
  }

  get ebookUrlCaminho(){
    return this.uploadService.getFileModuloByName(this.modulo?.nome_modulo!)
  }

  carregarModulo(id: number): void {
    this.apiService.obterModuloPorId(id).subscribe(
      (response) => {
        this.modulo = response;
        console.log(response)
      },
      (error) => {
        console.error('Erro ao carregar módulo:', error);
        this.router.navigate(['/modulos']);
      }
    );
  }

  // carregarTopicos(moduloId: number): void {
  //   this.apiService.obterTopicoCompleto(moduloId).subscribe(
  //     (response) => {
  //       console.log(response);
  //       this.topicos = response.map((topico) => ({
  //         ...topico,
  //         videoUrls: [],
  //         saibaMais: [],
  //         referencias: [],
  //         exercicios: [],
  //       }));

  //       // Para cada tópico, buscar os dados completos
  //       this.topicos.forEach((topico, index) => {
  //         if (topico.id != null) {
  //           this.apiService.obterTopicoCompleto(topico.id).subscribe(
  //             (topicoCompleto) => {
  //               this.topicos[index] = {
  //                 ...this.topicos[index],
  //                 ...topicoCompleto,
  //               };
  //             },
  //             (error) =>
  //               console.error(
  //                 'Erro ao carregar dados completos do tópico:',
  //                 error
  //               )
  //           );
  //         }
  //       });
  //     },
  //     (error) => console.error('Erro ao carregar tópicos:', error)
  //   );
  // }

  cadastrarTopico(): void {
    this.router.navigate(['/modulos', this.modulo?.id, 'cadastrar-topico']);
  }

  alterarPublicacao(): void {
    if (this.modulo) {
      const novoStatus = !this.modulo.publicado;
      if (this.modulo.id != null) {
        this.apiService
          .alterarStatusPublicacao(this.modulo.id, novoStatus)
          .subscribe(
            (moduloAtualizado) => {
              this.modulo = moduloAtualizado; // Atualiza o estado do módulo
              if (novoStatus){
                this.apiService.message("O módulo está publicado")
              } else {
                this.apiService.message("O módulo não está publicado")
              }

            },
            (error) => {
              console.error('Erro ao alterar status de publicação:', error);
              alert('Erro ao alterar status de publicação!');
            }
          );
      }
    }
  }

  templateModulo(): void {
    if (this.modulo) {
      const novoStatus = !this.modulo.template;
      if (this.modulo.id != null) {
        this.apiService
          .alterarTemplateModulo(this.modulo.id, novoStatus)
          .subscribe(
            (moduloAtualizado) => {
              this.modulo = moduloAtualizado;
              if (novoStatus) {
                this.apiService.message(`O módulo está como template para ser clonado`)
              } else {
                this.apiService.message(`O módulo não está como template para ser clonado`)
              }

            },
            (error) => {
              console.error(
                'Erro ao alterar o estado de template do modulo:',
                error
              );
              alert('Erro ao alterar o estado de template do modulo!');
            }
          );
      }
    }
  }

  // excluirTopico({
  //   idAdm,
  //   senhaAdm,
  //   idExcluir,
  // }: {
  //   idAdm: number;
  //   senhaAdm: string;
  //   idExcluir: number;
  // }) {
  //   console.log('ok2');
  //   this.apiService.excluirTopico(idExcluir, idAdm, senhaAdm).subscribe(
  //     () => {
  //       alert('Tópico excluído com sucesso!');
  //       this.topicos = this.topicos.filter((topico) => topico.id !== idExcluir);
  //     },
  //     (error) => {
  //       console.log(error);
  //       if (error.status === 401) {
  //         alert('Senha de administrador incorreta.');
  //       } else if (error.status === 403) {
  //         alert('Você não tem permissão para realizar essa ação.');
  //       } else if (error.status === 404) {
  //         alert('Tópico não encontrado.');
  //       } else {
  //         alert('Erro ao excluir tópico.');
  //       }
  //     }
  //   );
  // }
  copiarUUID() {
    if (!this.modulo?.uuid) {
      this.apiService.message('Falha ao copiar, UUID é nulo');
      return;
    }

    const textoParaCopiar = `uuid=${this.modulo.uuid}`;
    navigator.clipboard
      .writeText(textoParaCopiar)
      .then(() => {
        this.apiService.message('UUID copiado com sucesso!');
      })
      .catch((err) => console.error('Erro ao copiar UUID:', err));
  }
}
