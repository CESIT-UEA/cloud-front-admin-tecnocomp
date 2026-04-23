import { Component } from '@angular/core';
import { ThemeService } from './services/theme.service';
import { MatIconRegistry } from '@angular/material/icon'; // Importe aqui
import { DomSanitizer } from '@angular/platform-browser';
import { ChatPersonalizadoService } from './pages/ver-ao-vivo/chat-personalizado.service';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'cadastro_lms';

  mostrarChat: boolean = false;

  constructor(
    private themeService: ThemeService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public chatPersonalizado: ChatPersonalizadoService,
    private router: Router
  ) {
    this.matIconRegistry.addSvgIcon(
      'estrela',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/estrela_icons.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'perfil',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/perfil_icons.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'modulos',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/modulos_icons.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'plataformas',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/plataformas_icons.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'close',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/close.svg')
    );

    this.router.events
    .pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    )
    .subscribe(event => {
      const url = event.urlAfterRedirects;
      this.mostrarChat = url.startsWith('/ver-ao-vivo');
    });
  }

  ngOnInit(): void {
    this.themeService.aplicarTemaSalvo();
  }
}
