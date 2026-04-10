import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';

@Component({
  selector: 'app-cadastro-plataforma',
  templateUrl: './cadastro-plataforma.component.html',
  styleUrls: ['./cadastro-plataforma.component.css'],
})
export class CadastroPlataformaComponent {
  plataformaForm = new FormGroup({
    plataformaUrl: new FormControl('', [Validators.required, Validators.pattern(/https?:\/\/.+/)]),
    plataformaNome: new FormControl('', [Validators.required, Validators.minLength(3)]),
    idCliente: new FormControl('', Validators.required),
    usuario_id: new FormControl(''),
    temaTipo: new FormControl('padrao', Validators.required),
    customPrimaria: new FormControl(''),
    customSecundaria: new FormControl(''),
    customTerciaria: new FormControl(''),
    customQuartenaria: new FormControl(''),
    customQuintenaria: new FormControl(''),
  });

  carregando: boolean = false;

  constructor(
    private apiService: ApiAdmService,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {}

  voltarPagina() {
    this.location.back();
  }

  ngOnInit(): void {
    const usuarioId = this.authService.getUsuarioId();
    this.plataformaForm.patchValue({ usuario_id: `${usuarioId}` });
  }

  get plataformaUrl() {
    return this.plataformaForm.get('plataformaUrl')!;
  }

  get plataformaNome() {
    return this.plataformaForm.get('plataformaNome')!;
  }

  get idCliente() {
    return this.plataformaForm.get('idCliente')!;
  }

  onSubmit(): void {
    if (this.plataformaForm.invalid){
      this.plataformaForm.markAllAsTouched()
      this.apiService.message('Por favor, preencha todos os campos corretamente.')
      return
    }

    this.carregando = true

    if (this.plataformaForm.valid) {
      this.apiService.registerPlataforma(this.plataformaForm.value).subscribe(
        (response) => {
          this.apiService.message("Plataforma cadastrada com sucesso!")
          this.navegarPlataforma()
          this.carregando = false
        },
        (error) => {
          console.error('Erro ao registrar plataforma:', error);
          this.apiService.message('Erro ao cadastrar plataforma');
          this.carregando = false
        }
      );
    }
  }

  navegarPlataforma(){
    const isAdmin = this.authService.isAdmin();
    if (isAdmin){
      this.router.navigate(['/tecnocomp/plataformas'])
    } else {
      this.router.navigate(['/tecnocomp/minhas-plataformas'])
    }

  }
  
  
}
