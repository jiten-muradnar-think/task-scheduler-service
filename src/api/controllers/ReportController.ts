import { Response } from 'express';
import { Body, JsonController, Post, Res} from 'routing-controllers';
import { StatusCodes } from 'http-status-codes';
import {processReportCheckpoint, ReportService} from '../services/ReportService';
import { CallBackRequest } from './requests/Report';
import {ReportDeliveryRequest} from '../models/ReportAutomationModels';

@JsonController('/report')
export class ReportController {

    constructor(private reportService: ReportService) { }

    @Post('/status/callback')
    public async callbackStatus(@Res() response: Response,
                                @Body() request: CallBackRequest): Promise<any> {
        await this.reportService.reportCallback(request);
        return response.status(StatusCodes.ACCEPTED).send();
    }

    @Post('/delivery/test')
    public async sendData(@Body() request: ReportDeliveryRequest, @Res() response: Response): Promise<any> {
        processReportCheckpoint(JSON.stringify(request));
        return response.status(StatusCodes.ACCEPTED).send();
    }

}
