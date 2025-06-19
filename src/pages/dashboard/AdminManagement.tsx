import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonToast,
  IonCard,
  IonCardContent
} from '@ionic/react';
import { QRCodeSVG } from 'qrcode.react';

// Define an interface for your User data for better type safety
interface User {
  id: string; // Assuming your user object has an ID
  email: string;
  nombre: string;
  telefono: string;
}

const EditarUsuario: React.FC = () => {
  // State to hold user profile data
  const [user, setUser] = useState<User>({ id: '', email: '', nombre: '', telefono: '' });
  // State for password (kept separate as it's often handled differently)
  const [contrasena, setContrasena] = useState('');
  // State for controlling the toast message
  const [showToast, setShowToast] = useState(false);
  // State to hold the URL that the QR code will represent
  const [qrValue, setQrValue] = useState<string>('');

  // Base URL for the QR code
  const baseUrl = 'https://b825-2800-150-14d-1c04-1931-9abd-9e68-2003.ngrok-free.app/';

  // useEffect hook to run code when the component mounts
  useEffect(() => {
    // Simulate fetching user data.
    // In a real application, you would make an API call here
    // to get the currently logged-in user's profile information.
    const fetchedUser: User = {
      id: 'USER_UNIQUE_ID_FROM_BACKEND', // **IMPORTANT: Replace with actual user ID from your backend**
      email: 'usuario@ejemplo.com',
      nombre: 'Admin de Prueba',
      telefono: '123-456-7890',
    };

    setUser(fetchedUser);

    // Generate QR code if a user ID is available
    if (fetchedUser.id) {
      setQrValue(`${baseUrl}?id=${fetchedUser.id}`);
    }
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Function to handle saving changes to the user profile
  const guardarCambios = () => {
    console.log('Datos actualizados:', { ...user, contrasena });
    setShowToast(true);
    // In a real application, you would send this updated data to your API
    // e.g., axios.put('/api/users/{user.id}', { ...user, contrasena });
  };

  // Generic handler for input changes in the user state
  const handleInputChange = (event: any) => {
    const { name, value } = event.detail; // Ionic's custom event detail for input
    setUser(prevUser => ({
      ...prevUser,
      [name]: value, // Dynamically update the correct field
    }));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Editar Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* QR Code Display Section - always visible */}
        <IonCard className="ion-margin-bottom ion-text-center">
          <IonCardContent>
            <h2>Código QR de Perfil</h2>
            {qrValue ? (
              <div style={{ padding: '20px' }}>
                <QRCodeSVG
                  value={qrValue} // The URL to encode in the QR code
                  size={256}      // Size of the QR code in pixels
                  level="H"       // Error correction level (H = High)
                />
              </div>
            ) : (
              <p>Generando código QR...</p>
            )}
            <p className="ion-text-wrap">Escanea este código para acceder a tu perfil o compartirlo.</p>
            {qrValue && <p className="ion-text-wrap">URL: {qrValue}</p>}

            {/* Button to download the QR code */}
            <IonButton
              href={qrValue} // Set the href to the QR code value
              download="perfil_qr.svg" // Suggests a filename for download
              className="ion-margin-top"
              expand="block"
              disabled={!qrValue} // Disable if QR value isn't ready
            >
              Descargar QR
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* User Profile Edit Form */}
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Correo electrónico</IonLabel>
            <IonInput
              type="email"
              name="email" // Add name attribute for handleInputChange
              value={user.email}
              placeholder="ejemplo@correo.com"
              onIonChange={handleInputChange}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Nombre del administrador</IonLabel>
            <IonInput
              name="nombre" // Add name attribute for handleInputChange
              value={user.nombre}
              placeholder="Tu nombre completo"
              onIonChange={handleInputChange}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Número telefónico</IonLabel>
            <IonInput
              type="tel"
              name="telefono" // Add name attribute for handleInputChange
              value={user.telefono}
              placeholder="555-123-4567"
              onIonChange={handleInputChange}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Nueva Contraseña</IonLabel>
            <IonInput
              type="password"
              value={contrasena}
              placeholder="Deja vacío para no cambiar"
              onIonChange={(e) => setContrasena(e.detail.value!)}
            />
          </IonItem>
        </IonList>

        <IonButton expand="block" className="ion-margin-top" onClick={guardarCambios}>
          Guardar Cambios
        </IonButton>

        {/* Toast message for feedback */}
        <IonToast
          isOpen={showToast}
          message="Perfil actualizado correctamente"
          duration={2000}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default EditarUsuario;
