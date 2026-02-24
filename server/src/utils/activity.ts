import { ActivityLog } from '../models';

export const logActivity = async (
  userId: string,
  type: string,
  description: string,
  metadata?: any
): Promise<void> => {
  try {
    await ActivityLog.create({
      userId,
      type,
      description,
      metadata,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to avoid disrupting the main flow if logging fails
  }
};
