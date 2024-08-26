import PushNotification from 'react-native-push-notification';

const createLocalNotification = () => {
  PushNotification.localNotification({
    title: 'Local Notification Title', // Notification title
    message: 'This is a local notification message.', // Notification message
    playSound: true, // Optionally play a sound with the notification
    soundName: 'default', // You can set a custom sound name
  });
};
