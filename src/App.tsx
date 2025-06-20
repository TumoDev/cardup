import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */

/* Theme variables */
import './theme/variables.css';
import { LoginPage, NotFoundPage, RegisterPage, Dashboard, RestaurantSelectionPage, ProductoPage, Home, MenuPage } from './pages';
import '@google/model-viewer';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />

        <Route exact path="/restaurant-selection" component={RestaurantSelectionPage} />

        <Route exact path="/home/:id" component={Home} />
        <Route exact path="/menu/:id" component={MenuPage} />


        <Route exact path="/dashboard" component={Dashboard} />

        <Route exact path="/404" component={NotFoundPage} />
        <Route exact path="/producto/:id" component={ProductoPage} />


      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
