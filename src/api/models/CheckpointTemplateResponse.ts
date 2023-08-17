export class NotificationChannelSettings {
    public enabled: boolean;
    public templateName: string;
    public templateId: string;
}
export class ReminderTimeSetting {
    public type: ReminderType;
    public timeUnit: TimeUnit;
    public timeValue: number;
    public timeDifference: string;
}

export class InclusionSetting {
    public physicians: boolean;
    public appointmentType: boolean;
    public validStatusCodes: boolean;
    public locations: boolean;
    public appointmentNotes: boolean;
}

export enum TriggerType {
    API_BASED = 'API_BASED',
    TIME_BASED = 'TIME_BASED',
    FLAG_BASED = 'FLAG_BASED',
}

export enum FlagType {
    REFERRAL_STATUS = 'REFERRAL_STATUS',
    ELIGIBILITY_STATUS = 'ELIGIBILITY_STATUS',
    AUTH_STATUS = 'AUTH_STATUS',
}

export enum ReferralStatus {
    INCOMPLETE = 'INCOMPLETE',
    RECEIVED = 'RECEIVED',
    IN_BOOKING = 'IN_BOOKING',
    REFERRAL_BOOKED = 'REFERRAL_BOOKED',
    VISIT_COMPLETE = 'VISIT_COMPLETE',
    REPORT_READY = 'REPORT_READY',
    REPORT_SENT = 'REPORT_SENT',
}

export enum ReminderType {
    PRE = 'PRE',
    BOOK = 'BOOK',
    POST = 'POST',
}

export enum TimeUnit {
    HOUR = 'HOUR',
    DAY = 'DAY',
    MINUTE = 'MINUTE',
}

export class TimeBased {
    public appointmentEvent: string;
}

export class ReferralBased {
    public referralType: string;
    public referralStatus: ReferralStatus;
}

export class ApiBased {
    public apiType: string;
}

export class FlagBased {
    public flagType: string;
}

export class DocumentBased {
    public documentType: string;
}
export class NoResponseTemplateSetting {
    public enabled: boolean;
    public timeValue: string;
    public timeUnit: string;
    public emrStatus: string;
    public appointmentStatus: string;
    public templateName: string;
    public templateId: string;
}

export class TriggerTypeSetting {
    public timeBased: TimeBased;
    public referralBased: ReferralBased;
    public apiBased: ApiBased;
    public documentBased: DocumentBased;
    public flagBased: FlagBased;
}

export class CombinationLimitSetting {
    public combinationLimit: number;
    public combinationGroupId: string;
    public combinationGroupName: string;
}
export class CheckPointTemplate {
    public uuid: string;
    public name: string;
    public type: string;
    public appointmentNotes: string;
    public triggerType: TriggerType;
    public enable: boolean;
    public validStatusCodes: string[];
    public apiType: string;
    public appointmentType: string[];
    public physicians: number[];
    public locations: number[];
    public invalidStatusCodes: string[];
    public registration: boolean;
    public limit: boolean;
    public combinationLimitSetting: CombinationLimitSetting;
    public inclusionSetting: InclusionSetting;
    public reminderTimeSetting: ReminderTimeSetting;
    public noResponseTemplateSetting: NoResponseTemplateSetting;
    public smsTemplateSetting: NotificationChannelSettings;
    public emailTemplateSetting: NotificationChannelSettings;
    public phoneTemplateSetting: NotificationChannelSettings;
    public triggerTypeSetting: TriggerTypeSetting;
}
