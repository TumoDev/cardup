import React from 'react';
import {
  IonPage,
  IonContent,
  IonCardContent,
  IonIcon
} from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';

const NotFoundPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding flex items-center justify-center bg-gray-50" scrollY={false}>
        <div className="max-w-md w-full mx-auto my-30">
          <IonCardContent className="p-8">

            <div className="text-center">
              <IonIcon
                icon={alertCircleOutline}
                className="text-7xl text-blue-500 mx-auto mb-4"
              />
              <h1 className="text-5xl font-extrabold text-gray-800 mb-2">
                404
              </h1>
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                Página No Encontrada
              </h2>
              <p className="text-gray-600 mb-8">
                Lo sentimos, la página que buscas no existe o ha sido movida a otro lugar.
              </p>
            </div>

          </IonCardContent>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotFoundPage;
