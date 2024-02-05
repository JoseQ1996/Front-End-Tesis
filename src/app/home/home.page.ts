// src/app/home/home.page.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, NavController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import Swal from 'sweetalert2';
// Importar environment
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  gyroX: number = 0.0;
  gyroY: number = 0.0;
  gyroZ: number = 0.0;
  inclinacionFrontal: string = '0.0';
  inclinacionLateral: string = '0.0';
  // Agrega una nueva variable para el elemento de audio
  alertaSound: HTMLAudioElement = new Audio('assets/alert.mp3');
  imagenFondoErrorIzquierdo = 'assets/fondoIzquierdoError.jpeg';
  imagenFondoErrorDerecho = 'assets/fondoDerechoError.jpeg';
  imagenFondoDerecho = 'assets/fondoDerecho.jpeg';
  imagenFondoIzquierdo = 'assets/fondoIzquierdo.jpeg';

  // Variable para rastrear si ya se mostró la alerta
  alertaMostrada = false;
  errorConexionMostrado = false;
  fondoDerechoSrc: string = "";
  fondoIzquierdoSrc: string = "";


  constructor(private http: HttpClient, private alertController: AlertController, private menuController: MenuController, private navCtrl: NavController) { }

  ionViewWillEnter() {
    // Llamada inicial para obtener datos al cargar la página
    this.conmutarRed();
    // Establecer intervalo para actualizar datos cada cierto tiempo (opcional)
    setInterval(() => {
      this.conmutarRed();
      this.verificarPeligro();
    }, 90); // Actualizar cada 1 segundo
  }
  // Verificar si se supera el ángulo peligroso
  verificarPeligro() {
    const inclinacionFrontalNum = parseFloat(this.inclinacionFrontal);
    const inclinacionLateralNum = parseFloat(this.inclinacionLateral);
  
    if (!isNaN(inclinacionFrontalNum) && !isNaN(inclinacionLateralNum)) {
      if ((inclinacionFrontalNum > 30 || inclinacionLateralNum > 30 || inclinacionFrontalNum < -30 || inclinacionLateralNum < -30) && !this.alertaMostrada) {
        this.mostrarAlertaPeligro();
        this.alertaSound.play();
        if (inclinacionFrontalNum > 30 || inclinacionFrontalNum < -30) {
          // Cambiar la propiedad src de la imagen de fondo indirectamente a través del enlace de datos
          this.fondoIzquierdoSrc = this.imagenFondoErrorIzquierdo;
        }
        if (inclinacionLateralNum > 30 || inclinacionLateralNum < -30) {
          this.fondoDerechoSrc = this.imagenFondoErrorDerecho;
        }
        this.alertaMostrada = true;
      } else if (inclinacionFrontalNum <= 30 && inclinacionLateralNum <= 30 && inclinacionFrontalNum >= -30 && inclinacionLateralNum >= -30) {
        this.alertaMostrada = false;
        if (inclinacionFrontalNum <= 30 && inclinacionFrontalNum >= -30) {
          this.fondoIzquierdoSrc = this.imagenFondoIzquierdo;
        }
        if (inclinacionLateralNum <= 30 && inclinacionLateralNum >= -30) {
          
          this.fondoDerechoSrc = this.imagenFondoDerecho;
        }
      }
    }
  }

  abrirMenu() {
    console.log('Abriendo menú...');
    this.menuController.open('first-menu')
  }


  // Método para conmutar entre redes
  async conmutarRed() {
    try {
      if (await this.detectarRedESP32()) {
        this.conectarARedESP32();
      } else {
        this.conectarARedPrincipal();
      }
    } catch (error) {
      console.error('Error al conmutar la red:', error);

    }
  }

  // Método para detectar la presencia de la red del ESP32
  async detectarRedESP32(): Promise<boolean> {
    try {
      const response = await fetch(environment.apiUrl + "gyro");
      const data = await response.json()
      //console.log(environment.apiUrl)
      //console.log(data)
      return true;
    } catch (error) {
      return false;
    }
  }

  // Método para conectar a la red del ESP32
  async conectarARedESP32() {
    console.log('Conectando a la red del ESP32...');
    // Realizar solicitud HTTP a tu ESP32
    this.http.get<any>(environment.apiUrl + "gyro").subscribe(
      (data) => {

        // Actualizar valores del giroscopio
        this.gyroX = parseFloat(data.gyroX);
        this.gyroY = parseFloat(data.gyroY);
        this.gyroZ = parseFloat(data.gyroZ);
        //console.log(data);
        this.actualizarInclinacionFrontal(this.gyroY);
        this.actualizarInclinacionLateral(this.gyroX);
      },
      (error) => {
        console.error('Error al obtener datos del ESP32:', error);

      }
    );
  }

  // Método para conectar a la red principal
  conectarARedPrincipal() {
    console.log('Volviendo a conectar a la red principal...');
    // Puedes agregar lógica adicional si es necesario
    this.mostrarErrorConexion();

  }

  // Método para mostrar la alerta "Acerca"
  async mostrarAcerca() {
    Swal.fire({
      position: 'center',
      title: "Universidad Politecnica Salesiana",
      html: '<div class="custom-swal-text">Trabajo de Titulacion de la Carrera de Ciencias de la Computación<br/>Programado por:<br/>José Quinde<br/>Tonny Lema</div>',
      imageUrl: "assets/logo_cloud.png",
      imageWidth: 65,
      background: '#222428', // Establece el fondo del alert como negro
      imageAlt: "Custom image",
      confirmButtonColor: '#3880ff', // Establece el color de fondo del botón a negro
      heightAuto: false,
      color: "#ffffff",
      customClass: {
        container: 'custom-swal-size',
      },

    });
  }
  resetear() {
    console.log('Hiciste clic en Reset');
    this.http.get(environment.apiUrl + "reset").subscribe(
      (data) => {
        console.log('Respuesta del servidor:', data);
      },
      (error) => {
        console.error('Error al hacer reset:', error);
      }
    );
  }


  // Mostrar alerta de peligro
  async mostrarAlertaPeligro() {
    Swal.fire({
      icon: "error",
      title: "¡PELIGRO!",
      text: "La inclinación es mayor a 30 grados. ¡Precaución!",
      background: '#222428', // Establece el fondo del alert como negro
      confirmButtonColor: '#3880ff', // Establece el color de fondo del botón a negro
      heightAuto: false,
      color: "#ffffff",
      showConfirmButton: false,
      timer: 1000,
      customClass: {
        container: 'custom-swal-size',
      },

    });
  }
  // Mostrar alerta de cone
  async mostrarErrorConexion() {
    // Verifica si la alerta ya se ha mostrado
    if (!this.errorConexionMostrado) {
      await Swal.fire({
        title: 'Configurar Conexion de Wi-Fi',
        text: 'Asegurase de que su dispositivo este conectado a la misma Red Wi-Fi del sensor.',
        icon: 'info',
        showCancelButton: false,
        background: '#222428',
        confirmButtonColor: '#3880ff',
        heightAuto: false,
        color: "#ffffff",
        customClass: {
          container: 'custom-swal-size',
        },
        confirmButtonText: 'OK',
      }).then((result) => {
        // Verifica si el usuario hizo clic en OK
        if (result.isConfirmed) {
          // Redirige a la configuración de Wi-Fi
          window.location.href = 'app-settings:wifi-settings';
        }
      });

      // Marca que la alerta ha sido mostrada
      this.errorConexionMostrado = true;
    }
  }

  // Métodos para actualizar la inclinación frontal y lateral
  actualizarInclinacionFrontal(nuevoValorFrontal: number) {
    this.inclinacionFrontal = this.calcularRotacion(-1 * nuevoValorFrontal);
    this.verificarPeligro();
  }

  actualizarInclinacionLateral(nuevoValorLateral: number) {
    this.inclinacionLateral = this.calcularRotacion(nuevoValorLateral);
    this.verificarPeligro();
  }

  // Función para calcular la rotación en grados
  calcularRotacion(valorGyro: number): string {
    // Factor de conversión de radianes a grados
    const radianesAGrados = 180 / Math.PI;

    // Calcular el ángulo en radianes usando atan2
    const anguloEnRadianes = Math.atan2(valorGyro, 1);

    // Convertir el ángulo a grados y limitar a dos decimales
    const anguloEnGrados = (anguloEnRadianes * radianesAGrados).toFixed(2);

    return anguloEnGrados.toString();
  }
}