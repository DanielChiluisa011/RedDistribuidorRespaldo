import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController, LoadingController, Content } from 'ionic-angular';
import { OrdersPage } from '../Orders/Orders';
import { Validators, FormGroup, FormControl } from '@angular/forms';

// import { FeedPage } from '../feed/feed';
import 'rxjs/Rx';
import * as $ from 'jquery';
// import { ListingModel } from './listing.model';
// import { ListingService } from './listing.service';


import * as io from 'socket.io-client';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'listing-page',
  templateUrl: 'listing.html',
})

export class ListingPage {

  // Manejo socket
  @ViewChild(Content) content: Content;
  messages: any = [];
  socketHost: string = 'http://34.195.35.232:8080/';
  socket:any;
  select: FormGroup;
  chat:any;
  username: string;
  zone:any;
  lstOrders: any = [];
  lstOrdersP: any = [];
  AuxOrders:any = [];
  constructor(
    public nav: NavController, 
    public storage: Storage
  ) {
    this.socket=io.connect(this.socketHost);
    this.zone= new NgZone({enableLongStackTrace: false});
    this.storage.get('Distributor').then((val)=>{
        var ObjOrder;
        this.socket.emit('RequestDistOrders',val.DistributorId);
        this.socket.on('DistOrders',(data)=>{
          this.lstOrders = data;
          console.log("Orden")
          console.log(this.lstOrders[0]);
        });
        this.socket.emit('RequestDistOrdersP',val.DistributorId);
        this.socket.on('DistOrdersP',(data)=>{
          this.lstOrdersP = data;
        });
    });

    this.select = new FormGroup(
    {
      filter: new FormControl(),
    });
  }

  filter(){
    $('#Cards').empty();
    $('#Cards').addClass("card");
    if(this.select.get('filter').value=="Pendientes"){
      for(var i=0;i<this.lstOrdersP.length;i++){
        console.log(this.lstOrdersP[i].ORDERID);
         $('#Cards').append("<ion-card><ion-card-header><h1>Número de Pedido: "+this.lstOrdersP[i].ORDERID+"</h1></ion-card-header><ion-card-content><div><p>Fecha de Pedido: "+this.lstOrdersP[i].ORDERDATE+"</p><p>Estado del Pedido: "+this.lstOrdersP[i].ORDERSTATE+"</p><p>Fecha Límite: "+this.lstOrdersP[i].ORDERDEADLINE+"</p></div><br></ion-card-content></ion-card>");
      }
    }else if(this.select.get('filter').value=="En Proceso"){
      for(var i=0;i<this.lstOrders.length;i++){
        if(this.lstOrders[i].OrderState=="En Proceso")
         $('#Cards').append("<ion-card ><ion-card-header><h1>Número de Pedido: "+this.lstOrders[i].OrderId+"</h1></ion-card-header><ion-card-content><div><p>Estado de Pedido: "+this.lstOrders[i].OrderState+"</p><p>Fecha de Creación: "+this.lstOrders[i].OrderDate+"</p><p>Estado de Viaje: "+this.lstOrders[i].JourneyState+"</p><p>Vehículo Asignado: "+this.lstOrders[i].TruckId+"</p><p>Conductor Asignado: "+this.lstOrders[i].PersonName+" "+this.lstOrders[i].PersonLastName+"</p><p>Teléfono del Conductor: "+this.lstOrders[i].PersonPhone+"</p></div><br></ion-card-content></ion-card>");
      }
    }else if(this.select.get('filter').value=="Completados"){
      for(var i=0;i<this.lstOrders.length;i++){
        if(this.lstOrders[i].OrderState=="Completado")
         $('#Cards').append("<ion-card ><ion-card-header><h1>Número de Pedido: "+this.lstOrders[i].OrderId+"</h1></ion-card-header><ion-card-content><div><p>Estado de Pedido: "+this.lstOrders[i].OrderState+"</p><p>Fecha de Creación: "+this.lstOrders[i].OrderDate+"</p><p>Estado de Viaje: "+this.lstOrders[i].JourneyState+"</p><p>Vehículo Asignado: "+this.lstOrders[i].TruckId+"</p><p>Conductor Asignado: "+this.lstOrders[i].PersonName+" "+this.lstOrders[i].PersonLastName+"</p><p>Teléfono del Conductor: "+this.lstOrders[i].PersonPhone+"</p></div><br></ion-card-content></ion-card>");
      }
    }else{
      for(var i=0;i<this.lstOrders.length;i++){
         $('#Cards').append("<ion-card ><ion-card-header><h1>Número de Pedido: "+this.lstOrders[i].OrderId+"</h1></ion-card-header><ion-card-content><div><p>Estado de Pedido: "+this.lstOrders[i].OrderState+"</p><p>Fecha de Creación: "+this.lstOrders[i].OrderDate+"</p><p>Estado de Viaje: "+this.lstOrders[i].JourneyState+"</p><p>Vehículo Asignado: "+this.lstOrders[i].TruckId+"</p><p>Conductor Asignado: "+this.lstOrders[i].PersonName+" "+this.lstOrders[i].PersonLastName+"</p><p>Teléfono del Conductor: "+this.lstOrders[i].PersonPhone+"</p></div><br></ion-card-content></ion-card>");
      }
       for(var i=0;i<this.lstOrdersP.length;i++){
        console.log(this.lstOrdersP[i].ORDERID);
         $('#Cards').append("<ion-card><ion-card-header><h1>Número de Pedido: "+this.lstOrdersP[i].ORDERID+"</h1></ion-card-header><ion-card-content><div><p>Fecha de Pedido: "+this.lstOrdersP[i].ORDERDATE+"</p><p>Estado del Pedido: "+this.lstOrdersP[i].ORDERSTATE+"</p><p>Fecha Límite: "+this.lstOrdersP[i].ORDERDEADLINE+"</p></div><br></ion-card-content></ion-card>");
      }
    }
    console.log(this.select.get('filter').value);
  }
  GoToNewOrders(){
     this.nav.push(OrdersPage)
  }


  // ionViewDidLoad() {
  //   this.loading.present();
  //   this.listingService
  //     .getData()
  //     .then(data => {
  //       this.listing.banner_image = data.banner_image;
  //       this.listing.banner_title = data.banner_title;
  //       this.listing.populars = data.populars;
  //       this.listing.categories = data.categories;
  //       this.loading.dismiss();
  //     });
  // }


  // goToFeed(category: any) {
  //   console.log("Clicked goToFeed", category);
  //   this.nav.push(FeedPage, { category: category });
  // }

}
