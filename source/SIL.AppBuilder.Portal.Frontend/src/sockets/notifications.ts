import SocketClient from './socket-client';
import {HubConnectionFactory, HubConnection} from '@ssv/signalr-client';
import Store from '@orbit/store';

import {defaultOptions} from '@data';
import { buildFindRecord } from '@data/store-helpers';
import { getToken } from '@lib/auth0';
const NOTIFICATION_METHOD = "Notification";

interface NotificationHub{
  Notification: number;
  TestNotification: number;
}

export default class NotificationsSocketClient implements SocketClient{
  connection$$ = null;
  notification$$ = null;
  onNotification$$ = null;

  connection: HubConnection<NotificationHub> = null;
  dataStore = null;
  init(hubFactory: HubConnectionFactory, dataStore: Store) {
    hubFactory.create({
      key: 'notifications',
      endpointUri: '/hubs/notifications',
      options: {
        accessTokenFactory:() => `${getToken()}`
      }
    });
    this.dataStore = dataStore;
    this.connection = hubFactory.get<NotificationHub>('notifications');

  }

  start(){
    this.connection$$ = this.connection.connect()
    .subscribe(() => console.log('notifications signalr hub connected'),
      err => console.error('connect subscription has error', err),
      () => console.log('completed'));
    this.onNotification$$ = this.connection.on<number>(NOTIFICATION_METHOD).subscribe(this.onNotification.bind(this));
  }
  stop(){
    this.onNotification$$.unsubscribe();
    this.connection$$.unsubscribe();
    this.connection.disconnect();
  }

  onNotification(id: number){
    const idString = id.toString();
    this.dataStore.query(q => buildFindRecord(q, 'notification', idString), {...defaultOptions()})
      .catch((err) => {
        console.error(`unable to retrieve notification for id: ${idString}`, err);
      });
  }
}