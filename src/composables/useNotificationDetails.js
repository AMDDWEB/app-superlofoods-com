export function useNotificationDetails() {
    const transformNotificationData = (notification = {}) => {
        return {
            notification_title: notification.title,
            notification_details: notification.details,
        };
    };

    const transformAllNotifications = (notifications = []) => {
        return notifications.map(transformNotificationData);
    };

    return {
        transformNotificationData,
        transformAllNotifications, // Added to the returned object
    };
}