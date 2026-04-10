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
  carregando: boolean = false;


  moduloForm = new FormGroup({
    nome_modulo: new FormControl('', Validators.required),
    nome_url: new FormControl('', Validators.required),
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


  isYoutubeEmbed(url: string): boolean {
    const regex = /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+(\?.*)?$/;
    return regex.test(url);
  }


  onSubmit(): void {
    if (this.moduloForm.invalid || !this.selectedFile){
      this.moduloForm.markAllAsTouched()
      this.tentouSubmeter = true
      this.apiService.message('Por favor, preencha todos os campos corretamente.')
      return
    }

    const video_inicial = this.moduloForm.get('video_inicial')?.value

    if (video_inicial){
      if (!this.isYoutubeEmbed(video_inicial)){
        this.apiService.message('O link deve ser um link incorporado do YouTube (embed)')
        return 
      }
    }

    this.carregando = true;

    const formData = new FormData();
    formData.append('nome_modulo', this.moduloForm.get('nome_modulo')?.value || '');
    formData.append('nome_url', this.moduloForm.get('nome_url')?.value || '');
    formData.append('video_inicial', this.moduloForm.get('video_inicial')?.value || '');
    formData.append('usuario_id', String(this.authService.getUsuarioDados().id));

    console.log("FILE:", this.selectedFile);
    formData.append('file', this.selectedFile);

    this.apiService.registerModulo(formData).subscribe({
    next: (response) => {
      this.apiService.message("Módulo cadastrado com sucesso!");
      this.navigateAfterRegisterModulo();
      this.carregando = false;
    },
    error: (err) => {
      console.error('Erro ao cadastrar módulo:', err);
      this.apiService.message(err.error.error)
      this.carregando = false;
    }
  });

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
