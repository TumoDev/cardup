import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonCardContent,
  IonSpinner,
  IonText,
  IonIcon,
} from '@ionic/react';
import { QRCodeSVG } from 'qrcode.react';
// Se importan los iconos necesarios para los botones de acción
import { copyOutline, downloadOutline, checkmarkDoneOutline } from 'ionicons/icons';

const QrPage: React.FC = () => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para dar feedback al usuario cuando copia el enlace
  const [copySuccess, setCopySuccess] = useState(false);

  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setQrValue('');

    const storedId = localStorage.getItem('restaurantId');

    if (storedId) {
      setRestaurantId(storedId);
      const urlToEncode = `${baseUrl}/menu/${storedId}`;
      setQrValue(urlToEncode);
    } else {
      setError("No se encontró un restaurante seleccionado.");
    }

    setIsLoading(false);
  }, [baseUrl]);

  const handleDownloadQR = () => {
    if (!qrValue || !restaurantId) return;
    const svgElement = document.getElementById('qr-code-svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr_restaurante_${restaurantId}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyLink = async () => {
    if (!qrValue || copySuccess) return;
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // El feedback dura 2 segundos
    } catch (err) {
      console.error('Error al copiar el enlace: ', err);
      // Opcional: mostrar un toast de error si la copia falla.
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <IonSpinner name="crescent" />
      </div>
    );
  }

  return (
    <IonCardContent className="ion-text-center">
      <h2 className="text-xl font-bold mb-2">Código QR del Menú</h2>
      <p className="mb-4 text-gray-600">
        Tus clientes pueden escanear este código o usar el enlace para ver el menú.
      </p>

      {error && (
        <IonText color="danger">
          <p>{error}</p>
        </IonText>
      )}

      {qrValue && !error && (
        <div className="flex flex-col items-center">

          <div className="p-4 bg-white rounded-lg shadow-inner inline-block">
            <QRCodeSVG
              id="qr-code-svg"
              value={qrValue}
              size={256}
              level="H"
            />
          </div>

          <div className="w-full mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-700 font-mono break-all border border-gray-200">
            {qrValue}
          </div>

          <div className="w-full mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <IonButton onClick={handleCopyLink} fill="outline" disabled={!qrValue}>
              <IonIcon slot="start" icon={copySuccess ? checkmarkDoneOutline : copyOutline} />
              {copySuccess ? '¡Copiado!' : 'Copiar Enlace'}
            </IonButton>

            <IonButton onClick={handleDownloadQR} disabled={!qrValue}>
              <IonIcon slot="start" icon={downloadOutline} />
              Descargar QR
            </IonButton>
          </div>

        </div>
      )}
    </IonCardContent>
  );
};

export default QrPage;
