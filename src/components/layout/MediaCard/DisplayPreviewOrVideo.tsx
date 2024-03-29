import React, { useEffect, useState ,useRef} from 'react';
import { Audio, ResizeMode, Video } from 'expo-av';
import { ImageBackground, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from 'react-native-paper';
import { usePreviewImage } from 'mediashare/hooks/usePreviewImage';

type MediaDisplayMode = 'image' | 'video';

export interface DisplayPreviewOrVideoProps {
  mediaSrc?: string | null;
  isPlayable?: boolean;
  showImage?: boolean;
  image?: string;
  style?: any;
}

export const DisplayPreviewOrVideo: React.FC<DisplayPreviewOrVideoProps> = ({
  mediaSrc,
  isPlayable = false,
  showImage = true,
  image = null,
  style = {},
}) => {
  const getMediaDisplayMode = () => (showImage && image ? 'image' : 'video');
  const initialMediaDisplayMode = isPlayable ? (getMediaDisplayMode() as MediaDisplayMode) : 'image';
  const [mediaDisplayMode, setMediaDisplayMode] = useState(initialMediaDisplayMode);
  const [mediaUrl, setMediaUrl] = useState('');
  const { imageSrc, isDefaultImage } = usePreviewImage(image);
  
  const video = React.useRef(null);
  const ref = useRef(null);
  const [status, setStatus] = React.useState({});
  
useEffect(() => {
  checkUrl()
}, []);

const checkUrl = () => {
  const segments = mediaSrc?.split("/");
  if (segments !==undefined) {
    if (segments?.length && segments[4]==='videos') {
      setMediaUrl('https://mediashare0079445c24114369af875159b71aee1c04439-dev.s3.us-west-2.amazonaws.com/public/videos/'+segments[segments?.length-1])
    } else if (segments[4]==='temp') {
        setMediaUrl('https://mediashare0079445c24114369af875159b71aee1c04439-dev.s3.us-west-2.amazonaws.com/public/'+segments[segments?.length-1])
      } else {
        setMediaUrl(mediaSrc)
      }
    }
  };

  const triggerAudio = async (ref) => {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  };
  
  useEffect(() => {
    if (status) triggerAudio(ref);
  }, [ref, status]);
  
  return (
    <View
      style={{
        aspectRatio: 1 / 1,
        width: '100%',
        height: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        ...style,
      }}
    >
      {mediaDisplayMode === 'image' && !isDefaultImage ? (
        <ImageBackground source={{ uri: imageSrc }} resizeMode="cover" style={{ width: '100%', height: '100%' }}>
          {isPlayable ? (
            <TouchableWithoutFeedback onPress={toggleMediaMode}>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Button icon="play-circle-filled" textColor="rgba(255,255,255,0.666)" labelStyle={{ fontSize: 50 }}>
                  {' '}
                </Button>
              </View>
            </TouchableWithoutFeedback>
          ) : null}
        </ImageBackground>
      ) : mediaDisplayMode === 'video' && mediaSrc ? (
        <Video
          ref={video}
          style={{ width: '100%', height: '100%' }}
          usePoster={true}
          posterSource={imageSrc}
          source={{
            uri: mediaUrl,
          }}
          shouldPlay={true}
          useNativeControls={true}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={true}
          volume={1.0}
          // onPlaybackStatusUpdate={status => setStatus(() => status)}
        />
      ) : null}
    </View>
  );
  
  function toggleMediaMode() {
    const current = mediaDisplayMode as MediaDisplayMode;
    if (current === 'video') {
      setMediaDisplayMode('image');
    } else if (current === 'image') {
      setMediaDisplayMode('video');
    }
  }
};
