import { Component } from '@angular/core';

import { ListingPage } from '../listing/listing';
// import { ProfilePage } from '../profile/profile';
// import {MapsPage} from '../maps/maps';
import { NotificationsPage } from '../notifications/notifications';
import { OrdersPage } from '../Orders/Orders';
import { SchedulePage } from '../schedule/schedule';
@Component({
  selector: 'tabs-navigation',
  templateUrl: 'tabs-navigation.html'
})
export class TabsNavigationPage {
  tab1Root: any;
  tab2Root: any;
  tab3Root: any;

  constructor() {
    this.tab1Root = OrdersPage;
    this.tab2Root = NotificationsPage;
    this.tab3Root = SchedulePage;
  }
}
