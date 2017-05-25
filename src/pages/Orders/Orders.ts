import { Component,NgZone } from '@angular/core';
import { NavController, SegmentButton, AlertController, ToastController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { counterRangeValidator } from '../../components/counter-input/counter-input';
import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';

import * as io from 'socket.io-client';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';

@Component({
  selector: 'form-layout-page',
  templateUrl: 'Orders.html'
})
export class OrdersPage {
  section: string;
  order_form: FormGroup;
  socketHost: string = 'http://34.195.35.232:8080/';
  socket:any;
  zone:any;
  lstWaste:any=[];
  lstImporter:any=[];
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  modeKeys: any;
  items:any;
  TabsPage: { component: any }
  constructor(
    public nav: NavController, 
    public storage: Storage,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController
  ) {
    this.section = "event";
    this.socket=io.connect(this.socketHost);
    this.zone= new NgZone({enableLongStackTrace: false});
    this.socket.emit('RequestImporters','')
    this.socket.on('ResponseImporters',((data)=>{
      this.lstImporter=data;
    }));
    this.socket.on('selectWaste',(data)=>{
      this.lstWaste = data;
    });
    this.order_form = new FormGroup(
    {
      date: new FormControl(new Date().toISOString(), Validators.required),
      quantity: new FormControl('', Validators.required),
      waste: new FormControl('', Validators.required),
      btnGroup: new FormControl('General',Validators.required),
      importer: new FormControl('')
    });
  }

  onSegmentChanged(segmentButton: SegmentButton) {
    // console.log('Segment changed to', segmentButton.value);
  }

  onSegmentSelected(segmentButton: SegmentButton) {
    // console.log('Segment selected', segmentButton.value);
  }

  createOrder(){
    var ObjOrder;
    // alert(this.order_form.get('date').value+' '+this.order_form.get('quantity').value+' '+this.order_form.get('waste').value+' '+this.order_form.get('importer').value);
    this.storage.get('Distributor').then((val)=>{
        ObjOrder = {
          date: new Date().getFullYear().toString()+"-"+new Date().getMonth().toString()+"-"+new Date().getDate().toString(),
          quantity: this.order_form.get('quantity').value,
          distributor: val.DistributorId,
          waste: this.order_form.get('waste').value,
          type: this.order_form.get('btnGroup').value
        }
        this.socket.emit('AppInsertOrder',ObjOrder);
        let alert = this.alertCtrl.create({
          title: 'GUARDADO',
          subTitle: 'Su pedido ha sido creado correctamente',
          buttons: ['Ok']
        });
        alert.present();
        this.nav.push(TabsNavigationPage);
    });
    
  }
}
