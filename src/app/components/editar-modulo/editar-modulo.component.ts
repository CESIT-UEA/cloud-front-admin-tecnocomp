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
      (error) => console.error('Erro ao carregar módulo:', error)
    );
  }

  onSubmit(): void {
    if (this.moduloForm.invalid){
      this.moduloForm.markAllAsTouched()
      this.apiService.message('Por favor, preencha todos os campos corretamente.')
      return
    }
    if (!this.moduloForm.valid) return

    const dadosModulo: any = {
        nome_modulo: this.moduloForm.value.nome_modulo,
        nome_url: this.moduloForm.value.nome_url,
        video_inicial: this.moduloForm.value.video_inicial,
        filesDoModulo: this.moduloAtual.filesDoModulo,
        ebookUrlGeral: this.moduloAtual.ebookUrlGeral
   };

   if (this.selectedFile){
      const originalName = this.selectedFile.name;
      const extension = originalName.substring(originalName.lastIndexOf('.'));
      const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.'));
      const uuid = uuidv4();

      const sanitizedOriginalName = nameWithoutExtension
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')    
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, ''); 

      const uniqueFileName = `${sanitizedOriginalName}-${uuid}${extension}`

      this.renamedFile = new File([this.selectedFile], uniqueFileName, { type: this.selectedFile.type })

      dadosModulo.ebookUrlGeral = `${this.baseUrlFile}/${dadosModulo.filesDoModulo}/${this.renamedFile.name}`

      this.uploadService.uploadFile(
        this.renamedFile, 
        dadosModulo.filesDoModulo, 
        `${this.uploadService.baseURL}/api/modulos/upload`
      ).subscribe({
        next: () => this.atualizarModulo(this.moduloId, dadosModulo),
        error:  err => console.error('Erro no upload', err)
      })
   } else {
      this.atualizarModulo(this.moduloId, dadosModulo)
   }
  }


  private atualizarModulo(id: number, dadosModulo: any): void {
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
      (error) => console.error('Erro ao atualizar módulo:', error)
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
    if (file){
      this.selectedFile = file
    }
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
