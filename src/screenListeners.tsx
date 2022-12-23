import { StackActions } from '@react-navigation/native';
import { GlobalStateProps, INITIAL_SEARCH_FILTERS } from './core/globalState';
// Note re: popToTop https://github.com/react-navigation/react-navigation/issues/8583

// There is probably a better way to do this but we're going for speed here...
// Can we use Redux state somehow? Or some kind of localDB / persistent storage?
// That would be useful for storing the whole application state too...
// We'll implement this in an improved manner later
export const createBottomTabListeners =
  (globalState: GlobalStateProps) => {
    return ({ navigation }) => {
      return {
        tabPress: (e) => {
          const navigationState = navigation.getState();
          if (navigationState) {
            // Grab all the tabs that are NOT the one we just pressed, then reset tabs, and update stack
            const nonTargetTabs = navigationState.routes.filter((r) => r.key !== e.target);
            nonTargetTabs.forEach(({ key, state }) => {
              // Pass the stack key that we want to reset and use popToTop to reset it
              if (state && state.index !== 0) {
                navigation.dispatch(StackActions.popToTop, {
                  target: key,
                });
              }
            });
          }
      
          // TODO: Is there a better way to do this?
          // If we switch to the Feed tab ALWAYS reload the data, as we may have updated shared items elsewhere in the application!
          if (/^Feed-/.test(e.target)) {
            globalState?.loadUserData();
          }
        },
      }
    };
  }
  
