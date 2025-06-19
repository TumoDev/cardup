import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonPage,
  IonInput,
  IonItem,
  IonLabel,
  IonToast,
  IonSpinner,
  IonRouterLink
} from '@ionic/react';
import type { AuthModel } from '../../models/AuthModel';
import { login } from '../../services/authService';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<AuthModel>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();
  const handleInputChange = (field: keyof AuthModel, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      setToastMessage('Por favor ingresa correo y contraseña');
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await login(credentials);

      if (error) {
        setToastMessage(`Error: ${error.message}`);
        setShowToast(true);
        return;
      }

      if (data.session && data.user) {
        setToastMessage('¡Inicio de sesión exitoso!');
        setShowToast(true);
        setTimeout(() => history.replace('/restaurant-selection'), 800);
      }
    } catch (error: any) {
      setToastMessage(`Error inesperado: ${error.message}`);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding flex items-center justify-center bg-gray-50" scrollY={false}>
        <div className="max-w-md w-full mx-auto my-30">
          <IonCard className="animate-fade-in-up shadow-lg rounded-2xl overflow-hidden">
            <IonCardContent className="p-8">
              <div className="text-center mb-7">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Login Administrador
                </h1>
                <p className="text-gray-600">
                  Accede a tu panel de control
                </p>
              </div>

              <IonItem lines="none" className="mb-5 bg-gray-100 rounded-xl">
                <IonLabel position="floating" className="text-gray-600">
                  Correo Electrónico
                </IonLabel>
                <IonInput
                  type="email"
                  value={credentials.email}
                  onIonChange={e => handleInputChange('email', e.detail.value!)}
                  placeholder="ejemplo@correo.com"
                  className="bg-white rounded-xl px-4 py-3"
                  disabled={isLoading}
                />
              </IonItem>

              <IonItem lines="none" className="mb-7 bg-gray-100 rounded-xl">
                <IonLabel position="floating" className="text-gray-600">
                  Contraseña
                </IonLabel>
                <IonInput
                  type="password"
                  value={credentials.password}
                  onIonChange={e => handleInputChange('password', e.detail.value!)}
                  placeholder="••••••••"
                  className="bg-white rounded-xl px-4 py-3"
                  disabled={isLoading}
                />
              </IonItem>

              <IonButton
                expand="block"
                onClick={handleLogin}
                disabled={isLoading}
                className="h-14 font-medium transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-70"
              >
                {isLoading ? <IonSpinner name="crescent" /> : 'Iniciar Sesión'}
              </IonButton>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  ¿No tienes una cuenta?{' '}
                  <IonRouterLink
                    routerLink="/register"
                    color="primary"
                    className="font-semibold hover:underline"
                  >
                    Regístrate
                  </IonRouterLink>
                </p>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={
            toastMessage.includes('exitoso') ? 'success' :
              toastMessage.toLowerCase().includes('error') ? 'danger' : 'warning'
          }
          position="top"
          className="[--offset-top:3rem]"
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
