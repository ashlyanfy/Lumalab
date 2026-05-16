// Shape of the global "notifications" setting.
// Stored as a single row in the Setting table under key = "notifications".

export type NotificationChannel = 'off' | 'email' | 'telegram' | 'both';

export interface NotificationSettings {
  channel: NotificationChannel;
  telegramChatId: string; // overrides env TELEGRAM_CHAT_ID when non-empty
  emailRecipients: string; // comma-separated; overrides env MAIL_TO when non-empty
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  channel: 'telegram', // matches previous behaviour (env-based telegram)
  telegramChatId: '',
  emailRecipients: '',
};
