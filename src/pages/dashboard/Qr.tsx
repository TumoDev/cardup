// src/pages/Dashboard/Qr.tsx (COMPLETO Y CORREGIDO)

import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonCardContent,
  IonSpinner,
  IonText,
  IonIcon,
} from '@ionic/react';
import { QRCodeSVG } from 'qrcode.react';
import { copyOutline, downloadOutline, checkmarkDoneOutline } from 'ionicons/icons';

// 1. Definimos las props que el componente recibirá
interface QrPageProps {
  restaurantId: string | null;
}

const QrPage: React.FC<QrPageProps> = ({ restaurantId }) => { // 2. Usamos las props
  // Se elimina el estado local `restaurantId`
  const [qrValue, setQrValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;

  // 3. El efecto ahora depende de `restaurantId` que viene de las props
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setQrValue('');

    // Ya no leemos de localStorage, usamos la prop directamente
    if (restaurantId) {
      const urlToEncode = `${baseUrl}/menu/${restaurantId}`;
      setQrValue(urlToEncode);
    } else {
      setError("No se encontró un restaurante seleccionado.");
    }

    setIsLoading(false);
  }, [restaurantId, baseUrl]); // <-- CAMBIO CLAVE: El efecto se ejecuta si `restaurantId` cambia

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
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error al copiar el enlace: ', err);
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
