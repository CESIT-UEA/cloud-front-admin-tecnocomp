import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';

@Component({
  selector: 'app-cadastro-modulo',
  templateUrl: './cadastro-modulo.component.html',
  styleUrls: ['./cadastro-modulo.component.css']
})
export class CadastroModuloComponent implements OnInit {

  moduloForm = new FormGroup({
    nome_modulo: new FormControl('', Validators.required),
    nome_url: new FormControl('', Validators.required),
    ebookUrlGeral: new FormControl(''),
    video_inicial: new FormControl(''),
    plataforma_id: new FormControl('', Validators.required),
    topicos: new FormArray([]),
    usuario_id: new FormControl('')
  });

  constructor(private apiService: ApiAdmService, private router: Router, private AuthService:AuthService) {}
  ngOnInit(): void {
    const usuarioId = this.AuthService.getUsuarioId();
    this.moduloForm.patchValue({ usuario_id: `${usuarioId}` });
  }
  get topicos(): FormArray {
    return this.moduloForm.get('topicos') as FormArray;
  }

  addTopico(): void {
    this.topicos.push(new FormGroup({
      nome_topico: new FormControl('', Validators.required),
      ebookUrlGeral: new FormControl(''),
      textoApoio: new FormControl(''),
      videoUrls: new FormArray([]),
      saibaMais: new FormArray([]),
      referencias: new FormArray([]),
      exercicios: new FormArray([])
    }));
  }

  removeTopico(index: number): void {
    this.topicos.removeAt(index);
  }

  addVideoUrl(index: number): void {
    const videoUrls = this.topicos.at(index).get('videoUrls') as FormArray;
    videoUrls.push(new FormControl(''));
  }

  removeVideoUrl(topicoIndex: number, urlIndex: number): void {
    const videoUrls = this.topicos.at(topicoIndex).get('videoUrls') as FormArray;
    videoUrls.removeAt(urlIndex);
  }

  addSaibaMais(index: number): void {
    const saibaMais = this.topicos.at(index).get('saibaMais') as FormArray;
    saibaMais.push(new FormGroup({
      descricao: new FormControl(''),
      url: new FormControl('')
    }));
  }

  removeSaibaMais(topicoIndex: number, saibaIndex: number): void {
    const saibaMais = this.topicos.at(topicoIndex).get('saibaMais') as FormArray;
    saibaMais.removeAt(saibaIndex);
  }

  addReferencia(index: number): void {
    const referencias = this.topicos.at(index).get('referencias') as FormArray;
    referencias.push(new FormGroup({
      caminhoDaImagem: new FormControl(''),
      referencia: new FormControl('')
    }));
  }

  removeReferencia(topicoIndex: number, refIndex: number): void {
    const referencias = this.topicos.at(topicoIndex).get('referencias') as FormArray;
    referencias.removeAt(refIndex);
  }

  addExercicio(index: number): void {
    const exercicios = this.topicos.at(index).get('exercicios') as FormArray;
    exercicios.push(new FormGroup({
      questao: new FormControl(''),
      alternativas: new FormArray([])
    }));
  }

  removeExercicio(topicoIndex: number, exIndex: number): void {
    const exercicios = this.topicos.at(topicoIndex).get('exercicios') as FormArray;
    exercicios.removeAt(exIndex);
  }

  addAlternativa(topicoIndex: number, exIndex: number): void {
    const exercicios = this.topicos.at(topicoIndex).get('exercicios') as FormArray;
    const alternativas = exercicios.at(exIndex).get('alternativas') as FormArray;
    alternativas.push(new FormGroup({
      descricao: new FormControl(''),
      explicacao: new FormControl(''),
      correta: new FormControl(false)
    }));
  }

  removeAlternativa(topicoIndex: number, exIndex: number, altIndex: number): void {
    const exercicios = this.topicos.at(topicoIndex).get('exercicios') as FormArray;
    const alternativas = exercicios.at(exIndex).get('alternativas') as FormArray;
    alternativas.removeAt(altIndex);
  }

  // onSubmit(): void {
  //   if (this.moduloForm.valid) {
  //     this.apiService.registerModulo(this.moduloForm.value).subscribe(
  //       response => {
  //         console.log('Módulo cadastrado com sucesso:', response);
  //         this.irParaPageModulos()
  //       },
  //       error => {
  //         console.error('Erro ao cadastrar módulo:', error);
  //       }
  //     );
  //   }
  // }

  getFormArrayControls(formGroup: AbstractControl, formArrayName: string): AbstractControl[] {
    const formArray = formGroup.get(formArrayName) as FormArray;
    return formArray ? formArray.controls : [];
  }
  
  
  irParaPageModulos(){
    if (this.AuthService.isAdmin()){
      this.router.navigate(['/tecnocomp/modulos']);
    } else {
      this.router.navigate(['/tecnocomp/meus-modulos'])
    }
  }
}
