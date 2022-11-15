import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadProfile } from 'mediashare/store/modules/profile';
import { useProfile } from 'mediashare/hooks/useProfile';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { FAB, Divider, Text, Card } from 'react-native-paper'
import { PageContainer, PageProps, AccountCard, ActionButtons } from 'mediashare/components/layout'
// import { StyleSheet } from 'react-native';
// import { theme } from 'mediashare/styles';

interface InvitationProps extends PageProps {}

const Invitation = ({ route, globalState }: InvitationProps) => {
  // const accountId = globalState?.user?._id;
  const { userId } = route.params;

  const dispatch = useDispatch();

  const profile = useProfile();

  const { username, firstName, lastName, email, phoneNumber, imageSrc } = profile || {};
  const fullName = firstName || lastName ? `${firstName} ${lastName}` : 'Unnamed User';

  useEffect(() => {
    dispatch(loadProfile(userId));
  }, [userId]);

  // const [fabState, setFabState] = useState({ open: false });
  // const fabActions = [{ icon: 'rule', onPress: () => activateUnshareMode(), color: theme.colors.text, style: { backgroundColor: theme.colors.error } }];

  return (
    <PageContainer>
      <AccountCard
        title={fullName}
        text={`@${username} has invited you to join their network on Mediashare.`}
        image={imageSrc}
        showSocial={false}
        showActions={false}
        isCurrentUser={false}
      />
      <ActionButtons
        containerStyles={{ marginTop: 15 }}
        onSecondaryClicked={() => {}}
        onPrimaryClicked={() => {}}
        primaryLabel="Accept"
      />
      {/* !isSelectable && (
        <FAB.Group
          visible={true}
          open={fabState.open}
          icon={fabState.open ? 'close' : 'more-vert'}
          actions={fabActions}
          color={theme.colors.text}
          fabStyle={{ backgroundColor: fabState.open ? theme.colors.default : theme.colors.primary }}
          onStateChange={(open) => {
            setFabState(open);
          }}
        />
      ) */}
    </PageContainer>
  );
  
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

export default withLoadingSpinner(undefined)(Invitation);

// const styles = StyleSheet.create({});
