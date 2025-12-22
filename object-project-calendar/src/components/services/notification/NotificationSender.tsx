// src/services/notification/NotificationSender.ts
import type { NotificationData } from './types';
import { NotificationHelpers } from './NotificationHelpers';
import Logger from '../logger/LoggerService';

// Servizio per l'invio delle notifiche
// Utilizza un server esterno per l'invio delle notifiche push
// tramite OneSignal
export class NotificationSender {
  //private static readonly SERVER_URL = 'https://notifiche-server.onrender.com/notifica'; // URL del server di notifiche
  //private static readonly SERVER_URL = 'http://localhost:3001/notifica';
  
  private static readonly SERVER_URL = import.meta.env.VITE_SERVER_URL;

  //private static prova = "https://notifiche-server.onrender.com";

  static async sendNotification(notificationData: NotificationData): Promise<boolean> { // Invia una notifica tramite il server esterno
    try {
      if (!notificationData.oneSignalId || !notificationData.title || !notificationData.message) { // Controlla che i dati essenziali siano presenti
        Logger.warn('Dati notifica incompleti', notificationData, 'NotificationSender'); // Log di avviso se i dati sono incompleti
        return false;
      }

      const payload = { // Costruisce il payload della notifica
        oneSignalId: notificationData.oneSignalId,
        subscriptionId: notificationData.subscriptionId,
        titolo: notificationData.title,
        messaggio: notificationData.message,
        data: notificationData.data || {}
      };

      Logger.info('Invio notifica', payload, 'NotificationSender'); // Log informativo sull'invio della notifica

      const response = await fetch(this.SERVER_URL, { // Effettua la richiesta al server di notifiche
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) { // Controlla se la risposta è positiva
        Logger.info('Notifica inviata con successo', null, 'NotificationSender');
        return true;
      } else {
        Logger.error('Errore server', response.status, 'NotificationSender');
        return false;
      }
    } catch (error) {
      Logger.error('Errore invio notifica', error, 'NotificationSender');
      return false;
    }
  }

  static async scheduleNotificationAt(username: string, medicineName: string, time: string): Promise<void> { // Pianifica una notifica per un orario specifico
    try {
      const [hours, minutes] = time.split(':').map(Number); // Estrae ore e minuti dal formato "HH:MM"
      if (isNaN(hours) || isNaN(minutes)) return; // Controlla la validità dell'orario

      console.log(`Pianificazione notifica per ${medicineName} alle ${time} per l'utente ${username}`);

      const now = new Date(); // Data e ora attuali
      const notificationTime = new Date(); // Data e ora della notifica
      notificationTime.setHours(hours, minutes, 0, 0); // Imposta l'orario della notifica
      
      // Se l'orario è già passato oggi, programma per domani
      if (notificationTime <= now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      const delay = notificationTime.getTime() - now.getTime(); // Calcola il ritardo in millisecondi

      setTimeout(async () => { // Pianifica l'invio della notifica
        const userData = await NotificationHelpers.getUserData(username); // Recupera i dati dell'utente
        if (userData?.oneSignalId) { // Controlla se l'utente ha un OneSignal ID
          await this.sendNotification({ // Invia la notifica
            oneSignalId: userData.oneSignalId,
            subscriptionId: userData.onesignalIdSubscription,
            title: 'È ora di prendere la medicina!',
            message: `È ora di prendere ${medicineName} alle ${time}`,
            data: { type: 'medicine_reminder', medicineName, time }
          });
          Logger.info(`Promemoria inviato per ${medicineName} alle ${time}`, null, 'NotificationSender');
        }
      }, delay); // Ritardo prima dell'invio
    } catch (error) {
      Logger.error('Errore programmazione notifica', error, 'NotificationSender');
    }
  }
}

export default NotificationSender;

//os_v2_app_fgbn3gdgofceleyweuwuwnlemkzjuwas5bkuvlfeituwzahli2ggj42cyrnkofj4hjnfh4xand5mcm4ziqkcqrstbfjntagyqmnzlva