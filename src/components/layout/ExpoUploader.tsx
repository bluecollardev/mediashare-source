import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ImagePickerResult, MediaTypeOptions } from 'expo-image-picker';
import Config from 'mediashare/config';
import { awsUrl, thumbnailRoot } from 'mediashare/core/aws/key-factory'
import { fetchAndPutToS3 } from 'mediashare/core/aws/storage';
import { setError } from 'mediashare/store/modules/appState';
import { createThumbnail } from 'mediashare/store/modules/mediaItem';

import { theme } from 'mediashare/styles';
import React, { useState } from 'react';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';

interface AppUploadProps {
  onUploadStart?: () => any;
  onUploadComplete?: (uri) => any;
  uploadMode: 'video' | 'photo';
  label?: string;
  children?: any;
}

const maxUpload = parseInt(Config.MaxUpload, 10) || 104857600;

export function ExpoUploader({
  uploadMode = 'photo',
  onUploadStart = () => undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUploadComplete = (uri) => undefined,
  label = 'Upload Picture',
  children,
}: AppUploadProps) {
  const dispatch = useDispatch();
  label = label || (uploadMode === 'video' ? 'Upload Video' : uploadMode === 'photo' ? 'Upload Photo' : 'Upload File');
  
  // TODO: Add some sort of progress indicator, progress is already returned in this component...
  const [percentage, setPercentage] = useState(0);

  if (children) {
    return React.cloneElement(React.Children.only(children), {
      onPress: uploadMode === 'video' ? () => pickVideo() : () => pickImage(),
    });
  }

  return (
    <Button
      icon="cloud-upload"
      mode="contained"
      dark
      color={theme.colors.error}
      onPress={uploadMode === 'video' ? () => pickVideo() : () => pickImage()}
      compact
    >
      {label}
    </Button>
  );

  async function pickVideo() {
    // TODO: Only MP4 supported right now?
    const video = (await DocumentPicker.getDocumentAsync({ type: 'video/mp4' })) as any;
    // TODO: Ideally we don't have to check for the video type cancel here, improve whatever logic is setting the value!
    if (!video || video.type === 'cancel') {
      return;
    }
    if (!video || video.size > maxUpload) {
      dispatch(setError({ name: 'File too big', message: `Files must be under ${maxUpload / 1024 / 1024} Mb` }));
      return;
    }

    onUploadStart();

    try {
      await dispatch(createThumbnail({ key: video.name, fileUri: video.uri }));
    } catch (err) {
      console.log('Dispatching createThumbnail action failed');
      onUploadComplete('');
      console.log(err);
    }

    await handleUploadComplete(video);
    // setDocumentUri(document.uri || '');
  }
  
  async function takePhoto(): Promise<void> {
    let result;
    try {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: MediaTypeOptions.Images,
        aspect: [16, 9],
        quality: 0.5,
      });
    } catch (err) {
      console.log('launchCameraAsync failed');
      console.log(err);
    }
  
    try {
      await handleImagePicked(result);
    } catch (err) {
      console.log('Upload failed');
      console.log(err);
    }
  }
  
  async function pickImage(): Promise<void> {
    let result;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        aspect: [16, 9],
        quality: 0.5,
      });
    } catch (err) {
      console.log('launchImageLibraryAsync failed');
      console.log(err);
    }
    
    try {
      await handleImagePicked(result);
    } catch (err) {
      console.log('Upload failed');
      console.log(err);
    }
  }
  
  async function handleImagePicked(pickerResult: ImagePickerResult) {
    onUploadStart();
    if (!pickerResult.assets) {
      return;
    }
    
    if (pickerResult.canceled) {
      console.log('Upload cancelled');
      return;
    } else {
      setPercentage(0);
      
      const image = pickerResult.assets[0];
      const thumbnailKey = thumbnailRoot + image.fileName;
      
      const { key } = await fetchAndPutToS3({
        key: thumbnailKey,
        fileUri: image.uri,
        options: {
          contentType: image.type,
          progressCallback(progress) {
            setLoading(progress);
          },
        }
      });
      
      await handleUploadComplete(awsUrl + key);
    }
  }
  
  function setLoading(progress) {
    const calculated = parseInt(progress.loaded) / parseInt(progress.total) * 100;
    updatePercentage(calculated);
  }
  
  function updatePercentage(number) {
    setPercentage(number);
  }

  async function handleUploadComplete(uri) {
    onUploadComplete(uri);
  }
}
