import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { PreviousRouteService } from 'src/app/services/previous-route.service';
import { UploadService } from 'src/app/services/upload.service';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-editar-modulo',
  templateUrl: './editar-modulo.component.html',
  styleUrls: ['./editar-modulo.component.css'],
})
export class EditarModuloComponent {
  moduloForm: FormGroup = new FormGroup({
    nome_modulo: new FormControl('', Validators.required),
    nome_url: new FormControl('', Validators.required),
    ebookUrlGeral: new FormControl(''),
    video_inicial: new FormControl('', Validators.required),
  });
  moduloId!: number;

  renamedFile!: File;
  selectedFile: File | null = null;
  moduloAtual!: Modulo;
  baseUrlFile: string = `https://apiadmin.tecnocomp.cloud/ebooks`;
  urlApiRag: string = 'https://tecnocomp.uea.edu.br:5678/webhook/upload-file'
  nomeArquivo: string | undefined = ''

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiAdmService,
    private router: Router,
    private authService: AuthService,
    private uploadService: UploadService,
    private previousRouter: PreviousRouteService,
    private location: Location
  ) {}

  voltarPagina() {
    this.location.back();
  }

  ngOnInit(): void {
    this.moduloId = +this.route.snapshot.paramMap.get('id')!;
    this.carregarModulo();
    console.log('Rota anterior', this.previousRouter.getPreviousUrl())

    
  }

  carregarModulo(): void {
    this.apiService.obterModuloPorId(this.moduloId).subscribe(
      (modulo: Modulo) => {
        this.moduloAtual = modulo;

        console.log(modulo);
        this.moduloForm.patchValue({
          nome_modulo: modulo.nome_modulo,
          nome_url: modulo.nome_url,
          
          video_inicial: modulo.video_inicial,
        });
        if (modulo.ebookUrlGeral) {
          this.nomeArquivo = modulo.ebookUrlGeral.split('/').pop();
      }
      },
      (error) => {
        if (error.status === 404) {
             this.apiService.message('Módulo não encontrado ou você não tem acesso.');
          if (this.authService.isAdmin()){
              this.router.navigate(['tecnocomp/modulos']);
            } else {
              this.router.navigate(['/tecnocomp/meus-modulos'])
            }
          
      } else {
        this.apiService.message('Erro ao carregar módulo.');
      }
      }
    );
  }

  onSubmit(): void {
    if (this.moduloForm.invalid){
      this.moduloForm.markAllAsTouched()
      this.apiService.message('Por favor, preencha todos os campos corretamente.')
      return
    }
    
    const formData = new FormData();
    const formValues = this.moduloForm.getRawValue();

    formData.append('nome_modulo', formValues.nome_modulo || '');
    formData.append('nome_url', formValues.nome_url || '');
    formData.append('video_inicial', formValues.video_inicial || '');
    formData.append('usuario_id', String(this.authService.getUsuarioDados().id));

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }
    this.atualizarModulo(this.moduloId, formData)
  }


  private atualizarModulo(id: number, dadosModulo: FormData): void {
  this.apiService
    .atualizarModulo(id, dadosModulo)
    .subscribe(
      () => {
        this.apiService.message('Módulo atualizado com sucesso!');

        if (this.authService.isAdmin()) {
          this.router.navigate(['/tecnocomp/modulos']);
        } else if (this.authService.isProfessor()) {
          this.router.navigate(['/tecnocomp/meus-modulos']);
        }
      },
      (error) => {
        if (error.status === 404) {
          this.apiService.message('Módulo não encontrado ou você não tem permissão.');
        } else if (error.status === 401) {
          this.apiService.message('Sessão expirada. Faça login novamente.');
        } else if (error.status === 403) {
          this.apiService.message('Você não tem permissão para essa ação.');
        } else {
          this.apiService.message('Erro ao atualizar módulo.');
        }
      }
    );
}

  gerarUrlAmigavel(): void {
    const nomeModulo = this.moduloForm.get('nome_modulo')?.value || '';

    const urlAmigavel = nomeModulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-');

    this.moduloForm.patchValue({ nome_url: urlAmigavel });
  }

  onSelectedFile(event: any){
    const file = event.target.files[0];
    if (!file) return

    const input = event.target;
    
    if (file.type !== 'application/pdf') {
      this.apiService.message('Apenas arquivos PDF são permitidos.');
      this.selectedFile = null;

      input.value = ''
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      this.apiService.message('O arquivo deve ter no máximo 10MB.');
      this.selectedFile = null;

      input.value = ''
      return;
    }

    this.selectedFile = file;
  }

  // voltar(){
  //   const rotaAnterior = this.previousRouter.getPreviousUrl();
  //   const rotas = ['/tecnocomp/modulos', '/tecnocomp/meus-modulos', '/tecnocomp/meu-perfil']
  //   const isAdmin = this.authService.isAdmin()

  //   if (isAdmin && rotas[0] === rotaAnterior) {
  //     this.router.navigate([rotas[0]])

  //   } else if (rotas[2] === rotaAnterior ) {
  //     this.router.navigate([rotas[2]])
  //   } else if (!isAdmin && rotas[1] === rotaAnterior){
  //     this.router.navigate([rotas[1]])
  //   } 
    
  // }
}
