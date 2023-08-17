import { Response } from 'express';
import { Body, Delete, Get, HeaderParam, HttpCode, JsonController, Param, Post, Put, QueryParams, Res } from 'routing-controllers';
import { JobScheduleEntity } from '../entities/JobSchedule';
import { Job, RemoveRedisJobsRequest } from '../models/JobDetails';
import { JobScheduleService } from '../services/JobScheduleService';
import { RescheduleJobService } from '../services/RescheduleJobService';
import { smsEventListener } from '../services/SMSQueueManagementService';
import {AppointmentEvent} from '../models/AppointmentEvent';
import {sessionContextUtil} from 'thinkitive-util';

@JsonController()
export class JobSchedulerController {

    constructor(private jobScheduleService: JobScheduleService, private rescheduleJobService: RescheduleJobService) { }

    /** 
    * @param { any } jobDetail
    * @returns { Promise<any> } 
    * @function = to send sms Event to job scheduler;
    */
    @Post('/smsevent')
    public async smsevent(@Res() response: Response, @Body() jobDetail: AppointmentEvent): Promise<any> {
        jobDetail.context = sessionContextUtil.getContextData();
        await smsEventListener(JSON.stringify(jobDetail));
        return response.status(204).send();
    }

    /** 
    * @param { Job } jobDetail
    * @returns { Promise<any> } 
    * @function = to update job details using job id;
    */
    @Put('/:id')
    public async updateJobDetails(@Res() response: Response, @Body() jobDetail: Job, @Param('id') id: number): Promise<any> {
        return response.status(200)
            .json(await this.jobScheduleService.update(id, jobDetail));
    }

    /** 
    * @param { never } id
    * @returns { Promise<JobScheduleEntity> } 
    * @function = to delete job using job id;
    */
    @Delete('/:id')
    @HttpCode(200)
    public async deleteJob(@Param('id') id: number): Promise<JobScheduleEntity> {
        return this.jobScheduleService.delete(id);
    }

    /** 
    * @param { number } partnerId
    * @param { Job } jobDetail
    * @returns { Promise<JobScheduleEntity[]> } 
    * @function = to fetch all jobs using partnerId and job details;
    */
    @Get('/jobs')
    @HttpCode(200)
    public async scheduleCheckpoints(@HeaderParam('x-partner-id') partnerId: number, @QueryParams() jobDetail: Job): Promise<JobScheduleEntity[]> {
        jobDetail.partnerId = partnerId;
        return this.jobScheduleService.findAll(jobDetail);
    }

    /** 
    * @param { number } partnerId
    * @param { string } checkpointId
    * @returns { Promise<Array<number | void>> } 
    * @function = when the checkpoint is updated the jobs associated to that checkpoint are removed and are rescheduled ;
    */
    @Get('/schedule/:checkpointId')
    @HttpCode(200)
    public async scheduleCheckpointJobs(@HeaderParam('x-partner-id') partnerId: number, @Param('checkpointId') checkpointId: string): Promise<Array<number | void>> {
        return this.rescheduleJobService.processCheckPointEvent(checkpointId, partnerId);
    }

    /** 
    * @param { number } partnerId
    * @param { string } checkpointId
    * @returns { Promise<Array<number | void>> } 
    * @function = when the checkpoint is updated the jobs associated to that checkpoint are removed
    */
    @Delete('/schedule/:checkpointId')
    @HttpCode(200)
    public async removeScheduleCheckpointJobs(@HeaderParam('x-partner-id') partnerId: number, @Param('checkpointId') checkpointId: string): Promise<Array<number | void>> {
        return this.rescheduleJobService.processDeleteCheckPointEvent(checkpointId, partnerId);
    }

    /** 
    * @returns { Promise<{[index: string]: number}> } 
    * @function = Get the appointment job counts
    */
    @Get('/jobs/count')
    @HttpCode(200)
    public async getJobsCount(): Promise<{[index: string]: number}> {
        return await this.jobScheduleService.getJobsCounts();
    }

    /** 
    * @returns { Promise<Response> } 
    * @function = to process Initialized jobs | type = 'RESCHEDULE_NORMAL'
    */
    @Get('/schedule-jobs')
    public async scheduleInitializedJobs(@Res() response: Response): Promise<Response> {
        this.rescheduleJobService.scheduleInitializedCheckpoints();
        return response.status(200).send();
    }

    /** 
    * @returns { Promise<Response> } 
    * @function = to rescheduled STUCKED_JOBS and check redis health
    */
    @Get('/schedule-health-check')
    public async scheduleHealthCheck(@Res() response: Response): Promise<Response> {
        this.rescheduleJobService.redisHealthCheck();
        return response.status(200).send();
    }

    // add or remove job manually from redis
    @Post('/jobs/update')
    public async updateJobsManually(@Res() response: Response, @Body() jobDetail: RemoveRedisJobsRequest): Promise<Response> {
        return response.status(200).send(await this.rescheduleJobService.updateJobManually(jobDetail));
    }

}
