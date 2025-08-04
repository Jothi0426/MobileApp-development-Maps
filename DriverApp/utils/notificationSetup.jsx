import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export const setupNotifications = async (onAccept) => {
  if (!Device.isDevice) {
    alert('Must use a physical device');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (finalStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Notification permission not granted');
    return;
  }

  await Notifications.setNotificationCategoryAsync('ride_request', [
    {
      identifier: 'ACCEPT',
      buttonTitle: 'Yes',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'DECLINE',
      buttonTitle: 'No',
      options: { isDestructive: true },
    },
  ]);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  Notifications.addNotificationResponseReceivedListener((response) => {
    const action = response.actionIdentifier;
    const { latitude, longitude, user_id } = response.notification.request.content.data;

    if (action === 'ACCEPT') {
      onAccept({ latitude, longitude, user_id });
    }
  });
};

export const showNotification = async (latitude, longitude, user_id) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New Ride Request',
      body: 'Do you want to accept this ride?',
      data: { latitude, longitude, user_id },
      categoryIdentifier: 'ride_request',
    },
    trigger: null,
  });
};
