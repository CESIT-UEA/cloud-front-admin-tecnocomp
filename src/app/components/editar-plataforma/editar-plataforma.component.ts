import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { Plataforma } from 'src/interfaces/Plataforma';

@Component({
  selector: 'app-editar-plataforma',
  templateUrl: './editar-plataforma.component.html',
  styleUrls: ['./editar-plataforma.component.css'],
})
export class EditarPlataformaComponent implements OnInit {
  plataformaForm!: FormGroup;
  plataformaId!: number;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiAdmService,
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private authService: AuthService
  ) {}


  voltarPagina() {
    this.location.back();
  }
  ngOnInit(): void {
    // Obter o ID da plataforma a partir da rota
    this.plataformaId = Number(this.route.snapshot.paramMap.get('id'));

    // Inicializar o formulário
    this.plataformaForm = this.fb.group({
      plataformaNome: ['', [Validators.required, Validators.minLength(3)]],
      plataformaUrl: [
        '',
        [Validators.required, Validators.pattern(/https?:\/\/.+/)],
      ],
      idCliente: ['', [Validators.required]],
      temaTipo: ['padrao', Validators.required],
      customPrimaria: [''],
      customSecundaria: [''],
      customTerciaria: [''],
      customQuartenaria: [''],
      customQuintenaria: [''],
    });

    // Carregar os dados da plataforma
    this.apiService.obterPlataformaPorId(this.plataformaId).subscribe(
      (plataforma: Plataforma) => {
        
        this.plataformaForm.patchValue(plataforma);
      },
      (error) => {
         if (error.status === 404) {
             this.apiService.message('Plataforma não encontrada ou você não tem acesso.');
         } else{
            this.apiService.message('Erro ao carregar os dados da plataforma.')
          }
        console.error('Erro ao carregar a plataforma:', error);
        
        this.navegarPlataforma()
      
      })
    }

  salvarAlteracoes(): void {
    if (this.plataformaForm.invalid) {
      this.apiService.message('Por favor, preencha todos os campos corretamente.')
      return;
    }

    const plataformaAtualizada = this.plataformaForm.value;

    this.apiService
      .editarPlataforma(this.plataformaId, plataformaAtualizada)
      .subscribe(
        () => {
          this.apiService.message('Plataforma atualizada com sucesso!');
          this.navegarPlataforma()
        },
        (error) => {
          console.error('Erro ao atualizar a plataforma:', error);
          this.apiService.message('Erro ao atualizar a plataforma.');
        }
      );
  }

  navegarPlataforma(){
    const isAdmin = this.authService.isAdmin();
    if (isAdmin){
      this.router.navigate(['/tecnocomp/plataformas'])
    } else {
      this.router.navigate(['/tecnocomp/minhas-plataformas'])
    }

  }

  verificarValidacao(){
    if (this.plataformaForm.invalid){
      this.plataformaForm.markAllAsTouched()
      this.apiService.message('Por favor, preencha todos os campos corretamente.')
      return
    }
  }
}
