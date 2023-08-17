
import { HttpError } from 'routing-controllers';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger } from '../../decorators/Logger';
import { LoggerInterface } from '../../lib/logger/LoggerInterface';
import { JobScheduleEntity } from '../entities/JobSchedule';
import { Job, JOB_METHODS, JOB_STATUS } from '../models/JobDetails';
import { JobScheduleRepo } from '../Repository/JobScheduleRepo';
import { CommonService } from './CommonService';
import {sessionContextUtil} from 'thinkitive-util';

@Service()
export class JobScheduleService {

    constructor(@Logger(__filename) private logger: LoggerInterface, @OrmRepository() private jobScheduleRepo: JobScheduleRepo, public commonService: CommonService ) { }
    /** 
    * @param { any } options
    * @returns { Promise<JobScheduleEntity> }
    * @function = job is find ;
    */
    public async find(options: any): Promise<JobScheduleEntity> {
        this.logger.info(`Got request | ${JSON.stringify(options)}`);
        return this.jobScheduleRepo.findOne({
            where: options,
            order: {
                createdAt: -1,
            },
        });

    }

    /** 
    * @param { any } options
    * @returns { Promise<JobScheduleEntity[]> }
    * @function = all job are find ;
    */
    public async findAll(options: any): Promise<JobScheduleEntity[]> {
        this.logger.info(`Got request | ${JSON.stringify(options)}`);
        return this.jobScheduleRepo.find({
            where: {
                ...options,
            },
            order: {
                createdAt: -1,
            },
        });

    }

    /** 
    * @param { JobScheduleEntity } job
    * @returns { Promise<JobScheduleEntity> }
    * @function = job is saved;
    */
    public async save(job: JobScheduleEntity): Promise<JobScheduleEntity> {
        this.logger.info(`Got request job save | ${JSON.stringify(job)} `);
        const requestContext = sessionContextUtil.getContextData();
        job.requestId = requestContext.requestId;
        job.channelId = requestContext.channelId;
        return this.jobScheduleRepo.save(job);
    }

    /** 
    * @param { number } id
    * @param { Job } job
    * @returns { Promise<JobScheduleEntity> }
    * @function = job is updated ;
    */
    public async update(id: number, job: Job): Promise<JobScheduleEntity> {
        this.logger.info(`Got request job update | ${id} | ${JSON.stringify(job)} `);
        const jobEntity = await this.jobScheduleRepo.findOne({
            where: { id },
        });
        if (!jobEntity) {
            throw new HttpError(400, `No Job Found`);
        }
        const jobDetails: JobScheduleEntity = Object.assign(jobEntity, job);
        const requestContext = sessionContextUtil.getContextData();
        jobDetails.requestId = requestContext.requestId;
        jobDetails.channelId = requestContext.channelId;
        return await this.jobScheduleRepo.save(jobDetails);
    }

    /** 
    * @param { number } id
    * @returns { Promise<JobScheduleEntity> }
    * @function = job is deleted ;
    */
    public async delete(id: number): Promise<JobScheduleEntity> {
        this.logger.info(`Got request to delete job | ${JSON.stringify(id)} `);
        try {
            const jobEntity = await this.jobScheduleRepo.findOne({
                where: { id },
            });
            if (!jobEntity) {
                throw new Error(`No Job Found`);
            }
            await this.commonService.getAppointmentSmsServiceInstance(JOB_METHODS.REMOVE_JOB)(jobEntity.jobId);
            jobEntity.jobStatus = JOB_STATUS.JOB_REMOVED;
            return await this.jobScheduleRepo.save(jobEntity);
        } catch (ex) {
            this.logger.error(JSON.stringify(ex));
            throw new HttpError(400, (ex as Error).message);
        }
    }

    /** 
    * @returns { Promise<{[index: string]: number}> }
    * @function = Get the appointment job counts;
    */
    public async getJobsCounts(): Promise<{[index: string]: number}> {
        return await this.commonService.getAppointmentSmsServiceInstance(JOB_METHODS.GET_JOB_COUNTS)();
    }
}
