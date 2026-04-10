import { ApiAdmService } from './../../services/api-adm.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { noOnlyWhitespace, senhaForte } from '../validators/validators';
import { AuthService } from 'src/app/auth/auth.service';
import { PreviousRouteService } from 'src/app/services/previous-route.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cadastro-usuario',
  templateUrl: './cadastro-usuario.component.html',
  styleUrls: ['./cadastro-usuario.component.css']
})
export class CadastroUsuarioComponent implements OnInit {
  validators: boolean = false;
  errorCadastro: boolean = false;
  buttonDisabled = true;
  hide = true;
  hideConfirmarSenha = true;

  cadastroForm = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.minLength(4), noOnlyWhitespace()]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.minLength(13), noOnlyWhitespace()]),
    senha: new FormControl('', [Validators.required, Validators.minLength(8), senhaForte(), noOnlyWhitespace()]),
    confirmarSenha: new FormControl('',[Validators.required,Validators.minLength(8), senhaForte(),noOnlyWhitespace()]),
    tipo: new FormControl('professor', Validators.required)
  });

  constructor(
    private apiService: ApiAdmService, 
    private router: Router, 
    private authService: AuthService,
    private previousRouter: PreviousRouteService,
    private location: Location
  ) {
      this.cadastroForm.valueChanges.subscribe(()=>{
          this.errorCadastro = false

          const form = this.cadastroForm.value
          if (form.nome?.trim().length != 0 && form.email?.trim().length != 0 && form.senha?.trim().length != 0){
            this.buttonDisabled = false
          }else{
            this.buttonDisabled = true
          }
      })
  }

  voltarPagina() {
    this.location.back();
  }

  ngOnInit(): void {
  
  }

  get nome(){
      return this.cadastroForm.get('nome')!;
  }

  get email(){
      return this.cadastroForm.get('email')!;
  }

  get senha(){
    return this.cadastroForm.get('senha')!;
}


  isAdminUser(){
    const tipoUser = this.authService.getUsuarioDados().tipo;
    return tipoUser === "adm"
  }

  onSubmit() {
    if (this.cadastroForm.invalid){
      this.cadastroForm.markAllAsTouched()
      this.apiService.message('Por favor, preencha todos os campos corretamente.')
      return
    }

    if (this.cadastroForm.valid) {
      console.log(this.cadastroForm.value)
      this.apiService.registerUsuario(this.cadastroForm.value).subscribe(
        response => {
          this.apiService.message("Usuário cadastrado com sucesso!")
          this.router.navigate(['/tecnocomp/usuarios'])
        },
        error => {
          this.errorCadastro = true
          console.error('Erro ao cadastrar usuário:', error);
        }
      );
    }
    if(!this.cadastroForm.valid){
      this.validators = true
 }
  }
  voltar(){
    const rotaAnterior = this.previousRouter.getPreviousUrl();

    const rotas = ['/tecnocomp/cadastros', '/tecnocomp/usuarios'];
    if (rotas[0] === rotaAnterior){
      this.router.navigate([rotas[0]])
    }
    
    if (rotas[1] === rotaAnterior){
      this.router.navigate([rotas[1]])
    }
  }
}
