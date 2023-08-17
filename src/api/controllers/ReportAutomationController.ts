import { Response } from 'express';
import { Body, JsonController, Post, Get, Res, HeaderParam, UploadedFile, BodyParam, UseBefore, QueryParams } from 'routing-controllers';
import { StatusCodes } from 'http-status-codes';
import { ReportService } from '../services/ReportService';
import { StatusRequest } from './requests/Report';
import { AuthenticationMiddleware } from 'security-util';

@JsonController('/report')
@UseBefore(AuthenticationMiddleware)
export class ReportAutomationController {

    constructor(private reportService: ReportService) { }
    @Post('/delivery')
    public async createReport(  @HeaderParam('x-partner-id', { required: true }) partnerId: string,
                                @Res() response: Response,
                                @Body() request: any,
                                @BodyParam('patientId', { required: true }) patientId: string,
                                @BodyParam('patientPhone', { required: true }) patientPhone: string,
                                @BodyParam('patientFirstName', { required: true }) patientFirstName: string,
                                @BodyParam('patientLastName', { required: true }) patientLastName: string,
                                @UploadedFile('report', { required: true }) report: any): Promise<any> {
        const reportParam = {
            patientId,
            patientPhone,
            patientFirstName,
            patientLastName,
        };
        const result = await this.reportService.reportProcess(partnerId, reportParam, report);
        return response.status(StatusCodes.ACCEPTED).json(result);
    }

    @Get('/delivery/status')
    public async getStatus( @HeaderParam('x-partner-id', { required: true }) partnerId: string,
                            @Res() response: Response,
                            @QueryParams() statusRequest: StatusRequest): Promise<Response> {
        const result = await this.reportService.getReportStatus(partnerId, statusRequest);
        return response.status(StatusCodes.ACCEPTED).json(result);
    }
}
