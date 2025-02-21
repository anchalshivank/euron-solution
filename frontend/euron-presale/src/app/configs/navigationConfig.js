import i18next from 'i18next';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';

i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('tr', 'navigation', tr);
i18next.addResourceBundle('ar', 'navigation', ar);

const navigationConfig = [

  {
    id: 'presale-claim',
    type: 'group',
    icon: 'heroicons-outline:home',
    translate: 'Presale',
    children: [
      {
        id: 'presale-component',
        title: 'Presale',
        type: 'item',
        icon: 'material-twotone:monetization_on',
        url: '/main',
      },
      {
        id: 'manager-link-component',
        title: 'Manager Link',
        type: 'item',
        icon: 'material-twotone:supervised_user_circle',
        url: '/manager',
      }
    ],
  },
  
];

export default navigationConfig;
