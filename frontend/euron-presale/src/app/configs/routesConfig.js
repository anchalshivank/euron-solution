import FuseUtils from '@fuse/utils';
import FuseLoading from '@fuse/core/FuseLoading';
import { Navigate } from 'react-router-dom';
// import settingsConfig from 'app/configs/settingsConfig';
// import SignInConfig from '../main/sign-in/SignInConfig';
// import SignUpConfig from '../main/sign-up/SignUpConfig';
// import SignOutConfig from '../main/sign-out/SignOutConfig';
import Error404Page from '../main/404/Error404Page';
import PresaleConfig from '../main/presale/PresaleConfig';

const routeConfigs = [PresaleConfig];

const routes = [
  ...FuseUtils.generateRoutesFromConfigs(routeConfigs),
  {
    path: '/',
    element: <Navigate to="/main" />,
    // auth: settingsConfig.defaultAuth,
  },
  {
    path: 'main',
    element: <Navigate to="/main" />,
    // auth: settingsConfig.defaultAuth,
  },
  {
    path: 'manager',
    element: <Navigate to="/manager" />,
    // auth: settingsConfig.defaultAuth,
  },
  {
    path: 'loading',
    element: <FuseLoading />,
  },
  {
    path: '404',
    element: <Error404Page />,
  },
  {
    path: '*',
    element: <Navigate to="404" />,
  },
];

export default routes;
