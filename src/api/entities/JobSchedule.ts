import { IsEnum } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum TRIGGER_PERIOD {
    PRE = 'PRE',
    POST = 'POST',
    BOOK = 'BOOK',
    RESPONSE = 'RESPONSE',
}

@Entity({ name: 'JOB_SCHEDULE' })
export class JobScheduleEntity {

    @PrimaryGeneratedColumn({ name: 'ID' })
    public id: number;

    @Column({ name: 'job_id', nullable: true })
    public jobId: number;

    @Column({ name: 'parent_job_id', nullable: true })
    public parentJobId: number;

    @Column({ name: 'partner_id' })
    public partnerId: number;

    @Column({ name: 'checkpoint_id', nullable: true })
    public checkpointId: string;

    @Column({ name: 'patient_id', nullable: true })
    public patientId: string;

    @Column({ name: 'physician_id', nullable: true })
    public physicianId: number;

    @Column({ name: 'emr_code', nullable: true })
    public emrApptStatusCode: string;

    @Column({ name: 'appointment_status', nullable: true})
    public appointmentStatus: string;

    @Column({ name: 'appointment_id', nullable: true })
    public appointmentId: number;

    @Column({ name: 'trigger_type' })
    public triggerType: string;

    @IsEnum(TRIGGER_PERIOD)
    @Column({ name: 'trigger_period', nullable: true })
    public triggerPeriod: TRIGGER_PERIOD;

    @Column({ name: 'partner_phone', nullable: true })
    public partnerPhone: string;

    @Column({ name: 'patient_phone', nullable: true })
    public patientPhone: string;

    @Column({ name: 'api_type', nullable: true })
    public apiType: string;

    @Column({ name: 'response_checkpoint', nullable: true }) // to save the response checkpoint assigned from ui
    public responseCheckpoint: string;

    @Column({ name: 'job_status', nullable: true }) // this contains the exection service name with status
    public jobStatus: string;

    @Column({ name: 'message_response', nullable: true }) // this contains the message reponse id which is replied by patient nad witth be updated from inbound
    public messageResponse: string;

    @Column({ name: 'telnyx_id', nullable: true })
    public telnyxId: string;

    @Column({ name: 'sendgrid_id', nullable: true })
    public sendgridId: string;

    @Column({ name: 'telnyx_caller_id', nullable: true })
    public telnyxCallerId: string;

    @Column({ name: 'execution_time', nullable: true })
    public executionTime: Date;

    @Column({ name: 'appointment_start_time', nullable: true })
    public appointmentStartTime: Date;

    @Column({ name: 'appointment_end_time', nullable: true })
    public appointmentEndTime: Date;

    @CreateDateColumn({ name: 'CREATED_AT', nullable: true })
    public createdAt: Date;

    @UpdateDateColumn({ name: 'UPDATED_AT', nullable: true })
    public updatedAt: Date;

    @Column({ name: 'reason', nullable: true })
    public reason: string;

    @Column({ name: 'appointment_type', nullable: true})
    public appointmentType: string;

    @Column({ name: 'appointment_location_id', nullable: true })
    public appointmentLocationId: number;

    @Column({name: 'REQUEST_ID', nullable: true})
    public requestId: string;

    @Column({name: 'CHANNEL_ID', nullable: true})
    public channelId: string;

}
