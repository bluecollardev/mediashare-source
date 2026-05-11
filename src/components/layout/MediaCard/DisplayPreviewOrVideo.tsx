import React, { useEffect, useState ,useRef} from 'react';
import { Audio, ResizeMode, Video } from 'expo-av';
import { Dimensions, ImageBackground, TouchableWithoutFeedback, View } from 'react-native';
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
  
  // Image previews stay 1:1. Video plays at 16:9, capped at the current
  // screen width so it never exceeds the viewport regardless of how the
  // parent container is laid out. overflow:hidden + position:absolute on
  // the video makes the wrapper the absolute size box — the video element
  // is forced inside it and objectFit:contain scales it down to fit.
  const isVideo = mediaDisplayMode === 'video';
  const containerAspect = isVideo ? 16 / 9 : 1 / 1;
  const screenWidth = Dimensions.get('window').width;

  return (
    <View
      style={{
        aspectRatio: containerAspect,
        width: '100%',
        maxWidth: isVideo ? screenWidth : undefined,
        height: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
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
          // Force the inner <video> element into the wrapper's box via
          // absolute positioning. Native AVPlayer/MediaPlayer (iOS/Android)
          // honors resizeMode; HTML5 <video> on web honors object-fit.
          style={
            {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            } as any
          }
          videoStyle={{ objectFit: 'contain' as any }}
          usePoster={true}
          posterSource={imageSrc}
          posterStyle={{ resizeMode: 'contain' as any }}
          source={{ uri: mediaUrl }}
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
