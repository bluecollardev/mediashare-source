import { View, ActivityIndicator } from 'react-native'
import React from 'react'

const Loader = (props) => {
  return (
    <View
      style={{
        position: 'absolute',
        top: '50%',
        left: '42%',
        zIndex: 10,
        padding: 10,
        borderRadius: 10,
        opacity: 0.5,
      }}>
         {props?.loading && (
      <ActivityIndicator  size="large" color={'white'} />
      )}
    </View>
  )
}

export default Loader
