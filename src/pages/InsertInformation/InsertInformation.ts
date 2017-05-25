import { Component,NgZone } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { CallNumber, SocialSharing, InAppBrowser } from 'ionic-native';
import { MapsPageSignUp } from '../map-SignUp/maps';
// import { ContactModel } from './InsertInformation.model';
import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import * as io from 'socket.io-client';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
@Component({
  selector: 'contact-card-page',
  templateUrl: 'InsertInformation.html'
})
export class InsertInformation {
  socketHost: string = 'http://34.195.35.232:8080/';
  socket:any;
  zone:any;
  Form: FormGroup;
  // contact: ContactModel = new ContactModel();
  maps_page: { component: any };
  TabsPage: { component: any }
  lstDistributors: any=[];
  DistributorSelected: any;
  Init: any;
  MapImage: any;
  constructor(
    public nav: NavController,
    public storage: Storage,
    public alertCtrl:AlertController
  ) {

     this.Form = new FormGroup({
        name: new FormControl('', Validators.required),
        address: new FormControl('', Validators.required),
        phone: new FormControl('', Validators.required),
        licence: new FormControl(''),
        ruc:new FormControl(''),
        // importer: new FormControl(''),
    });
    this.maps_page = { component: MapsPageSignUp };
    this.socket=io.connect(this.socketHost);
    this.zone= new NgZone({enableLongStackTrace: false});
    let alert = this.alertCtrl.create({
          title: 'INSTRUCCIONES',
          subTitle: '1.- Presione sobre el mapa para ubicar su local de Distribución <br> 2.- Ingrese los datos solicitados',
          buttons: ['Ok']
        });
    alert.present();
  }

  call(number: string){
    CallNumber.callNumber(number, true)
    .then(() => console.log('Launched dialer!'))
    .catch(() => console.log('Error launching dialer'));
  }

  saveInformation(){
    this.storage.get('DistPosX').then((x)=>{
      this.storage.get('DistPosY').then((y)=>{
        this.storage.get('person').then((p)=>{
            var objDist = {
              name: this.Form.get('name').value,
              address: this.Form.get('address').value,
              phone: this.Form.get('phone').value,
              licence: this.Form.get('licence').value,
              importer: '' ,
              person: p.PERSONID,
              ruc: this.Form.get('ruc').value,
              CoordX: x,
              CoordY: y
            }
            this.socket.emit('RequestSaveDistributor',objDist);
            let alert = this.alertCtrl.create({
                  title: 'LISTO!',
                  subTitle: 'Datos guardados correctamente',
                  buttons: ['Ok']
                });
            alert.present();
            this.nav.push(TabsNavigationPage);
            // console.log(objDist); 
        })  
        // console.log(this.Form.get('name').value+"  "+this.Form.get('address').value+"  "+this.Form.get('phone').value+"  "+this.Form.get('licence').value+"  "+this.Form.get('ruc').value+" Coordenadas "+x+","+y);
      })
    })
    
  }
  SetPosition(){
    // this.storage.set('MapImage',$('#MapImage'));
    this.nav.push(MapsPageSignUp);
    // env.nav.setRoot(env.maps_page.component);
  }


}