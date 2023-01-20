import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useAppSelector } from 'mediashare/store';
import { useDispatch } from 'react-redux';
import { findItemsSharedByMe, findItemsSharedWithMe } from 'mediashare/store/modules/shareItems';
import { loadProfile } from 'mediashare/store/modules/profile';
import { useProfile } from 'mediashare/hooks/useProfile';
import { useViewItemsSharedByMe, useViewItemsSharedWithMe } from 'mediashare/hooks/navigation';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { Divider } from 'react-native-paper';
// import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import {
  PageContainer,
  PageProps,
  AccountCard,
  ListItem,
  KeyboardAvoidingPageContent,
} from 'mediashare/components/layout';

interface ContactProps extends PageProps {}

const Contact = ({ route, globalState }: ContactProps) => {
  const accountId = globalState?.user?._id;
  const { userId } = route.params;

  const dispatch = useDispatch();

  const viewSharedByContact = useViewItemsSharedWithMe();
  const viewSharedWithContact = useViewItemsSharedByMe();

  const profile = useProfile();

  const { username, firstName, lastName, email, phoneNumber, imageSrc } = profile || {};
  const fullName = firstName || lastName ? `${firstName} ${lastName}` : 'Unnamed User';

  const itemsSharedWithContact = (useAppSelector((state) => state?.shareItems?.sharedByMe?.entities) || []).filter((item) => item.sharedWithUserId === userId);

  const itemsSharedByContact = (useAppSelector((state) => state?.shareItems?.sharedWithMe?.entities) || []).filter((item) => item.sharedByUserId === userId);

  useEffect(() => {
    dispatch(loadProfile(userId));
    dispatch(findItemsSharedByMe());
    dispatch(findItemsSharedWithMe());
  }, [userId]);
  
  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
        <ScrollView alwaysBounceVertical={false} contentContainerStyle={styles.formContainer}>
          <View>
            <AccountCard
              title={fullName}
              username={username}
              email={email}
              phoneNumber={phoneNumber}
              image={imageSrc}
              showActions={false}
              isCurrentUser={false}
            />
            <Divider />
            <ListItem
              key={'sharedByContact'}
              title="Items They're Sharing"
              description={`${itemsSharedByContact?.length || 0} shared items`}
              itemId={'sharedByContact'}
              showActions={true}
              onViewDetail={() => viewSharedByContact(userId)}
            />
            <ListItem
              key={'sharedWithContact'}
              title="Items You're Sharing"
              description={`${itemsSharedWithContact?.length || 0} shared items`}
              itemId={'sharedWithContact'}
              showActions={true}
              onViewDetail={() => viewSharedWithContact(userId)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingPageContent>
    </PageContainer>
  );
};

export default withLoadingSpinner(undefined)(Contact);

const styles = StyleSheet.create({
    formContainer: {
      padding: 10,
        paddingTop: 20,
    },
  });
