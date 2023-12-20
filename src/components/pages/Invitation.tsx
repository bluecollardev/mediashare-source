import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadProfile } from 'mediashare/store/modules/profile';
import { acceptInvitation, loadCurrentUserConnections } from 'mediashare/store/modules/userConnections';
import { useProfile } from 'mediashare/hooks/useProfile';
import { useGoBack } from 'mediashare/hooks/navigation';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { withGlobalStateConsumer } from 'mediashare/core/globalState'
import { PageContainer, PageProps, AccountCard, ActionButtons } from 'mediashare/components/layout';
// import { StyleSheet } from 'react-native';
import { theme } from 'mediashare/styles';

interface InvitationProps extends PageProps {}

const Invitation = ({ route, globalState }: InvitationProps) => {
  const accountSub = globalState?.user?.sub;
  
  const { userId: userSub } = route.params;
  
  const goBack = useGoBack();

  const dispatch = useDispatch();

  const profile = useProfile();

  const { username, firstName, lastName, email, phoneNumber, imageSrc } = profile || {};
  const fullName = firstName || lastName ? `${firstName} ${lastName}` : 'Unnamed User';

  useEffect(() => {
    dispatch(loadProfile(userSub)).then(() => {
      dispatch(loadCurrentUserConnections());
    });
  }, [userSub]);

  // const [fabState, setFabState] = useState({ open: false });
  // const fabActions = [{ icon: 'rule', onPress: () => activateUnshareMode(), color: theme.colors.text, style: { backgroundColor: theme.colors.error } }];
  
  return (
    <PageContainer>
      <AccountCard
        title={fullName}
        text={`${username} has invited you to join their network on Mediashare.`}
        image={imageSrc}
        email={null}
        phoneNumber={null}
        showActions={false}
        isCurrentUser={false}
      />
      <ActionButtons
        containerStyles={{ marginTop: 15 }}
        onSecondaryClicked={() => goBack()}
        onPrimaryClicked={async () => {
          await accept()
        }}
        primaryLabel="Accept"
        primaryIcon="check"
        secondaryLabel="Decline"
        secondaryButtonStyles={{ backgroundColor: theme.colors.errorDark, width: 200, marginRight: 10 }}
      />
    </PageContainer>
  );
  
  async function accept() {
    await dispatch(acceptInvitation({ userId: accountSub, connectionId: userSub }));
    await dispatch(loadCurrentUserConnections());
    goBack();
  }
  
  /* async function createUserAWS(data: IFromInput) {
    try {
      const { username, email } = data;
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/user/invite`,
        //`http://localhost:5000/api/user/invite`,
        { username, email },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        }
      );
      return result
    } catch (error) {
      throw error;
    }
  }
  
  async function createConnection(data: IFromInput) {
    try {
      const {
        data: { _id },
      } = await createUserAWS(data);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/user-connection`,
        //`http://localhost:5000/api/user-connection`,
        { userId: _id, connectionId: id },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      throw error;
    }
  } */
};

export default withLoadingSpinner(undefined)(withGlobalStateConsumer(Invitation));

// const styles = StyleSheet.create({});
