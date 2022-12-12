import { usePageRoute } from 'mediashare/hooks/navigation'
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { compose } from 'recompose';
import { useAppSelector } from 'mediashare/store';
import { useUser } from 'mediashare/hooks/useUser';
import { loadUser, setIsAcceptingInvitationAction } from 'mediashare/store/modules/user'
import { getTags } from 'mediashare/store/modules/tags';
import { BcRolesType, ProfileDto, Tag } from 'mediashare/rxjs-api';

export interface GlobalStateProps {
  history?: any;
  location?: any;
  loading?: boolean;
  isLoggedIn?: boolean;
  user?: Partial<ProfileDto>;
  roles?: BcRolesType[];
  build?: {
    forFreeUser: boolean;
    forSubscriber: boolean;
    forAdmin: boolean;
  };
  openInvitation?: () => void;
  isAcceptingInvitationFrom?: string;
  loadUserData?: () => void;
  search?: any;
  searchIsActive?: boolean;
  setSearchIsActive?: Function;
  setSearchFilters?: Function;
  searchIsFiltering?: () => boolean;
  openSearchConsole?: Function;
  closeSearchConsole?: Function;
  tags?: Tag[];
  displayMode?: 'list' | 'article';
  setDisplayMode: (value) => void;
}

export const GlobalState = React.createContext<GlobalStateProps>({} as GlobalStateProps);

export const INITIAL_SEARCH_FILTERS = {
  text: '',
  tags: [],
};

export const INITIAL_DISPLAY_MODE = 'list';
export const DEFAULT_USER_ROLE = 'free';

export const GlobalStateProviderWrapper = (WrappedComponent: any) => {
  return function GlobalStateProvider(props: any) {
    const { history, location } = props;

    const loading = useAppSelector((state) => state?.app?.loading);
    const tags = useAppSelector((state) => state?.tags?.entities || []);
    
    const [searchIsActive, setSearchIsActive] = useState(false);
    const [searchFilters, setSearchFilters] = useState(INITIAL_SEARCH_FILTERS);
    const [displayMode, setDisplayMode] = useState(INITIAL_DISPLAY_MODE);

    const user = useUser();
    const { roles, isLoggedIn, build } = user;
    
    const isAcceptingInvitationFrom = useAppSelector((state) => state?.user?.isAcceptingInvitationFrom);

    const dispatch = useDispatch();

    useEffect(() => {
      const loadTags = async () => {
        await dispatch(getTags());
      };

      if (isLoggedIn) {
        loadTags().then();
      }
    }, [isLoggedIn, isAcceptingInvitationFrom]);

    const providerValue = getProviderValue() as GlobalStateProps;

    return (
      <GlobalState.Provider value={providerValue}>
        <WrappedComponent {...props} globalState={providerValue} />
      </GlobalState.Provider>
    );

    function getProviderValue() {
      const value = {
        history,
        location,
        loading,
        isLoggedIn,
        user,
        roles,
        build,
        isAcceptingInvitationFrom,
        openInvitation,
        loadUserData,
        openSearchConsole,
        closeSearchConsole,
        searchIsActive,
        setSearchIsActive,
        searchIsFiltering,
        setSearchFilters,
        search: {
          filters: { ...searchFilters },
        },
        tags,
        displayMode,
        setDisplayMode,
      } as GlobalStateProps;
      return value;
    }
    
    async function openInvitation() {
      const goToInvitation = usePageRoute('Account', 'invitation');
      await dispatch(setIsAcceptingInvitationAction(undefined));
      goToInvitation({ userId: isAcceptingInvitationFrom });
    }

    async function loadUserData() {
      await dispatch(loadUser({}));
    }

    function openSearchConsole() {
      setSearchIsActive(true);
    }

    function closeSearchConsole() {
      setSearchIsActive(false);
      setSearchFilters({ text: '', tags: [] });
    }

    function searchIsFiltering() {
      return searchFilters?.text !== '' || searchFilters?.tags?.length > 0;
    }
  };
};

const GlobalStateConsumerWrapper = (WrappedComponent: any) => {
  return function GlobalStateConsumer(props) {
    return (
      <GlobalState.Consumer>
        {(globalState) => {
          return <WrappedComponent {...props} globalState={globalState} />;
        }}
      </GlobalState.Consumer>
    );
  };
};

const withGlobalStateProvider = compose(GlobalStateProviderWrapper);
const withGlobalStateConsumer = GlobalStateConsumerWrapper;

export { withGlobalStateProvider, withGlobalStateConsumer };
