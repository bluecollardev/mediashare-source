import React, { useState } from 'react';
import { Snackbar } from 'react-native-paper';

export const useSnack = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const onToggleSnackBar = (value: boolean = undefined) => {
    setVisible(value ?  value : !visible);
  }

  const onDismissSnackBar = () => setVisible(false);
  const element = (
    <Snackbar key={visible}
      duration={2000}
      elevation={100}
      style={{
        borderRadius: 10,
      }}
      visible={visible}
      onDismiss={onDismissSnackBar}
      // action={{
      //   label: 'close',
      //   onPress: () => {
      //     // Do something
      //   },
      // }}
    >
      {message}
    </Snackbar>
  );
  return {
    element,
    onToggleSnackBar,
    setMessage,
  };
};
