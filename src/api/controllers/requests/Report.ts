import { IsString, IsEnum } from 'class-validator';
import {ReportStatus} from '../../models/Report';

export class ReportRequest {
    @IsString()
    public patientId: string;
    @IsString()
    public patientPhone: string;
    @IsString()
    public patientFirstName: string;
    @IsString()
    public patientLastName: string;
}

export class ReportResponse {
    public patientId: string;
    public trackingId: string;
}

export class CallBackRequest {
    @IsString()
    public trackingId: string;
    @IsString()
    public patientId: string;
    @IsEnum(ReportStatus)
    public status: ReportStatus;
}

export class StatusRequest {
    @IsString()
    public patientId: string;
    @IsString()
    public trackingId: string;
}

export class StatusReponse {
    @IsString()
    public trackingId: string;
    @IsString()
    public patientId: string;
    @IsString()
    public statusUpdatedAt: string;
    @IsString()
    public status: string;
}
