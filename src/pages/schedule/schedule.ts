import { Component,NgZone } from '@angular/core';
import { NavController, SegmentButton, LoadingController } from 'ionic-angular';
import 'rxjs/Rx';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { ScheduleModel } from './schedule.model';
import { ScheduleService } from './schedule.service';
import * as $ from 'jquery';
import * as io from 'socket.io-client';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'schedule-page',
  templateUrl: 'schedule.html'
})
export class SchedulePage {
  socketHost: string = 'http://34.195.35.232:8080/';
  socket:any;
  segment: string;
  schedule: ScheduleModel = new ScheduleModel();
  loading: any;
  select: FormGroup;
  zone:any;
  lstOrders: any = [];
  lstOrdersP: any = [];

  constructor(
    public nav: NavController,
    public scheduleService: ScheduleService,
    public loadingCtrl: LoadingController,
    public storage: Storage
  ) {
    this.segment = "today";
    this.loading = this.loadingCtrl.create();
    this.select = new FormGroup(
    {
      filter: new FormControl(),
    });
  }

  ionViewDidLoad() {
    this.loading.present();
    this.scheduleService
      .getData()
      .then(data => {
        this.schedule.today = data.today;
        this.schedule.upcoming = data.upcoming;
        this.loading.dismiss();
      });

      // inicio pruebas
      this.socket=io.connect(this.socketHost);
    this.zone= new NgZone({enableLongStackTrace: false});
    this.storage.get('Distributor').then((val)=>{
        var ObjOrder;
        this.socket.emit('RequestDistOrders',val.DistributorId);
        this.socket.on('DistOrders',(data)=>{
          this.lstOrders = data;
        });
        this.socket.emit('RequestDistOrdersP',val.DistributorId);
        this.socket.on('DistOrdersP',(data)=>{
          this.lstOrdersP = data;
        });
    });

      // fin pruebas
  }
  filter(){
    $('#list').empty();
    if(this.select.get('filter').value=="Pendientes"){
      for(var i=0;i<this.lstOrdersP.length;i++){
        console.log(this.lstOrdersP[i].ORDERID);
         $('#list').append("<ion-card><ion-card-header><h1>Número de Pedido: "+this.lstOrdersP[i].ORDERID+"</h1></ion-card-header><ion-card-content><div><p>Fecha de Pedido: "+this.lstOrdersP[i].ORDERDATE+"</p><p>Estado del Pedido: "+this.lstOrdersP[i].ORDERSTATE+"</p><p>Fecha Límite: "+this.lstOrdersP[i].ORDERDEADLINE+"</p></div><br></ion-card-content></ion-card>");
      }
    }else if(this.select.get('filter').value=="En Proceso"){
      for(var i=0;i<this.lstOrders.length;i++){
        if(this.lstOrders[i].OrderState=="En Proceso")
         $('#list').append("<ion-card ><ion-card-header><h1>Número de Pedido: "+this.lstOrders[i].OrderId+"</h1></ion-card-header><ion-card-content><div><p>Estado de Pedido: "+this.lstOrders[i].OrderState+"</p><p>Fecha de Creación: "+this.lstOrders[i].OrderDate+"</p><p>Estado de Viaje: "+this.lstOrders[i].JourneyState+"</p><p>Vehículo Asignado: "+this.lstOrders[i].TruckId+"</p><p>Conductor Asignado: "+this.lstOrders[i].PersonName+" "+this.lstOrders[i].PersonLastName+"</p><p>Teléfono del Conductor: "+this.lstOrders[i].PersonPhone+"</p></div><br></ion-card-content></ion-card>");
      }
    }else if(this.select.get('filter').value=="Completados"){
      for(var i=0;i<this.lstOrders.length;i++){
        if(this.lstOrders[i].OrderState=="Completado")
         $('#list').append("<ion-card ><ion-card-header><h1>Número de Pedido: "+this.lstOrders[i].OrderId+"</h1></ion-card-header><ion-card-content><div><p>Estado de Pedido: "+this.lstOrders[i].OrderState+"</p><p>Fecha de Creación: "+this.lstOrders[i].OrderDate+"</p><p>Estado de Viaje: "+this.lstOrders[i].JourneyState+"</p><p>Vehículo Asignado: "+this.lstOrders[i].TruckId+"</p><p>Conductor Asignado: "+this.lstOrders[i].PersonName+" "+this.lstOrders[i].PersonLastName+"</p><p>Teléfono del Conductor: "+this.lstOrders[i].PersonPhone+"</p></div><br></ion-card-content></ion-card>");
      }
    }else{
      for(var i=0;i<this.lstOrders.length;i++){
         $('#list').append("<ion-card ><ion-card-header><h1>Número de Pedido: "+this.lstOrders[i].OrderId+"</h1></ion-card-header><ion-card-content><div><p>Estado de Pedido: "+this.lstOrders[i].OrderState+"</p><p>Fecha de Creación: "+this.lstOrders[i].OrderDate+"</p><p>Estado de Viaje: "+this.lstOrders[i].JourneyState+"</p><p>Vehículo Asignado: "+this.lstOrders[i].TruckId+"</p><p>Conductor Asignado: "+this.lstOrders[i].PersonName+" "+this.lstOrders[i].PersonLastName+"</p><p>Teléfono del Conductor: "+this.lstOrders[i].PersonPhone+"</p></div><br></ion-card-content></ion-card>");
      }
       for(var i=0;i<this.lstOrdersP.length;i++){
        console.log(this.lstOrdersP[i].ORDERID);
         $('#list').append("<ion-card><ion-card-header><h1>Número de Pedido: "+this.lstOrdersP[i].ORDERID+"</h1></ion-card-header><ion-card-content><div><p>Fecha de Pedido: "+this.lstOrdersP[i].ORDERDATE+"</p><p>Estado del Pedido: "+this.lstOrdersP[i].ORDERSTATE+"</p><p>Fecha Límite: "+this.lstOrdersP[i].ORDERDEADLINE+"</p></div><br></ion-card-content></ion-card>");
      }
    }
    console.log(this.select.get('filter').value);
  }
  
  onSegmentChanged(segmentButton: SegmentButton) {
    // console.log('Segment changed to', segmentButton.value);
  }

  onSegmentSelected(segmentButton: SegmentButton) {
    // console.log('Segment selected', segmentButton.value);
  }

}
