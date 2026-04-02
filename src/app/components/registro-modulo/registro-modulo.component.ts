import { Location } from '@angular/common';
import { UploadService } from './../../services/upload.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { PreviousRouteService } from 'src/app/services/previous-route.service';
import { Modulo } from 'src/interfaces/modulo/Modulo';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-registro-modulo',
  templateUrl: './registro-modulo.component.html',
  styleUrls: ['./registro-modulo.component.css']
})
export class RegistroModuloComponent implements OnInit {
  renamedFile!: File;
  nomePasta!: string;
  baseUrlFile: string = `https://apiadmin.tecnocomp.cloud/ebooks`;
  urlApiRag: string = 'https://tecnocomp.uea.edu.br:5678/webhook/upload-file'
  tentouSubmeter = false

  moduloForm = new FormGroup({
    nome_modulo: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    nome_url: new FormControl('', [Validators.required, Validators.maxLength(40)]),
    ebookUrlGeral: new FormControl(''),
    video_inicial: new FormControl('', Validators.required)
  });

  selectedFile: File | null = null

  constructor(
    private apiService: ApiAdmService, 
    private router: Router, 
    private authService: AuthService,
    private uploadService: UploadService,
    private previousRouter: PreviousRouteService,
    private location: Location
  ) {}

  ngOnInit(): void {
  
  }

  gerarUrlAmigavel(): void {
    const nomeModulo = this.moduloForm.get('nome_modulo')?.value || '';

    const urlAmigavel = nomeModulo
      .toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-');

    this.moduloForm.patchValue({ nome_url: urlAmigavel });
  }

  voltarPagina() {
    this.location.back();
  }


  onSubmit(): void {
    if (this.moduloForm.invalid || !this.selectedFile){
      this.moduloForm.markAllAsTouched()
      this.tentouSubmeter = true
      this.apiService.message('Por favor, preencha todos os campos corretamente.')
      return
    }

    if (this.moduloForm.valid && this.selectedFile) {
      const modulo = {
        nome_modulo: this.moduloForm.get('nome_modulo')?.value,
        nome_url: this.moduloForm.get('nome_url')?.value,
        ebookUrlGeral: this.moduloForm.get('ebookUrlGeral')?.value,
        video_inicial: this.moduloForm.get('video_inicial')?.value,
        usuario_id: this.authService.getUsuarioDados().id,
        filesDoModulo: this.moduloForm.get('nome_url')?.value
      };

      // verifica se tem arquivo e faz tratamento do nome
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

            const nomeModuloAmigavel = this.moduloForm.get('nome_url')?.value || '';

            this.nomePasta = `${nomeModuloAmigavel}-${uuid}`
            modulo.filesDoModulo = this.nomePasta
            modulo.ebookUrlGeral = `${this.baseUrlFile}/${this.nomePasta}/${this.renamedFile.name}`
      }

      this.apiService.registerModulo(modulo).subscribe({
        next: response => {
          
           // verifica se tem arquivo e faz upload
        if (this.selectedFile && this.renamedFile && this.nomePasta){
            this.uploadService.uploadFile(
              this.renamedFile, 
              this.nomePasta, 
              `${this.uploadService.baseURL}/api/modulos/upload`
        ).subscribe({
            next: () => {
              // faz upload de arquivo para o fluxo do n8n vetorizar
              this.uploadFileRAG(this.renamedFile, this.nomePasta, this.urlApiRag).subscribe({
                next: () => {
                  console.log(`Upload para RAG realizado com sucesso`)
                }, error: (err) => {
                  console.error(`Erro ao realizar upload para RAG`, err)
              }})
              console.log('Upload realizado com sucesso!');
              
            },
            error: err => {
              console.error('Erro no upload:', err);
             
          }
        })
        }
        this.apiService.message("Módulo cadastrado com sucesso!")
        this.navigateAfterRegisterModulo()
        },
        error: err => {
          console.error('Erro ao cadastrar módulo:', err);
        }
    });

      
      
    } else {
      console.error('Formulário inválido. Verifique os campos obrigatórios.');
    }
  }

  onSelectedFile(event: any){
    const file = event.target.files[0];
    if (file){
      this.selectedFile = file
    }
  }


  uploadFileRAG(file: File, nomeModulo: string, url: string){
    return this.uploadService.uploadFile(file, nomeModulo, url)
  }


  voltar(){
    const rotaAnterior = this.previousRouter.getPreviousUrl();
    const rotas = ['/tecnocomp/modulos', '/tecnocomp/meus-modulos', '/tecnocomp/meu-perfil', '/tecnocomp/cadastros']
    const isAdmin = this.authService.isAdmin()

    if (isAdmin && rotas[0] === rotaAnterior) {
      this.router.navigate([rotas[0]])

    } else if (rotas[2] === rotaAnterior ) {
      this.router.navigate([rotas[2]])
    } else if (!isAdmin && rotas[1] === rotaAnterior){
      this.router.navigate([rotas[1]])
    } else if (rotas[3] === rotaAnterior){
      this.router.navigate([rotas[3]])
    }
  }

  navigateAfterRegisterModulo(){
    const isAdmin = this.authService.isAdmin();
    if (isAdmin){
      this.router.navigate(['/tecnocomp/modulos'])
    } else {
      this.router.navigate(['/tecnocomp/meus-modulos'])
    }
  }

}
