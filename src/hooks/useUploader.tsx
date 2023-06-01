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
import { Platform } from 'react-native';

const maxUpload = parseInt(String(Config.MaxUpload), 10) || 104857600;

export interface UploadResult extends ImagePickerAsset {
  thumbnail?: any;
}

export interface UploaderConfig {
  onUploadStart?: () => any;
  onUploadComplete?: (result: UploadResult) => void;
}

export function useUploader({
  onUploadStart = () => undefined,
  onUploadComplete = (result: UploadResult) => undefined,
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
      onUploadStart();
      const uploadedImage = await handleImagePicked(result);
      onUploadComplete({ ...uploadedImage } as UploadResult);
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
    }
    
    try {
      onUploadStart();
      const uploadedImage = await handleImagePicked(result);
      onUploadComplete({ ...uploadedImage } as UploadResult);
    } catch (err) {
      console.log('Upload failed');
      console.log(err);
    }
  }
  
  async function handleImagePicked(pickerResult: ImagePickerResult): Promise<UploadResult> {
    if (Platform.OS==='android') {
      if (!pickerResult || !pickerResult.assets) {
        return;
      }
      
      if (pickerResult.canceled) {
        console.log('Upload cancelled');
        return;
      } else {
        setPercentage(0);
    
        const asset = pickerResult?.assets?.[0]
      const  newFile=asset?.uri?.split('/')
      const fileName2=newFile[newFile?.length-1]
        const {
          fileName,
          type,
          uri
        } = asset as ImagePickerAsset;
        const imageKey = imageRoot + fileName2;
        const { key } = await fetchAndPutToS3({
          key: imageKey,
          fileUri: uri,
          options: {
            contentType: type,
            progressCallback(progress) {
              setLoading(progress);
            },
          }
        });
        
        return {
          ...asset,
          uri: awsUrl + key,
        } as UploadResult;
      }
    } else {
      if (!pickerResult || !pickerResult.assets) {
        return;
      }
      
      if (pickerResult.canceled) {
        console.log('Upload cancelled');
        return;
      } else {
        setPercentage(0);
        const asset = pickerResult?.assets?.[0]
        const {
          fileName,
          type,
          uri
        } = asset as ImagePickerAsset;
        const imageKey = imageRoot + fileName
        const { key } = await fetchAndPutToS3({
          key: imageKey,
          fileUri: uri,
          options: {
            contentType: type,
            progressCallback(progress) {
              setLoading(progress);
            },
          }
        });
        
        return {
          ...asset,
          uri: awsUrl + key,
        } as UploadResult;
      }
    }
  }
  
  async function pickVideo() {
    let result: ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
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
      const asset = result?.assets?.[0];
      const {
        fileName,
        fileSize,
        uri
      } = asset as ImagePickerAsset;
      
      if (!result || result.canceled) {
        return;
      }
      if (!result || fileSize > maxUpload) {
        dispatch(setError({ name: 'File too big', message: `Files must be under ${maxUpload / 1024 / 1024} Mb` }));
        return;
      }
      
      onUploadStart();
  
      try {
        console.log('Video uploaded');
        console.log(asset);
        const { payload } = await dispatch(createImage({ key: fileName, fileUri: uri }));
        await onUploadComplete({ ...asset, thumbnail: payload });
      } catch (err) {
        console.log('Dispatching createImage action failed');
        onUploadComplete({} as UploadResult);
        console.log(err);
      }
      
    } catch (err) {
      console.log('Upload failed');
      console.log(err);
    }
  }
  
  /**
   * TODO: This is WIP
   */
  async function pickDocument() {
    // TODO: Only MP4 supported right now?
    const result: ImagePickerResult = (await DocumentPicker.getDocumentAsync({ type: 'video/mp4' })) as any;
    const asset = result?.assets?.[0];
    const {
      fileName,
      fileSize,
      uri,
    } = asset as ImagePickerAsset;
    if (!result || result.canceled) {
      return;
    }
    if (!result || fileSize > maxUpload) {
      dispatch(setError({ name: 'File too big', message: `Files must be under ${maxUpload / 1024 / 1024} Mb` }));
      return;
    }
    
    onUploadStart();
    
    try {
      await dispatch(createImage({ key: fileName, fileUri: uri }));
    } catch (err) {
      console.log('Dispatching createImage action failed');
      onUploadComplete({} as UploadResult);
      console.log(err);
    }
    
    await onUploadComplete({} as UploadResult);
  }
}
