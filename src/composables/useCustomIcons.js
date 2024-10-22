// useCustomIcons.js
// Look at maint.ts file for more configs

// Solid icons
import { addIcons } from 'ionicons';
import homeIcon from '../icons/solid/house-solid.svg';
import locationDotIcon from '../icons/solid/location-dot-solid.svg';
import recipesIcon from '../icons/solid/fork-knife-solid.svg';
import moreIcon from '../icons/solid/ellipsis-solid.svg';
import weeklyAdIcon from '../icons/solid/solid-calendar-lines-circle-dollar.svg';
import myStoreIcon from '../icons/solid/cart-circle-check-solid.svg';
import rewardsIcon from '../icons/solid/circle-dollar-to-slot-solid.svg';
import notificationsIcon from '../icons/solid/bell-exclamation-solid.svg';
import setLocationIcon from '../icons/solid/solid-circle-location-arrow-user.svg';
import visitWebsiteIcon from  '../icons/solid/globe-pointer-solid.svg';
import phoneIcon from  '../icons/solid/phone-flip-solid.svg';
import getDirectionsIcon from  '../icons/solid/diamond-turn-right-solid.svg';
import shareIcon from  '../icons/solid/arrow-up-from-bracket-solid.svg';
import backButtonIcon from  '../icons/solid/arrow-left-solid.svg';
import servingSizeIcon from  '../icons/solid/user-group-simple-solid.svg';
import prepTimeIcon from  '../icons/solid/clock-solid.svg';
import cookTimeIcon from  '../icons/solid/temperature-three-quarters-solid.svg';
import totalTimeIcon from  '../icons/solid/plate-utensils-solid.svg';
import loadingIcon from '../icons/solid/circle-notch-solid.svg';
import chevronRightIcon from '../icons/solid/chevron-right-solid.svg'

// Brand icons
import facebookIcon from  '../icons/brands/facebook-f-brands-solid.svg';

const customIcons = {
  'house': homeIcon,
  'location-dot': locationDotIcon,
  'fork-knife': recipesIcon,
  'more': moreIcon,
  'weekly-ad': weeklyAdIcon,
  'my-store': myStoreIcon,
  'rewards': rewardsIcon,
  'notifications': notificationsIcon,
  'set-location': setLocationIcon,
  'website': visitWebsiteIcon,
  'facebook': facebookIcon,
  'phone': phoneIcon,
  'get-directions': getDirectionsIcon,
  'share': shareIcon,
  'back-button': backButtonIcon,
  'serving-size': servingSizeIcon,
  'prep-time': prepTimeIcon,
  'cook-time': cookTimeIcon,
  'total-time': totalTimeIcon,
  'app-loading': loadingIcon,
  'chevron-right': chevronRightIcon,
  // Add more custom icons here
};

export function registerCustomIcons() {
  addIcons(customIcons);
}