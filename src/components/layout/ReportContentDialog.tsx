import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MultiSelectIcon } from 'mediashare/components/form';
import { components, theme } from 'mediashare/styles';

const reasonOptions = [
  { key: 'inappropriate', value: 'Inappropriate content' },
  { key: 'misleading', value: 'Misleading information' },
  { key: 'spam', value: 'Spam' },
  { key: 'harassment', value: 'Harassment or hate speech' },
  { key: 'copyright', value: 'Copyright violation' },
  { key: 'other', value: 'Other' },
];

export interface ReportContentDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: { reason: string; comment: string }) => void;
  // Optional context label — e.g. the title of the item being reported.
  contextTitle?: string;
}

export const ReportContentDialog: React.FC<ReportContentDialogProps> = ({
  visible,
  onDismiss,
  onSubmit,
  contextTitle,
}) => {
  const [reasonKey, setReasonKey] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const reset = () => {
    setReasonKey([]);
    setComment('');
  };

  const submit = () => {
    const reason = reasonKey?.[0] || 'unspecified';
    onSubmit({ reason, comment });
    reset();
    onDismiss();
  };

  const cancel = () => {
    reset();
    onDismiss();
  };

  const selectedLabel =
    reasonOptions.find((r) => r.key === reasonKey?.[0])?.value ||
    'Select a reason';

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={cancel} style={styles.dialog}>
        <Dialog.Title style={styles.title}>Report content</Dialog.Title>
        <Dialog.Content>
          {contextTitle ? (
            <Text style={styles.context} numberOfLines={2}>
              {contextTitle}
            </Text>
          ) : null}
          <Text style={styles.label}>Reason</Text>
          <View style={styles.dropdownWrap}>
            <SectionedMultiSelect
              colors={components.multiSelect.colors}
              styles={components.multiSelect.styles}
              items={reasonOptions}
              IconRenderer={MultiSelectIcon as any}
              uniqueKey="key"
              displayKey="value"
              subKey="children"
              selectText={selectedLabel}
              confirmText="Done"
              onSelectedItemsChange={setReasonKey}
              selectedItems={reasonKey}
              single={true}
              hideSearch={true}
              showCancelButton={true}
              modalWithTouchable={false}
              modalWithSafeAreaView={true}
            />
          </View>
          <Text style={styles.label}>Additional details (optional)</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={Platform.OS === 'web' ? 4 : 3}
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us a little more"
            style={styles.commentInput}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={cancel} textColor={theme.colors.text}>
            Cancel
          </Button>
          <Button
            mode="contained"
            disabled={reasonKey.length === 0}
            buttonColor={theme.colors.error}
            textColor="#ffffff"
            onPress={submit}
          >
            Submit
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 10,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
  },
  context: {
    color: theme.colors.textDarker,
    fontSize: 12,
    marginBottom: 12,
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 6,
  },
  dropdownWrap: {
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: theme.colors.surface,
  },
});

export default ReportContentDialog;
