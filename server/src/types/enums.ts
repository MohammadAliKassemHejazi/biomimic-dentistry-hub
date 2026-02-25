export enum UserRole {
  USER = 'user',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  AMBASSADOR = 'ambassador', // Kept for backward compatibility, but primarily an add-on status now
  ADMIN = 'admin',
}

export enum AccessLevel {
  PUBLIC = 'public',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  VIP = 'gold', // For backward compatibility with old 'vip' level if needed
}

export enum ContentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  UNPAID = 'unpaid',
}

export enum ContactStatus {
  NEW = 'new',
  READ = 'read',
  REPLIED = 'replied',
}

export enum AmbassadorApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PartnershipRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
