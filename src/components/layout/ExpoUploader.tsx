import React from 'react';
import { Button } from 'react-native-paper';
import { useUploader } from 'mediashare/hooks/useUploader';
import { theme } from 'mediashare/styles';

interface AppUploadProps {
  onUploadStart?: () => any;
  onUploadComplete?: (uri) => any;
  uploadMode: 'video' | 'photo';
  label?: string;
  children?: any;
}

export function ExpoUploader({
  uploadMode = 'photo',
  onUploadStart = () => undefined,
  onUploadComplete = (uri) => undefined,
  label = 'Upload Picture',
  children,
}: AppUploadProps) {
  label = label || (uploadMode === 'video' ? 'Upload Video' : uploadMode === 'photo' ? 'Upload Photo' : 'Upload File');
  
  const { pickImage, pickVideo } = useUploader({
    onUploadStart,
    onUploadComplete
  });

  if (children) {
    return React.cloneElement(React.Children.only(children), {
      onPress: uploadMode === 'video'
        ? () => pickVideo()
        : () => pickImage()
    });
  }

  return (
    <Button
      icon="cloud-upload"
      mode="contained"
      dark
      color={theme.colors.error}
      onPress={uploadMode === 'video'
        ? () => pickVideo()
        : () => pickImage()
      }
      compact
    >
      {label}
    </Button>
  );
}
