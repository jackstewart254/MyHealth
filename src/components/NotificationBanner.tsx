import React, {useEffect, useState} from 'react';
import {View, Text, Animated, StyleSheet} from 'react-native';
import messaging from '@react-native-firebase/messaging';

const NotificationBanner = () => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = new Animated.Value(-100);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      setNotification(remoteMessage.notification);
      setVisible(true);

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, 3000);
    });

    return unsubscribe;
  }, []);

  if (!visible || !notification) return null;

  return (
    <Animated.View
      style={[styles.banner, {transform: [{translateY: slideAnim}]}]}>
      <Text style={styles.title}>{notification.title}</Text>
      <Text style={styles.body}>{notification.body}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    padding: 10,
    zIndex: 1000,
  },
  title: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  body: {
    fontSize: 14,
    color: '#fff',
  },
});

export default NotificationBanner;
