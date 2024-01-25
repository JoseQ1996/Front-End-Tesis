import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private zone: NgZone,
    @Inject(DOCUMENT) private document: Document
  ) {}

  async ngOnInit() {
    // Configurar el modo oscuro predeterminado
    this.toggleDarkMode(true);

    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Bienvenido',
      translucent: true,
      cssClass: 'custom-loading'
    });
   
    await loading.present();

    setTimeout(() => {
      loading.dismiss();
      this.navCtrl.navigateRoot('/home');
    }, 1000);
  }

  // Función para cambiar el modo oscuro
  private toggleDarkMode(enableDarkMode: boolean): void {
    const body = this.document.body;
    if (enableDarkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }
}
