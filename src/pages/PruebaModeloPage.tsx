// src/pages/PruebaModeloPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonLoading
} from '@ionic/react';

const MODELO_PERSONALIZADO_URL = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

const PruebaModeloPage: React.FC = () => {
  const [isInArMode, setIsInArMode] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const sceneRef = useRef<any>(null);
  const modelRef = useRef<any>(null);

  useEffect(() => {
    const sceneEl = sceneRef.current?.el;
    if (!sceneEl) return;

    const handleEnterAR = () => {
      setIsInArMode(true);
      console.log("Modo AR activado");
    };

    const handleExitAR = () => {
      setIsInArMode(false);
      console.log("Modo AR desactivado");
    };

    sceneEl.addEventListener('enter-vr', handleEnterAR);
    sceneEl.addEventListener('exit-vr', handleExitAR);

    // Manejar carga de assets
    sceneEl.addEventListener('loaded', () => {
      console.log("Escena completamente cargada");
      setLoading(false);
    });

    return () => {
      sceneEl.removeEventListener('enter-vr', handleEnterAR);
      sceneEl.removeEventListener('exit-vr', handleExitAR);
      sceneEl.removeEventListener('loaded', () => { });
    };
  }, []);

  const handleModelLoaded = () => {
    console.log("Modelo 3D cargado correctamente");
    setModelLoaded(true);
  };

  return (
    <IonPage className={isInArMode ? 'ar-session-active' : ''}>
      <IonHeader>
        <IonToolbar color={isInArMode ? 'transparent' : 'primary'}>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref="/home"
              color={isInArMode ? 'light' : 'dark'}
            />
          </IonButtons>
          <IonTitle className="ion-text-center">
            {isInArMode ? 'Mira a tu alrededor' : 'Mi Escena Personalizada'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <style>{`
          .ar-session-active ion-content {
            --background: transparent;
          }
          .ar-session-active ion-toolbar {
            --background: transparent;
            --border-color: transparent;
          }
          .model-container {
            position: relative;
            width: 100%;
            height: 70vh;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(255,255,255,0.8);
            z-index: 10;
          }
          .ar-prompt {
            text-align: center;
            padding: 16px;
            background: var(--ion-color-primary);
            color: white;
            border-radius: 8px;
            margin: 20px;
            opacity: ${isInArMode ? 0 : 1};
            transition: opacity 0.3s ease;
          }
        `}</style>

        {!isInArMode && (
          <div className="ar-prompt">
            <p>Usa el botón AR para ver el modelo en tu espacio</p>
          </div>
        )}

        <div className="model-container">
          {loading && (
            <div className="loading-overlay">
              <IonLoading
                isOpen={loading}
                message="Cargando escena..."
                spinner="crescent"
              />
            </div>
          )}

          <Scene
            ref={sceneRef}
            embedded
            vr-mode-ui="enterARButton: #ar-button; enabled: true"
            ar-mode-ui="enabled: true"
            ar-hit-test="enabled: true"
            renderer="colorManagement: true; physicallyCorrectLights: true;"
            loading-screen="enabled: false"
            style={{ width: '100%', height: '100%' }}
          >
            <a-assets>
              <a-asset-item
                id="modelo-personalizado"
                src={MODELO_PERSONALIZADO_URL}
              ></a-asset-item>
            </a-assets>

            {/* Ambiente */}
            <Entity light="type: ambient; color: #FFF; intensity: 0.6" />
            <Entity
              light="type: directional; color: #FFF; intensity: 0.8"
              position="-1 2 1"
            />

            {/* Suelo para mejores sombras */}
            <Entity
              geometry="primitive: plane; width: 4; height: 4"
              material="color: #eeeeee; shader: flat"
              rotation="-90 0 0"
              position="0 -0.5 0"
              shadow="receive: true"
            />

            <Entity
              id="escena-principal"
              ar-hit-test-target
              visible={modelLoaded}
            >
              {/* Modelo principal con texto integrado */}
              <Entity
                ref={modelRef}
                gltf-model="#modelo-personalizado"
                position="0 0 -1"
                scale="0.4 0.4 0.4"
                shadow="cast: true; receive: false"
                events={{
                  loaded: handleModelLoaded,
                  'model-error': () => console.error('Error cargando modelo')
                }}
              >
                {/* Texto flotante sobre el modelo */}
                <Entity
                  text={{
                    value: 'Mi Modelo Personalizado',
                    align: 'center',
                    color: '#2A9D8F',
                    width: 3.5,
                    wrapCount: 20,
                    font: 'roboto',
                    zOffset: 0.1
                  }}
                  position="0 2.2 0"
                  rotation="-30 0 0"
                  scale="1.5 1.5 1.5"
                >
                  {/* Fondo para mejor legibilidad */}
                  <Entity
                    geometry="primitive: plane; width: 1.2; height: 0.25"
                    material="color: #FFFFFF; opacity: 0.7"
                    position="0 -0.02 -0.01"
                  />
                </Entity>
              </Entity>

              {/* Elementos decorativos adicionales */}
              <Entity
                geometry="primitive: torus; radius: 0.3; radiusTubular: 0.05"
                material="color: #E76F51; metalness: 0.8; roughness: 0.2"
                position="1 0.5 0"
                rotation="0 0 30"
                animation="property: rotation; to: 0 360 30; loop: true; dur: 8000"
              />
            </Entity>

            <Entity primitive="a-camera" />
          </Scene>
        </div>

        {!isInArMode && (
          <div className="ion-text-center ion-padding">
            <p>Personaliza esta escena con tus propios modelos y textos</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PruebaModeloPage;
