import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { universities } from "../data/universities";

const REMINDER_TYPE = "careercompass-application-deadline";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function getDeadlineNotificationPermission() {
  if (Platform.OS === "web") return false;
  const current = await Notifications.getPermissionsAsync();
  return current.granted || current.status === "granted";
}

export async function requestDeadlineNotificationPermission() {
  if (Platform.OS === "web") return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("application-deadlines", {
      name: "Application deadline reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === "granted") return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.status === "granted";
}

export async function syncDeadlineReminders(deadlines, enabled = true) {
  if (Platform.OS === "web") return 0;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.content.data?.type === REMINDER_TYPE)
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );

  if (!enabled || !(await getDeadlineNotificationPermission())) return 0;

  const now = Date.now();
  const futureReminders = deadlines
    .filter((deadline) => deadline?.closesAt)
    .map((deadline) => {
      const closesAt = deadline.closesAt?.toDate
        ? deadline.closesAt.toDate()
        : new Date(deadline.closesAt);
      if (Number.isNaN(closesAt.getTime())) return null;
      const reminderAt = new Date(closesAt);
      reminderAt.setDate(reminderAt.getDate() - 5);
      reminderAt.setHours(9, 0, 0, 0);
      return reminderAt.getTime() > now ? { deadline, reminderAt } : null;
    })
    .filter(Boolean);

  for (const { deadline, reminderAt } of futureReminders) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Application deadline in 5 days",
        body: `${deadline.universityName || universities.find(({ id }) => id === deadline.universityId)?.name || deadline.name || "A university"} applications close soon. Check the official deadline and submit on time.`,
        data: { type: REMINDER_TYPE, deadlineId: String(deadline.id || "") },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderAt,
        ...(Notifications.AndroidImportance ? { channelId: "application-deadlines" } : {}),
      },
    });
  }

  return futureReminders.length;
}
