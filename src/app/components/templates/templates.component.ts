import { Component, OnInit } from '@angular/core';
import { ApiAdmService } from 'src/app/services/api-adm.service';
import { Modulo } from 'src/interfaces/modulo/Modulo';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css'],
})
export class TemplatesComponent implements OnInit {
  modulos: Modulo[] = [];
  constructor(public apiService: ApiAdmService) {}
  ngOnInit(): void {
    this.apiService.listarTemplates().subscribe(
      (response) => {
        this.modulos = response;
        console.log(response);
      },
      (error) => {
        console.error('Erro ao carregar templates:', error);
      }
    );
  }
}
