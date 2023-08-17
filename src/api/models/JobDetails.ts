import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { FindOperator } from 'typeorm';
import { CheckPointTemplate } from './CheckpointTemplateResponse';

export enum TRIGGER_PERIOD {
    PRE = 'PRE',
    POST = 'POST',
    BOOK = 'BOOK',
    RESPONSE = 'RESPONSE',
}

export enum JOB_STATUS {
    JOB_CREATED = 'JOB_CREATED',
    JOB_INITIALIZED = 'JOB_INITIALIZED',
    JOB_SCHEDULED = 'JOB_SCHEDULED',
    JOB_PROCESSED = 'JOB_PROCESSED',
    JOB_REMOVED = 'JOB_REMOVED',
    JOB_STOPPED = 'JOB_STOPPED',
    CHECKPOINT_REJECTED = 'CHECKPOINT_REJECTED',
    JOB_REJECTED = 'JOB_REJECTED',
    NOTIFICATION_DONE = 'NOTIFICATION_DONE',
    NOTIFICATION_EXPIRED = 'NOTIFICATION_EXPIRED',
}

export enum JOB_METHODS {
    ADD_JOB = 'ADD_JOB',
    GET_STATUS = 'GET_STATUS',
    REMOVE_JOB = 'REMOVE_JOB',
    PROCESS_APPOINTMENT = 'PROCESS_APPOINTMENT',
    GET_JOB_COUNTS = 'GET_JOB_COUNTS',
}

export enum RESCHEDULE_TYPE {
    HEALTH_CHECK_RESCHEDULE = 'HEALTH_CHECK_RESCHEDULE',
    RESCHEDULE_NORMAL = 'RESCHEDULE_NORMAL',
    STUCKED_JOBS = 'STUCKED_JOBS',
}

export interface JobDetails {
    data: any;
    partner: number;
}

export enum JOB_ACTION {
    ADD = 'ADD',
    REMOVE = 'REMOVE',
}

export class Job {

    @IsOptional()
    public id: number;
    @IsOptional()
    public jobId: number;
    @IsOptional()
    public parentJobId: number;
    @IsOptional()
    public partnerId: number;
    @IsOptional()
    public checkpointId: string;
    @IsOptional()
    public patientId: string;
    @IsOptional()
    public physicianId: number;
    @IsOptional()
    public emrApptStatusCode: string;
    @IsOptional()
    public appointmentStatus: string;
    @IsOptional()
    public appointmentId: number;
    @IsOptional()
    public triggerType: string;
    @IsOptional()
    public triggerPeriod: TRIGGER_PERIOD;
    @IsOptional()
    public partnerPhone: string;
    @IsOptional()
    public patientPhone: string;
    @IsOptional()
    public apiType: string;
    @IsOptional()
    public responseCheckpoint: string;
    @IsOptional()
    public jobStatus: string;
    @IsOptional()
    public messageResponse: string;
    @IsOptional()
    public telnyxId: string;
    @IsOptional()
    public sendgridId: string;
    @IsOptional()
    public telnyxCallerId: string;
    @IsOptional()
    public executionTime: Date;
    @IsOptional()
    public appointmentStartTime: Date;
    @IsOptional()
    public appointmentEndTime: Date;
    @IsOptional()
    public createdAt: Date;
    @IsOptional()
    public updatedAt: Date;
    @IsOptional()
    public reason: string;
}

export class CheckpointRejection {

    @IsBoolean()
    @IsOptional()
    public status: boolean;

    @IsString()
    @IsOptional()
    public reason: string;

    @IsOptional()
    public expectedSetting: string | string[] | number | boolean | number[];

    @IsOptional()
    public receivedSetting: string | string[] | number | boolean | number[];
}

export class ValidateCheckpoint {

    @IsBoolean()
    @IsOptional()
    public status: boolean;

    @IsString()
    @IsOptional()
    public type: string;

    @IsString()
    @IsOptional()
    public reason: string;

    @IsString()
    @IsOptional()
    public checkpointDetails: CheckPointTemplate;
}

export class LimitCheckCheckpoint {
    @IsOptional()
    public patientId: string | number;

    @IsString()
    public jobStatus: string;

    @IsString()
    public executionTime: FindOperator<string>;

    @IsString()
    public checkpointId: FindOperator<string>;
}

export class RemoveRedisJobsRequest {
    @IsString()
    @IsOptional()
    public startTime: string;

    @IsString()
    @IsOptional()
    public endTime: string;

    @IsOptional()
    @IsArray()
    public jobStatus: string[];

    @IsOptional()
    @IsArray()
    public partnerIds: number[];

    @IsOptional()
    @IsArray()
    public jobIds: number[];

    @IsEnum(JOB_ACTION)
    public action: JOB_ACTION;

    @IsOptional()
    @IsString()
    public reason: string;

    @IsOptional()
    @IsArray()
    public triggerPeriod: string[];

    @IsOptional()
    @IsString()
    public updateStatus: string;

    @IsOptional()
    @IsString()
    public appointmentStartTime: string;

    @IsOptional()
    @IsBoolean()
    public appointmentStartTimeIsGreaterThan: boolean;
}
