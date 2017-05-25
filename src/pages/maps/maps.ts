import { Component, NgZone,ViewChild, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, PopoverController, NavParams, ViewController, Events } from 'ionic-angular';
import { Keyboard, Geolocation,Geoposition} from 'ionic-native';

import { Observable } from 'rxjs/Observable';

import { GoogleMap } from "../../components/google-map/google-map";
import { GoogleMapsService } from "./maps.service";
import { MapsModel, MapPlace } from './maps.model';

import * as io from 'socket.io-client';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';

@Component({
  template:  `
  <div>
  <h4 align="center">Direcciones</h4>
    <ul>
      <li *ngFor="let step of parameters">
        {{step}}
      </li>
    </ul>
  </div>
  ` 
})
export class PopoverPage {
  
  parameters: any;

  constructor(public viewCtrl: ViewController, public params: NavParams) {
    this.parameters=params.get('steps');
  }

  ngOnInit(){

  }
  close() {
    this.viewCtrl.dismiss();
  }
}


@Component({
  selector: 'maps-page',
  templateUrl: 'maps.html'
})

export class MapsPage implements OnInit {
  @ViewChild(GoogleMap) _GoogleMap: GoogleMap;
  // Manejo socket
//  messages: any = [];
  socketHost: string = 'http://34.195.35.232:8080/';
  socket:any;
  //username: string;
  zone:any;
  lstUsers: any = [] ;
  lstJourneys: any = [] ;
  lstOrders: any=[];
  lstDistributors: any = [];
  lstRecyclingCenters: any = [];
  lstActiveOrders: any = [];
  JourneyRoute: any;
  steps: any = [];
  userMarker: any;
  distributorMarker: any = [];
  watch: any;
  current_user: any;
  // Fin manejo socket
  map_model: MapsModel = new MapsModel();
  constructor(
    public nav: NavController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public GoogleMapsService: GoogleMapsService,
    public storage: Storage,
    public popoverCtrl: PopoverController
  ) {
    this.geolocateMe();
    // this.storage.get('person').then((aux)=>{
    //   this.ShowJourney(aux)
    // })
    //this.ShowJourney(1);
    // Manejo socket
    this.socket=io.connect(this.socketHost);
    this.zone= new NgZone({enableLongStackTrace: false});

    

    
    this.socket.emit('SelectJourneys','ex app');
    this.socket.on('SelectJourneys',(data)=>{
      this.lstJourneys = data;
    });  
    
    this.socket.emit('SelectDistributors','ex app');
    this.socket.on('SelectDistributors',(data)=>{
      this.lstDistributors = data;
    });

    this.socket.emit('SelectRecyclingCenters','ex app');
    this.socket.on('SelectRecyclingCenters',(data)=>{
      this.lstRecyclingCenters = data;
    });  

    this.socket.emit('SelectActiveOrders','ex app');
    this.socket.on('SelectActiveOrders',(data)=>{
      this.lstActiveOrders = data;
    });  

    this.socket.emit('SelectJourneys','ex app');
    this.socket.on('SelectJourneys',(data)=>{
      this.lstJourneys = data;
    });  

    // recuperacion dato de storage
    this.storage.get('person').then((cedula)=>{
      this.socket.emit('RequestJourneyRoute', cedula.PersonCi); //request al servidor con el parametro
    })

    this.socket.on('JourneyRouteData',(data)=>{
      this.JourneyRoute=data[0];

    })
    // fin manejo socket  
    // Fin Manejo socket



  }

  ngOnInit() {
    let _loading = this.loadingCtrl.create();
    _loading.present();

    this._GoogleMap.$mapReady.subscribe(map => {
      this.map_model.init(map);
      _loading.dismiss();
    });

    //this.ShowJourney();    
  }
  
  ionViewDidEnter() {
    // Use ngOnInit 

  }

  searchPlacesPredictions(query: string){
    let env = this;
    
    if(query !== "")
    {
      env.GoogleMapsService.getPlacePredictions(query).subscribe(
        places_predictions => {
          env.map_model.search_places_predictions = places_predictions;
        },
        e => {
          console.log('onError: %s', e);
        },
        () => {
          console.log('onCompleted');
        }
      );
    }else{
      env.map_model.search_places_predictions = [];
    }
  }
  beginJourney(){
    if($('#btnBeginJourney').text()!="Pausar"){
      $('#btnBeginJourney').text("Pausar");
      
      this.userMarker.marker.setIcon('./assets/images/maps/truckS.png');
       this.watch=Geolocation.watchPosition({enableHighAccuracy: true,maximumAge: 30000}).subscribe((position: Geoposition)=>{
        var ultimaPosicion = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              this.userMarker.marker.setPosition(ultimaPosicion);
            var info={
              position: ultimaPosicion,
              user: this.current_user
            }
            // Manejo socket
            this.socket=io.connect(this.socketHost);
            this.zone= new NgZone({enableLongStackTrace: false});
            this.socket.emit('AppTruckLocation',info);
            // Fin Manejo socket
      });
    }else{
        $('#btnBeginJourney').text("Iniciar Viaje");
        this.watch.unsubscribe();
        this.userMarker.marker.setIcon('./assets/images/maps/truck.png');
      }
  }
  setOrigin(location: google.maps.LatLng){
    let env = this;

    // Clean map
    env.map_model.cleanMap();
    env.map_model.map_options.clickableIcons=true;

    // Set the origin for later directions
    env.map_model.directions_origin.location = location;

    this.userMarker = env.map_model.myPosition(location, '#00e9d5');
    this.storage.get('user').then((User)=>{
      this.storage.get('person').then((Person)=>{
        this.current_user = {
            user: User,
            person: Person   
        }
      });
    });
    this.current_user = {
        user: this.storage.get('user'),
        person: this.storage.get('person')   
    }
    this.storage.get('user').then((user)=>{
      console.log('Bienvenido: '+ user.UserEmail);
    });

    this.ShowJourney(location);

    
    // With this result we should find restaurants (*places) arround this location and then show them in the map

    // Now we are able to search *restaurants near this location
    // env.GoogleMapsService.getPlacesNearby(location).subscribe(
    //   nearby_places => {
    //     // Create a location bound to center the map based on the results
    //     let bound = new google.maps.LatLngBounds();

    //     for (var i = 0; i < nearby_places.length; i++) {
    //       bound.extend(nearby_places[i].geometry.location);
    //       env.map_model.addNearbyPlace(nearby_places[i]);
    //     }

    //     // Select first place to give a hint to the user about how this works
    //     env.choosePlace(env.map_model.nearby_places[3]);

    //     // To fit map with places
//bound.extend(nearby_places[i].geometry.location);
    //     env.map_model.map.fitBounds(bound);
    //   },
    //   e => {
    //     console.log('onError: %s', e);
    //   },
    //   () => {
    //     console.log('onCompleted');
    //   }
    // );
  }

  selectSearchResult(place: google.maps.places.AutocompletePrediction){
    let env = this;

    env.map_model.search_query = place.description;
    env.map_model.search_places_predictions = [];

    // We need to get the location from this place. Let's geocode this place!
    env.GoogleMapsService.geocodePlace(place.place_id).subscribe(
      place_location => {
        env.setOrigin(place_location);
      },
      e => {
        console.log('onError: %s', e);
      },
      () => {
        console.log('onCompleted');
      }
    );
  }

  clearSearch(){
    let env = this;
    Keyboard.close();
    // Clean map
    env.map_model.cleanMap();
  }

  geolocateMe(){
    let env = this,
        _loading = env.loadingCtrl.create();

    _loading.present();

    Geolocation.getCurrentPosition().then((position) => {
      let current_location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      env.map_model.search_query = position.coords.latitude.toFixed(2) + ", " + position.coords.longitude.toFixed(2);
      env.setOrigin(current_location);
      env.map_model.using_geolocation = true;

      _loading.dismiss();
    }).catch((error) => {
      console.log('Error getting location', error);
      _loading.dismiss();
    });
  }

  choosePlace(place: MapPlace){
    let env = this;

    // Check if the place is not already selected
    if(!place.selected)
    {
      // De-select previous places
      env.map_model.deselectPlaces();
      // Select current place
      place.select();

      // Get both route directions and distance between the two locations
      let directions_observable = env.GoogleMapsService
            .getDirections(env.map_model.directions_origin.location, place.location),
          distance_observable = env.GoogleMapsService
            .getDistanceMatrix(env.map_model.directions_origin.location, place.location);

      Observable.forkJoin(directions_observable, distance_observable).subscribe(
        data => {
          let directions = data[0],
              distance = data[1].rows[0].elements[0].distance.text,
              duration = data[1].rows[0].elements[0].duration.text;

          env.map_model.directions_display.setDirections(directions);

          let toast = env.toastCtrl.create({
                message: 'That\'s '+distance+' away and will take '+duration,
                duration: 3000
              });
          toast.present();
        },
        e => {
          console.log('onError: %s', e);
        },
        () => {
          console.log('onCompleted');
        }
      );
    }
  }

  ShowJourney(location: google.maps.LatLng){



    let env=this;
    //let bound = new google.maps.LatLngBounds();
    
    var ObjJourney;
    var route;
    var recyclerId;
    var recycler;
    var routeItem=[];
    var routeItemOrder=[];
    var Orders=[];
    var waypnts=[];



    ObjJourney=this.lstJourneys[0];
    
    for (var j = 0; j < this.lstActiveOrders.length; j++) {
      if(this.lstActiveOrders[j].JourneyId==this.JourneyRoute.JourneyId){
        Orders.push(this.lstActiveOrders[j]);
      }	  
    }


    recyclerId=this.JourneyRoute.RECYCLING_CENTER_recycling_center_id;
    
    route=this.JourneyRoute.JourneyRoute.split(',');
    //alert(route.length);

    console.log(route.length);
    var distributorPosition;
    // var distributorPosition1 = new google.maps.LatLng(this.lstDistributors[0].CoordX, this.lstDistributors[0].CoordY);
    
    //bound.extend(distributorPosition);
    
   
    // var limits = new google.maps.LatLngBounds(distributorPosition,location);
    // env.map_model.map.fitBounds(limits);
        env.map_model.map.setCenter(location);
        env.map_model.map.setZoom(11);
    // limits.extend(current_location);

      // for(var j=0;j<this.lstActiveOrders.length;j++){
      //   if(this.lstActiveOrders[j].JourneyId==this.lstJourneys[i].JourneyId){
      //     Orders.push(this.lstActiveOrders[j]);
      //   }
      // }
    // for(var i=0;i<this.lstDistributors.length;i++){
    //   distributorPosition = new google.maps.LatLng(this.lstDistributors[i].CoordX, this.lstDistributors[i].CoordY);
    //   this.distributorMarker[i] = env.map_model.addPlaceToMap(distributorPosition, '#00e9d5');
    // }
      

    for(var i = 0; i < this.lstDistributors.length; i++){
      for(var j=0;j<route.length;j++){
        if(this.lstDistributors[i].DistributorId==route[j]){
          routeItem.push(this.lstDistributors[i]);
        }
        
        
        // for (var k = 0; k < Orders.length; k++) {
 				// 	if(this.lstDistributors[i].DistributorId==Orders[k].DistributorId){
 				// 		routeItemOrder.push(Orders[k].OrderQuantity)
 				// 	}
 			  // }
      }
    }

    
    for(var i=0;i<this.lstRecyclingCenters.length;i++){
      if(this.lstRecyclingCenters[i].RecyclingCenterId==recyclerId){
          recycler=this.lstRecyclingCenters[i];
        }
    }

    
    for(var i=0;i<routeItem.length;i++){
      distributorPosition = new google.maps.LatLng(routeItem[i].CoordX, routeItem[i].CoordY);
      let content = '<h4>'+routeItem[i].DistributorName+'</h4><p>'+routeItem[i].DistributorAddress+'</p><p> Telf: '+routeItem[i].DistributorPhone+'</p><p>Stock disponible: '+Orders[i].OrderQuantity+' </p>';
      this.distributorMarker[i] = env.map_model.addPlaceToMap(distributorPosition, '#00e9d5', content);
      //waypnts.push(distributorPosition);
    }

      var recyclerPosition=new google.maps.LatLng(recycler.CoordX, recycler.CoordY);
      let recyclerContent='<h4>'+recycler.RecyclingCenterName+'</h4><p>'+recycler.RecyclingCenterAddress+'</p><p> Telf: '+recycler.RecyclingCenterPhone+'</p>';
      var recyclerMarker = env.map_model.addRecyclingCenter(recyclerPosition, '#00e9d5', recyclerContent);

    //====================================================================================
    for (var i = 0; i < routeItem.length; i++) {
			waypnts.push({
				location: new google.maps.LatLng(routeItem[i].CoordX,routeItem[i].CoordY),
				stopover: false 
			});
		}

    let directions_observable = env.GoogleMapsService.getDirectionsWaypoints(location, recyclerPosition, waypnts),
        distance_observable = env.GoogleMapsService.getDistanceMatrix(location, recyclerPosition);

     Observable.forkJoin(directions_observable, distance_observable).subscribe(
        data => {
          let directions = data[0],
              //distance = data[1].rows[0].elements[0].distance.text,
              distance=data[0].routes[0].legs[0].distance.text,
              
              //distance2= data[1].rows[0].elements[0].distance.text,
              
              duration = data[0].routes[0].legs[0].duration.text;
              
              for(var i=0;i<data[0].routes[0].legs[0].steps.length;i++){
                this.steps.push(data[0].routes[0].legs[0].steps[i].instructions); 
              }

          env.map_model.directions_display.setDirections(directions);
          
          let toast = env.toastCtrl.create({
                message: 'La distancia es '+distance+' y le tomará '+duration,
                duration: 10000
              });
          toast.present();
          console.log(this.steps);
          //this.presentPopover(steps) ; 
        },
        e => {
          console.log('onError: %s', e);
        },
        () => {
          console.log('onCompleted');
        }
      );
  
      
  
		//env.map_model.calculateAndDisplayRoute(location, recycler, waypnts);
	


  }

  // presentPopover() {
  //   let popover = this.popoverCtrl.create(MyPopOverPage);
  //   popover.present();
  // }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PopoverPage, {steps: this.steps});
    
    popover.present({
      
      ev: myEvent
    });

  }


}