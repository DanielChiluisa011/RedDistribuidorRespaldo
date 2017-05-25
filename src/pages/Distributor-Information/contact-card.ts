import { Component,NgZone } from '@angular/core';
import { NavController,AlertController } from 'ionic-angular';
import { CallNumber, SocialSharing, InAppBrowser } from 'ionic-native';
import { MapsPageSignUp } from '../map-SignUp/maps';
import { ContactModel } from './contact.model';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import * as io from 'socket.io-client';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
@Component({
  selector: 'contact-card-page',
  templateUrl: 'contact-card.html'
})
export class DistributorInformation {
  socketHost: string = 'http://34.195.35.232:8080/';
  socket:any;
  zone:any;
  Form: FormGroup;
  contact: ContactModel = new ContactModel();
  maps_page: { component: any };
  lstDistributors: any=[];
  DistributorSelected: any;
  Init: any;
  MapImage: any;
  constructor(
    public nav: NavController,
    public storage: Storage,
    public alertCtrl: AlertController,
  ) {

     this.Form = new FormGroup({
        name: new FormControl({value: '' , disabled: true}, Validators.required),
        address: new FormControl('', Validators.required),
        phone: new FormControl('', Validators.required),
        licence: new FormControl('',Validators.required),
        ruc: new FormControl('',Validators.required)
    });
    this.maps_page = { component: MapsPageSignUp };

    this.socket=io.connect(this.socketHost);
    this.zone= new NgZone({enableLongStackTrace: false});
    this.storage.get('person').then((val)=>{
      this.socket.emit('RequestDistributorData',val.PERSONID);
    });
    this.socket.on('DistributorData',(data)=>{
      this.DistributorSelected = data[0];
          this.Form.setValue({name: data[0].DistributorName,
                              address: data[0].DistributorAddress,
                              phone: data[0].DistributorPhone,
                              licence: data[0].DistributorEnvironmentalLicense,
                              ruc: data[0].DistributorRuc,
          });
          this.storage.set('DistPosX',data[0].CoordX);
          this.storage.set('DistPosY',data[0].CoordY);
          $('#MapImage').attr('src',"https://maps.googleapis.com/maps/api/staticmap?center="+data[0].CoordX+","+data[0].CoordY+"&zoom=15&size=400x300&scale=2&markers=icon:https://s3-us-west-2.amazonaws.com/ionicthemes-apps-assets/ion2FullApp/pin.min.png|"+data[0].CoordX+","+data[0].CoordY+"");     
      });
      this.Form.disable();
  }
  UpdateInformation(){
    if($('#BtnForm').text()=="Editar"){
      $('#BtnForm').text('Guardar');
      console.log(this.Form);
      this.Form.get('address').enable();
      this.Form.get('phone').enable();
    }else{
      
      let alert = this.alertCtrl.create({
          title: 'Actualizar Información',
          message: '¿Desea guardar los cambios realizados?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                this.Form.disable();
                $('#BtnForm').text('Editar');
              }
            },
            {
              text: 'Guardar',
              handler: () => {
                this.storage.get('person').then((val)=>{
                  this.storage.get('DistPosX').then((x)=>{
                    this.storage.get('DistPosY').then((y)=>{
                      var updInfo={
                        address: this.Form.get('address').value,
                        phone: this.Form.get('phone').value,
                        personid:val.PERSONID,
                        coordx: x,
                        coordy: y
                      }  
                      this.socket.emit('UpdateDistributor',updInfo);
                    })
                  })
                  
                });
                  this.Form.disable();
                  $('#BtnForm').text('Editar');
              }
            }
          ]
        });
        alert.present();
        this.socket.on('msg',(data)=>{
          if(data){
            let alert = this.alertCtrl.create({
                  title: 'HECHO!',
                  subTitle: 'Su Información ha sido actualizada correctamente',
                  buttons: ['Ok']
                });
            alert.present();
          }else{
            let alert = this.alertCtrl.create({
                  title: 'ERROR!',
                  subTitle: 'Ha ocurrido un error al actualizar su Información. Vuelva a intentarlo',
                  buttons: ['Ok']
                });
            alert.present();
          }
        });
    }
    
  }

  SetPosition(){
    // this.storage.set('MapImage',$('#MapImage'));
    this.nav.push(MapsPageSignUp);
    // env.nav.setRoot(env.maps_page.component);
  }

  openInAppBrowser(website: string){
    new InAppBrowser(website, '_blank', "location=yes");
  }

}