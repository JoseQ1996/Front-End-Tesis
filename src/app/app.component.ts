import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private navCtrl: NavController, private loadingCtrl: LoadingController) {}

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Bienvenido', // Puedes personalizar tu mensaje de bienvenida aquí
      translucent: true,
      cssClass: 'custom-loading'
    });

    await loading.present();

    setTimeout(() => {
      loading.dismiss();
      this.navCtrl.navigateRoot('/home');
    }, 1000);
  }
}

