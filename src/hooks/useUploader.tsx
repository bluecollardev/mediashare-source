import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as DocumentPicker from 'expo-document-picker';
import { ImagePickerResult, ImagePickerAsset, MediaTypeOptions } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import Config from 'mediashare/config';
import { awsUrl, imageRoot } from 'mediashare/core/aws/key-factory';
import { fetchAndPutToS3 } from 'mediashare/core/aws/storage';
import { setError } from 'mediashare/store/modules/appState';
import { createImage } from 'mediashare/store/modules/mediaItem';

const maxUpload = parseInt(String(Config.MaxUpload), 10) || 104857600;

interface UploaderConfig {
  onUploadStart?: () => any;
  onUploadComplete?: (uri) => any;
}

export function useUploader({
  onUploadStart = () => undefined,
  onUploadComplete = (uri) => undefined,
}: UploaderConfig) {
  const dispatch = useDispatch();
  
  // TODO: Add some sort of progress indicator, progress is already returned in this component...
  const [percentage, setPercentage] = useState(0);
  
  return {
    takePhoto,
    pickImage,
    pickVideo,
  }
  
  function setLoading(progress) {
    const calculated = parseInt(progress.loaded) / parseInt(progress.total) * 100;
    updatePercentage(calculated);
  }
  
  function updatePercentage(number) {
    setPercentage(number);
  }
  
  async function takePhoto(): Promise<void> {
    let image;
    try {
      image = await ImagePicker.launchCameraAsync({
        mediaTypes: MediaTypeOptions.Images,
        aspect: [16, 9],
        quality: 0.5,
      });
    } catch (err) {
      console.log('launchCameraAsync failed');
      console.log(err);
    }
    
    try {
      onUploadStart();
      const { key } = await handleImagePicked(image);
      onUploadComplete(awsUrl + key);
    } catch (err) {
      console.log('Upload failed');
      console.log(err);
    }
  }
  
  async function pickImage(): Promise<void> {
    let image;
    try {
      image = await ImagePicker.launchImageLibraryAsync({
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
      onUploadStart();
      const { key } = await handleImagePicked(image);
      onUploadComplete(awsUrl + key);
    } catch (err) {
      console.log('Upload failed');
      console.log(err);
    }
  }
  
  async function handleImagePicked(pickerResult: ImagePickerResult) {
    if (!pickerResult.assets) {
      return;
    }
    
    if (pickerResult.canceled) {
      console.log('Upload cancelled');
      return;
    } else {
      setPercentage(0);
  
      const {
        fileName,
        type,
        uri
      } = pickerResult?.assets?.[0] as ImagePickerAsset;
      const imageKey = imageRoot + fileName;
      
      return await fetchAndPutToS3({
        key: imageKey,
        fileUri: uri,
        options: {
          contentType: type,
          progressCallback(progress) {
            setLoading(progress);
          },
        }
      });
    }
  }
  
  async function pickVideo() {
    let video: ImagePickerResult;
    try {
      video = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Videos,
        allowsMultipleSelection: false,
        // aspect: [16, 9],
        // TODO: How do we want to set our quality?
        quality: 0.5,
      });
    } catch (err) {
      console.log('launchImageLibraryAsync failed');
      console.log(err);
    }
  
    try {
      const {
        fileName,
        fileSize,
        uri
      } = video?.assets?.[0] as ImagePickerAsset;
      
      if (!video || video.canceled) {
        return;
      }
      if (!video || fileSize > maxUpload) {
        dispatch(setError({ name: 'File too big', message: `Files must be under ${maxUpload / 1024 / 1024} Mb` }));
        return;
      }
      
      onUploadStart();
  
      try {
        console.log('Video uploaded');
        console.log(video);
        await dispatch(createImage({ key: fileName, fileUri: uri }));
      } catch (err) {
        console.log('Dispatching createImage action failed');
        onUploadComplete('');
        console.log(err);
      }
  
      await onUploadComplete(video);
    } catch (err) {
      console.log('Upload failed');
      console.log(err);
    }
  }
  
  async function pickDocument() {
    // TODO: Only MP4 supported right now?
    const video: ImagePickerResult = (await DocumentPicker.getDocumentAsync({ type: 'video/mp4' })) as any;
    const {
      fileName,
      fileSize,
      uri,
    } = video?.assets?.[0] as ImagePickerAsset;
    if (!video || video.canceled) {
      return;
    }
    if (!video || fileSize > maxUpload) {
      dispatch(setError({ name: 'File too big', message: `Files must be under ${maxUpload / 1024 / 1024} Mb` }));
      return;
    }
    
    onUploadStart();
    
    try {
      await dispatch(createImage({ key: fileName, fileUri: uri }));
    } catch (err) {
      console.log('Dispatching createImage action failed');
      onUploadComplete('');
      console.log(err);
    }
    
    await onUploadComplete(video);
  }
}
