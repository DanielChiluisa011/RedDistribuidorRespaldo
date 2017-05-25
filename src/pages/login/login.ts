import { Component,NgZone, ViewChild } from '@angular/core';
import { NavController, LoadingController,Content,ToastController  } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';

import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';
import { SignupPage } from '../signup/signup';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';

import { FacebookLoginService } from '../facebook-login/facebook-login.service';
import { GoogleLoginService } from '../google-login/google-login.service';
import { Instructions } from '../Instructions/walkthrough';

import * as io from 'socket.io-client';
import { Storage } from '@ionic/storage';
@Component({
  selector: 'login-page',
  templateUrl: 'login.html'
})
export class LoginPage {
  // Manejo socket
  @ViewChild(Content) content: Content;
  socketHost: string = 'http://34.195.35.232:8080/';
  socket:any;
  zone:any;
  lstUsers: any = [];
  // Fin manejo socket
  login: FormGroup;
  main_page: { component: any };
  InstructionsPage: { component: any}
  loading: any;

  

  constructor(
    public nav: NavController,
    public facebookLoginService: FacebookLoginService,
    public googleLoginService: GoogleLoginService,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public storage: Storage
  ) {
    
    this.main_page = { component: TabsNavigationPage };
    this.InstructionsPage = { component: Instructions };

    this.login = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    // Manejo socket
    this.socket=io.connect(this.socketHost);
    this.zone= new NgZone({enableLongStackTrace: false});
    this.socket.emit('AppDataUsersRequest','ex app');
    this.socket.on('AppSelectUsers',(data)=>{
      // console.log(data.length);
      this.lstUsers = data;
    });  
    // Fin Manejo socket
  }

  doLogin(){
    this.socket.emit('AppDataUsersRequest','ex app');
    this.socket.on('AppSelectUsers',(data)=>{
      // console.log(data.length);
      this.lstUsers=[];
      this.lstUsers = data;
    // });  
    // console.log('doLogin '+this.lstUsers.length);
    // console.log('numero de usuarios: '+this.lstUsers.length)
    var flag=false;
    for(var i=0;i<this.lstUsers.length;i++){
      // console.log(this.lstUsers[i].user);
      if(this.login.get('email').value==this.lstUsers[i].user.USEREMAIL && this.login.get('password').value==this.lstUsers[i].user.USERPASSWORD){
        flag=true;
        this.storage.set('user', this.lstUsers[i].user);
        this.storage.set('person', this.lstUsers[i].person);
        console.log("ID persona "+this.lstUsers[i].person.PERSONID)
        this.socket.emit('RequestDistributorData',this.lstUsers[i].person.PERSONID);
        this.socket.on('DistributorData',(data)=>{
          if(data==0){
            this.nav.setRoot(this.InstructionsPage.component);
          }else{
            console.log(data[0]);
            this.storage.set('Distributor', data[0]);
          }
        });
        // console.log('Persona logueada '+this.storage.get('person'))
        break;
      }else{
        flag=false;
      }
      // console.log(this.lstUsers[i].user.UserEmail+' '+this.lstUsers[i].user.UserPassword);
    }
    if(flag){
      // this.storage.get('Distributor').then((val)=>{
          // if(val!=null){
            this.nav.setRoot(this.main_page.component);
          // }else{
            
          // }
      // })
    }else{
      let env = this;
      let toast = env.toastCtrl.create({
            message: 'El Usuario o contraseña ingresado es incorrecto, Por favor verifiquelos y vuelva a ingresarlos',
            duration: 4000,
            position: 'bottom'
          });
      toast.present();
    }
  });
  }

  doFacebookLogin() {
    this.loading = this.loadingCtrl.create();

    // Here we will check if the user is already logged in because we don't want to ask users to log in each time they open the app
    let env = this;

    this.facebookLoginService.getFacebookUser()
    .then(function(data) {
       // user is previously logged with FB and we have his data we will let him access the app
      env.nav.setRoot(env.main_page.component);
    }, function(error){
      //we don't have the user data so we will ask him to log in
      env.facebookLoginService.doFacebookLogin()
      .then(function(res){
        env.loading.dismiss();
        env.nav.setRoot(env.main_page.component);
      }, function(err){
        console.log("Facebook Login error", err);
      });
    });
  }

  doGoogleLogin() {
    this.loading = this.loadingCtrl.create();

    // Here we will check if the user is already logged in because we don't want to ask users to log in each time they open the app
    let env = this;

    this.googleLoginService.trySilentLogin()
    .then(function(data) {
       // user is previously logged with Google and we have his data we will let him access the app
      env.nav.setRoot(env.main_page.component);
    }, function(error){
      //we don't have the user data so we will ask him to log in
      env.googleLoginService.doGoogleLogin()
      .then(function(res){
        env.loading.dismiss();
        env.nav.setRoot(env.main_page.component);
      }, function(err){
        console.log("Google Login error", err);
      });
    });
  }


  goToSignup() {
    this.nav.push(SignupPage);
  }

  goToForgotPassword() {
    this.nav.push(ForgotPasswordPage);
  }



}
