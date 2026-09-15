export type AssessmentReminderInputs = {
  sentAt?: Date | string | null;
  lastReminderSentAt?: Date | string | null;
  dueDate?: Date | string | null;
};

const DAY_MS = 1000 * 60 * 60 * 24;

export function getAssessmentReminderDates({
  sentAt,
  lastReminderSentAt,
  dueDate,
}: AssessmentReminderInputs) {
  const baseSentAt = sentAt ? new Date(sentAt) : new Date();
  const due = dueDate ? new Date(dueDate) : new Date(baseSentAt.getTime() + DAY_MS * 14);
  const baseReminder = lastReminderSentAt ? new Date(lastReminderSentAt) : new Date(baseSentAt);
  const safeLastReminder = Number.isFinite(baseReminder.getTime()) ? baseReminder : new Date(baseSentAt);

  const reminderWindowStart = new Date(safeLastReminder.getTime() + DAY_MS * 5);
  const reminderWindowEnd = new Date(safeLastReminder.getTime() + DAY_MS * 7);

  const nextReminderCandidate = new Date(Math.min(reminderWindowEnd.getTime(), due.getTime()));
  const nextReminder =
    nextReminderCandidate >= reminderWindowStart && nextReminderCandidate <= reminderWindowEnd
      ? nextReminderCandidate
      : reminderWindowStart;

  const boundedNextReminder = due.getTime() < nextReminder.getTime() ? due : nextReminder;

  return {
    sentAt: baseSentAt,
    lastReminder: safeLastReminder,
    nextReminder: boundedNextReminder,
    dueDate: due,
  };
}

export function getSupplierLifecycleStatus(status: string | null): string {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'sent':
      return 'sent';
    case 'in_progress':
      return 'in_progress';
    case 'submitted':
      return 'submitted';
    case 'completed':
      return 'completed';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
}

export function shouldAutoSendAssessmentReminder({
  status,
  sentAt,
  lastReminderSentAt,
  dueDate,
  now = new Date(),
}: {
  status: string | null;
  sentAt?: Date | string | null;
  lastReminderSentAt?: Date | string | null;
  dueDate?: Date | string | null;
  now?: Date;
}) {
  if (status !== 'sent' && status !== 'in_progress') return false;

  const baseSentAt = sentAt ? new Date(sentAt) : now;
  const due = dueDate ? new Date(dueDate) : new Date(baseSentAt.getTime() + DAY_MS * 14);
  const lastReminder = lastReminderSentAt ? new Date(lastReminderSentAt) : new Date(baseSentAt);
  const reminderWindow = getAssessmentReminderDates({ sentAt: baseSentAt, lastReminderSentAt: lastReminder, dueDate: due });

  if (due.getTime() < now.getTime()) {
    return true;
  }

  return now.getTime() >= reminderWindow.nextReminder.getTime();
}
