import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
import { MapsPageSignUp } from '../map-SignUp/maps';
import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';
import { InsertInformation } from '../InsertInformation/InsertInformation';

@Component({
  selector: 'Instructions',
  templateUrl: 'walkthrough.html'
})
export class Instructions {

  lastSlide = false;

  @ViewChild('slider') slider: Slides;

  constructor(public nav: NavController) {

  }

  skipIntro() {
    // You can skip to main app
    // this.nav.setRoot(TabsNavigationPage);

    // Or you can skip to last slide (login/signup slide)
    this.lastSlide = true;
    this.slider.slideTo(this.slider.length());
  }

  onSlideChanged() {
    // If it's the last slide, then hide the 'Skip' button on the header
    this.lastSlide = this.slider.isEnd();
  }

  goToLogin() {
    this.nav.push(InsertInformation);
  }

  goToSignup() {
    this.nav.push(SignupPage);
  }
}
