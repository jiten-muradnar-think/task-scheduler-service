// import { IsEnum } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';
import {ReportStatus} from '../models/Report';

@Entity({ name: 'REPORT' })
export class ReportEntity {

    @PrimaryGeneratedColumn({ name: 'ID' })
    public id: number;

    @Index()
    @Column({ name: 'PATIENT_ID', nullable: true })
    public patientId: string;

    @Index()
    @Column({ name: 'PATIENT_CELL_NUMBER', nullable: true })
    public patientCellNumber: string;

    @Column({ name: 'PATIENT_FIRST_NAME', nullable: true})
    public patientFirstName: string;

    @Column({ name: 'PATIENT_LAST_NAME', nullable: true })
    public patientLastName: string;

    @Column({ name: 'REPORT_NAME', nullable: true })
    public reportName: string;

    @Index()
    @Column({ name: 'REQUEST_ID', nullable: true })
    public requestId: string;

    @Index()
    @Column({ name: 'thinkitive_PATIENT_ID', nullable: true })
    public thinkitivePatientId: number;

    @Index()
    @Column({ name: 'STATUS', nullable: false, default: ReportStatus.REPORT_SENT.toString()})
    public status: string;

    @CreateDateColumn({ name: 'CREATED_AT', nullable: true })
    public createdAt: Date;

    @UpdateDateColumn({ name: 'UPDATED_AT', nullable: true })
    public updatedAt: Date;

}
