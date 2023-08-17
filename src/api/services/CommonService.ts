import moment from 'moment-timezone';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Service } from 'typedi';
import { CheckPointTemplate, ReminderType, TimeUnit, TriggerType } from '../models/CheckpointTemplateResponse';
import { PatientDetail } from '../models/PatientDetailsResponses';
import { OscarPhysicianDetail } from '../models/WebAppModels';
import { CheckPointHandlerRequest } from '../models/CheckpointTemplateRequest';
import { CheckpointRejection, JOB_METHODS, JOB_STATUS, LimitCheckCheckpoint, ValidateCheckpoint } from '../models/JobDetails';
import { appointmentSMSService, processAppointmentJob } from './AppointmentSMSService';
import { CheckpointRequestMapper } from '../mapper/CheckpointValidationRequestMapper';
import { AppointmentDetail, AppointmentSearchQueryParams, EMR } from '../models/AppointmentDetails';
import { AppointmentServiceClient } from './AppointmentServiceClient';
import { JobScheduleEntity } from '../entities/JobSchedule';
import { Builder } from 'builder-pattern';
import { CheckpointServiceClient } from './CheckpointServiceClient';
import { AppointmentEvent } from '../models/AppointmentEvent';
import { Between, In } from 'typeorm';
import { env } from '../../env';

@Service()
export class CommonService {
    constructor(
        @Logger(__filename) private logger: LoggerInterface, private checkpointRequestMapper: CheckpointRequestMapper,
        private appointmentServiceClient: AppointmentServiceClient, private checkpointServiceClient: CheckpointServiceClient
    ) { }

    /** 
    * @param { any[] } dataElements
    * @param { PatientDetail } patientDetails
    * @param { any } appointmentDate
    * @param { string } timeZone
    * @param { string } appointmentType
    * @param { OscarPhysicianDetail } physician
    * @returns { any }
    * Functionality = get the values of all the data Elements;
    */
    public getDataElements(dataElements: any[], patientDetails: PatientDetail, appointmentDate: any, timeZone: string, appointmentType: string, physician?: OscarPhysicianDetail): any {
        const messageDataElement = [];
        dataElements.forEach(element => {
            switch (element) {
                case 'first_name':
                    messageDataElement.push({
                        name: element,
                        value: !patientDetails.firstName ? '' : `${patientDetails.firstName}`,
                    });
                    break;
                case 'last_name':
                    messageDataElement.push({
                        name: element,
                        value: !patientDetails.lastName ? '' : `${patientDetails.lastName}`,
                    });
                    break;
                case 'full_name':
                    messageDataElement.push({
                        name: element,
                        value: !patientDetails.firstName && !patientDetails.lastName ? '' : `${patientDetails.firstName} ${patientDetails.lastName}`,
                    });
                    break;
                case 'email_address':
                    messageDataElement.push({
                        name: element,
                        value: !patientDetails.contactDetail.emailId ? '' : `${patientDetails.contactDetail.emailId}`,
                    });
                    break;
                case 'current_date':
                    messageDataElement.push({
                        name: element,
                        value: `${moment.tz(timeZone).format('MMMM Do YYYY')}`,
                    });
                    break;
                case 'appointment_date':
                    messageDataElement.push({
                        name: element,
                        value: !appointmentDate ? '' : moment.tz(appointmentDate, timeZone).format('MMMM Do YYYY'),
                    });
                    break;
                case 'appointment_time':
                    messageDataElement.push({
                        name: element,
                        value: !appointmentDate ? '' : moment.tz(appointmentDate, timeZone).format('hh:mm A'),
                    });
                    break;
                case 'physician_name':
                    messageDataElement.push({
                        name: element,
                        value: !physician.first_name && !physician.last_name ? '' : `Dr. ${physician.first_name} ${physician.last_name}`,
                    });
                    break;
                case 'appointment_type':
                    messageDataElement.push({
                        name: element,
                        value: !appointmentType ? '' : `${appointmentType} `,
                    });
                    break;
                default:
                    messageDataElement.push({
                        name: element,
                        value: '',
                    });
                    break;
            }
        });
        return messageDataElement;
    }
    /** 
    * @param { CheckPointTemplate } checkpoint
    * @returns { Date }
    * Functionality = get the startTime using the checkpointDetails and type 'PRE' , 'POST' and timeUnit;
    */
    public getStartTime(checkpoint: CheckPointTemplate): Date {
        const timeUnit = checkpoint.reminderTimeSetting.timeUnit;
        const timeValue = checkpoint.reminderTimeSetting.timeValue;
        const currentTime = moment().utc();
        let startTime: Date;
        switch (checkpoint.reminderTimeSetting.type) {
            case 'PRE':
                this.logger.info('Got pre checkpoint setting');
                if (timeUnit === 'DAY') {
                    startTime = currentTime.add(timeValue, 'days').utc().toDate();
                } else if (timeUnit === 'HOUR') {
                    startTime = currentTime.add(timeValue, 'hours').utc().toDate();
                } else if (timeUnit === 'MINUTE') {
                    startTime = currentTime.add(timeValue, 'minutes').utc().toDate();
                }
                this.logger.info(`Pre trigger ${JSON.stringify(startTime)}`);
                break;

            case 'POST':
                this.logger.info('Got post checkpoint setting');
                if (timeUnit === 'DAY') {
                    startTime = currentTime.subtract(timeValue, 'days').utc().toDate();
                } else if (timeUnit === 'HOUR') {
                    startTime = currentTime.subtract(timeValue, 'hours').utc().toDate();
                } else if (timeUnit === 'MINUTE') {
                    startTime = currentTime.subtract(timeValue, 'minutes').utc().toDate();
                }
                this.logger.info(`Post trigger ${JSON.stringify(startTime)}`);
                break;
            default:
                startTime = undefined;
                break;

        }
        return startTime;
    }
    /** 
    * @param { CheckPointHandlerRequest } request
    * @returns { Partial<CheckpointRejection> }
    * Functionality = check if the appointmentStatus is cancelled;
    */
    public cancelledAppointment(request: CheckPointHandlerRequest): Partial<CheckpointRejection> {
        if(env.toggle.checkpointCancelledAppointmentToggle.split(',').includes(request.partnerId)) {
            return { status: true };
        }
        switch (request.appointmentStatus) {
            case 'Cancelled':
                return {
                    status: false,
                    reason: 'Appointment is cancelled',
                };
            default:
                return { status: true  };
        }
    }

    /** 
    * @param { CheckPointTemplate } checkPointTemplate
    * @returns { Partial<CheckpointRejection> }
    * Functionality = checks if the smsTemplateSetting and emailTemplateSetting are enabled or not;
    */
    public smsAndEmailAndPhoneTemplateValidation(checkPointTemplate: CheckPointTemplate): Partial<CheckpointRejection> {
        switch (checkPointTemplate.smsTemplateSetting.enabled || checkPointTemplate.emailTemplateSetting.enabled || checkPointTemplate.phoneTemplateSetting.enabled) {
            case true:
                return { status: true };
            default:
                return { status: false, reason: 'Sms and email and Phone template are disabled' };
        }
    }

    public checkpointEnableValidation(checkPointTemplate: CheckPointTemplate): Partial<CheckpointRejection> {
        switch(checkPointTemplate.enable) {
            case true:
                return { status: true };
            default:
                return { status: false, reason: 'Checkpoint is disabled' };
        }
    }

    /** 
    * @param { CheckPointHandlerRequest } request
    * @param { CheckPointTemplate } checkPointTemplate
    * @returns { Partial<CheckpointRejection> }
    * Functionality = checks for registerationValidation
    */
    public registerationValidation(request: CheckPointHandlerRequest, checkPointTemplate: CheckPointTemplate): Partial<CheckpointRejection> {
        switch (true) {
            case (typeof request.registration !== 'boolean'):
            case (typeof checkPointTemplate.registration !== 'boolean'):
            case (request.registration === checkPointTemplate.registration):
                return { status: true };
            default:
                return {
                    status: false,
                    reason: 'Invalid registration configuration issue',
                    expectedSetting: checkPointTemplate.registration,
                    receivedSetting: request.registration,
                };
        }
    }

    /** 
    * @param { CheckPointHandlerRequest } request
    * @param { CheckPointTemplate } checkPointTemplate
    * @returns { Partial<CheckpointRejection> }
    * Functionality = checks for checkPointTemplate location and the received request location are same or not;
    */
    public locationValidation(request: CheckPointHandlerRequest, checkPointTemplate: CheckPointTemplate): Partial<CheckpointRejection> {
        switch (true) {
            case (!checkPointTemplate.locations):
            case (!checkPointTemplate.locations.length):
                return { status: true };
            case (checkPointTemplate.locations.indexOf(Number(request.locationId)) !== -1):
                if (
                    checkPointTemplate.inclusionSetting &&
                    typeof checkPointTemplate.inclusionSetting.locations === 'boolean'
                    ) {
                        if ( checkPointTemplate.inclusionSetting.locations) {
                            return { status: true };
                        } else {
                            return { status: false, reason: 'Location validation turned off in inclusion criteria' };
                        }
                    } else {
                        return { status: true };
                    }
            case (checkPointTemplate.locations.indexOf(Number(request.locationId)) === -1):
                if (
                        checkPointTemplate.inclusionSetting &&
                        typeof checkPointTemplate.inclusionSetting.locations === 'boolean'
                    ) {
                        if ( !checkPointTemplate.inclusionSetting.locations ) {
                            return { status: true };
                        } else {
                            return {
                                status: false,
                                reason: 'Invalid location configuration issue',
                                expectedSetting: checkPointTemplate.locations,
                                receivedSetting: request.locationId,
                            };
                        }
                    } else {
                        return { status: false, reason: 'Invalid location validation setting in checkpoint template' };
                    }
            default:
                return { status: false };
        }
    }

    /** 
    * @param { CheckPointHandlerRequest } request
    * @param { CheckPointTemplate } checkPointTemplate
    * @returns { Partial<CheckpointRejection> }
    * Functionality = checks for checkPointTemplate statusCode and the received request statusCode are same or not;
    */
    public statusCodeValidation(request: CheckPointHandlerRequest, checkPointTemplate: CheckPointTemplate): Partial<CheckpointRejection> {
            switch (true) {
                case !checkPointTemplate.validStatusCodes:
                case !checkPointTemplate.validStatusCodes.length:
                    return { status: true };
                case (checkPointTemplate.validStatusCodes.indexOf(request.status) !== -1):
                    if (
                        checkPointTemplate.inclusionSetting &&
                        typeof checkPointTemplate.inclusionSetting.validStatusCodes === 'boolean'
                    ) {
                        if ( checkPointTemplate.inclusionSetting.validStatusCodes ) {
                            return { status: true };
                        } else {
                            return { status: false, reason: 'Status code validation turned off in inclusion criteria' };
                        }
                    } else {
                        return { status: true };
                    }
                case (checkPointTemplate.validStatusCodes.indexOf(request.status) === -1):
                    if (
                        checkPointTemplate.inclusionSetting &&
                        typeof checkPointTemplate.inclusionSetting.validStatusCodes === 'boolean'
                    ) {
                        if (!checkPointTemplate.inclusionSetting.validStatusCodes) {
                            return { status: true };
                        } else {
                            return {
                                status: false,
                                reason: 'Invalid status configuration issue',
                                expectedSetting: checkPointTemplate.validStatusCodes,
                                receivedSetting: request.status,
                            };
                        }
                    } else {
                        return { status: false, reason: 'Invalid Status validation setting in checkpoint template' };
                    }
                default:
                    return { status: false };
            }
    }

    /** 
    * @param { CheckPointHandlerRequest } request
    * @param { CheckPointTemplate } checkPointTemplate
    * @returns { Partial<CheckpointRejection> }
    * Functionality = checks for checkPointTemplate physicians and the received request physicians are same or not;
    */
    public physiciansValidation(request: CheckPointHandlerRequest, checkPointTemplate: CheckPointTemplate): Partial<CheckpointRejection> {
        switch (true) {
            case !checkPointTemplate.physicians:
            case !checkPointTemplate.physicians.length:
                return { status: true };
            case (checkPointTemplate.physicians.indexOf(Number(request.physicianId)) !== -1):
                if (
                    checkPointTemplate.inclusionSetting &&
                    typeof checkPointTemplate.inclusionSetting.physicians === 'boolean'
                    ) {
                        if ( checkPointTemplate.inclusionSetting.physicians ) {
                            return { status: true };
                        } else {
                            return { status: false, reason: 'Physicians validation turned off in inclusion criteria' };
                        }
                } else {
                    return { status: true };
                }
            case (checkPointTemplate.physicians.indexOf(Number(request.physicianId)) === -1):
                if (
                    checkPointTemplate.inclusionSetting &&
                    typeof checkPointTemplate.inclusionSetting.physicians === 'boolean'
                    ) {
                        if ( !checkPointTemplate.inclusionSetting.physicians ) {
                            return { status: true };
                        } else {
                            return {
                                status: false,
                                reason: 'Invalid physicians configuration issue',
                                expectedSetting: checkPointTemplate.physicians,
                                receivedSetting: request.physicianId,
                            };
                        }
                } else {
                    return { status: false, reason: 'Invalid physicians validation setting in checkpoint template' };
                }
            default:
                return { status: false };
        }
    }

    public appointmentNotesvalidation(request: CheckPointHandlerRequest, checkPointTemplate: CheckPointTemplate): Partial<CheckpointRejection> {
        this.logger.info(`Validating CheckPointHandlerRequest notes: ${request.appointmentNotes}`);
        switch (true) {
            case request.emr !== EMR.ACCURO:
                return { status: true };
            case !checkPointTemplate.appointmentNotes:
                return { status: true };
            case !request.appointmentNotes:
                return { status: false,
                         reason: `Invalid Appointment Notes configuration issue`,
                         expectedSetting: checkPointTemplate.appointmentNotes,
                         receivedSetting: request.appointmentNotes,
                }
            case (checkPointTemplate.appointmentNotes.split(',').indexOf(request.appointmentNotes.split(/\n|\r\n/g).shift()) !== -1):
                if (
                    checkPointTemplate.inclusionSetting &&
                    typeof checkPointTemplate.inclusionSetting.appointmentNotes === 'boolean'
                ) {
                    if ( checkPointTemplate.inclusionSetting.appointmentNotes ) {
                        return { status: true };
                    } else {
                        return { 
                            status: false, 
                            reason: `appointmentNotesNotIn Criteria failed for ${request.appointmentNotes}`
                        };
                    }
                } else {
                    return { status: true };
                }
            case (checkPointTemplate.appointmentNotes.split(',').indexOf(request.appointmentNotes.split(/\n|\r\n/g).shift()) === -1):
                if ( checkPointTemplate.inclusionSetting &&
                    typeof checkPointTemplate.inclusionSetting.appointmentNotes === 'boolean'
                ) {
                    if (!checkPointTemplate.inclusionSetting.appointmentNotes) {
                        return { status: true };
                    } else {
                        return {
                            status: false,
                            reason: 'Invalid Appointment Notes configuration issue',
                            expectedSetting: checkPointTemplate.appointmentNotes,
                            receivedSetting: request.appointmentNotes,
                        };
                    }
                } else {
                    return { status: false, reason: 'Invalid appointmentNotes validation setting in checkpoint template' };
                }
            default:
                return { status: false };

        }
    }

    public appointmentTypeValidation(request: CheckPointHandlerRequest, checkPointTemplate: CheckPointTemplate): Partial<CheckpointRejection> {
        switch (true) {
            case !checkPointTemplate.appointmentType:
            case !checkPointTemplate.appointmentType.length:
                return { status: true };
            case (checkPointTemplate.appointmentType.toLocaleString().toLowerCase().split(',')
            .indexOf(request.appointmentType !== null ? request.appointmentType.toLowerCase() : undefined) !== -1):
                if (
                    checkPointTemplate.inclusionSetting &&
                    typeof checkPointTemplate.inclusionSetting.appointmentType === 'boolean'
                ) {
                    if ( checkPointTemplate.inclusionSetting.appointmentType ) {
                        return { status: true };
                    } else {
                        return { status: false, reason: 'Appointment type validation turned off in inclusion criteria' };
                    }
                } else {
                    return { status: true };
                }
            case (checkPointTemplate.appointmentType.toLocaleString().toLowerCase().split(',')
            .indexOf(request.appointmentType !== null ? request.appointmentType.toLowerCase() : undefined) === -1):
                if ( checkPointTemplate.inclusionSetting &&
                    typeof checkPointTemplate.inclusionSetting.appointmentType === 'boolean'
                ) {
                    if (!checkPointTemplate.inclusionSetting.appointmentType) {
                        return { status: true };
                    } else {
                        return {
                            status: false,
                            reason: 'Invalid Appointment type configuration issue',
                            expectedSetting: checkPointTemplate.appointmentType,
                            receivedSetting: request.appointmentType,
                        };
                    }
                } else {
                    return { status: false, reason: 'Invalid appointmenttype validation setting in checkpoint template' };
                }
            default:
                return { status: false };
        }
    }

    /** 
    * @param { CheckPointHandlerRequest } request
    * @param { CheckPointTemplate } checkPointTemplate
    * @returns { Partial<CheckpointRejection> }
    * @function = checks only if the type is BOOK ;
    */
    public timeDifferenceValidation(request: CheckPointHandlerRequest, checkPointTemplate: CheckPointTemplate): Partial<CheckpointRejection> {
        if (checkPointTemplate.triggerType === TriggerType.TIME_BASED) {
            const type: ReminderType = checkPointTemplate.reminderTimeSetting.type;
            const timeUnit = checkPointTemplate.reminderTimeSetting.timeUnit;
            const timeValue = checkPointTemplate.reminderTimeSetting.timeValue;
            this.logger.info(`${ checkPointTemplate.uuid } | Got book checkpoint setting | ${checkPointTemplate.reminderTimeSetting.timeDifference}`);
            const timeDifference = checkPointTemplate.reminderTimeSetting.timeDifference;
            if (type === ReminderType.BOOK && timeDifference) {
                let bookTimeToTrigger: number;
                if (timeUnit === TimeUnit.DAY) {
                    bookTimeToTrigger = moment.duration(timeValue, 'days').asMilliseconds();
                } else if (timeUnit === TimeUnit.HOUR) {
                    bookTimeToTrigger = moment.duration(timeValue, 'hours').asMilliseconds();
                } else if (timeUnit === TimeUnit.MINUTE) {
                    bookTimeToTrigger = moment.duration(timeValue, 'minutes').asMilliseconds();
                }
                this.logger.info(`${ checkPointTemplate.uuid } | Appointment time and currentTime |
                                    ${moment(request.appointmentStartTime)} ${moment(request.currentTime)}`);
                const difference = moment(request.appointmentStartTime).diff(moment(request.currentTime));
                this.logger.info(`${ checkPointTemplate.uuid } | Book time difference between | ${bookTimeToTrigger} | ${difference}`);
                if (!(difference >= bookTimeToTrigger && timeDifference === 'M') && !(difference <= bookTimeToTrigger && timeDifference === 'L')) {
                    return {  status: false, reason: 'Validation failed for reminder time trigger'};
                }
            }
        }
        return { status: true };
    }

    public apiBasedTriggerTypeValidation(request: CheckPointHandlerRequest, checkPointTemplate: CheckPointTemplate): Partial<CheckpointRejection> {
        if (checkPointTemplate.triggerType === TriggerType.API_BASED) {
            const apiType = checkPointTemplate.apiType;
            const apiBasedSettings = checkPointTemplate.triggerTypeSetting &&
                                    checkPointTemplate.triggerTypeSetting.apiBased &&
                                    checkPointTemplate.triggerTypeSetting.apiBased.apiType;

            if (
                ((apiType && apiBasedSettings) && request.apiType !== apiType) ||
                ((!apiType && apiBasedSettings) && request.apiType !== apiBasedSettings ) ||
                ( apiType && !apiBasedSettings && request.apiType !== apiType )
            ) {
                return { status: false, reason: 'Failed to validate the api based check' };
            }
        }
        return { status: true };
    }

    /** 
    * @param { JobScheduleEntity[] } jobs
    * @param { CheckPointTemplate } checkPointTemplate
    * @returns { Partial<CheckpointRejection> }
    * @Function = if the combination limit is ON then more than one SMS will not be triggered;
    */
    public checkpointLimitValidation(jobs: JobScheduleEntity[], checkPointTemplate: CheckPointTemplate): Partial<CheckpointRejection> {
        switch (true) {
            case ( !jobs.length ):
                return { status : true };
            case ( checkPointTemplate.limit ):
                if ( jobs.length < 1 ) {
                    return { status: true};
                } else {
                    return {
                        status: false,
                        reason: 'limit for sending checkpoint to patient for the day is reached',
                    };
                }
            case ( checkPointTemplate.combinationLimitSetting && Boolean(checkPointTemplate.combinationLimitSetting.combinationGroupId) ):
                if ( jobs.length < checkPointTemplate.combinationLimitSetting.combinationLimit ) {
                    return { status : true};
                } else {
                    return {
                        status: false,
                        reason: 'limit for sending checkpoint to patient for the day is reached',
                    };
                }
            default:
                return { status: true};
        }
    }
    /** 
    * @param { CheckPointHandlerRequest } request
    * @param { CheckPointTemplate } checkPointTemplate
    * @param { JobScheduleEntity[] } jobs
    * @returns { Promise<Array<Partial<CheckpointRejection>>> }
    * @Function = validate checkpointTemplate;
    */
    public async validateCheckpoint(request: CheckPointHandlerRequest, checkPointTemplate: CheckPointTemplate, jobs: JobScheduleEntity[]): Promise<Array<Partial<CheckpointRejection>>> {

        const result: Array<Partial<CheckpointRejection>> = [];
        if (!request.status || request.status === '') {
            request.status = 'BLANK';
        }
        result.push(this.checkpointEnableValidation(checkPointTemplate));
        result.push(this.smsAndEmailAndPhoneTemplateValidation(checkPointTemplate));
        result.push(this.statusCodeValidation(request, checkPointTemplate));
        result.push(this.physiciansValidation(request, checkPointTemplate));
        result.push(this.appointmentTypeValidation(request, checkPointTemplate));
        result.push(this.locationValidation(request, checkPointTemplate));
        result.push(this.appointmentNotesvalidation(request, checkPointTemplate));
        result.push(this.cancelledAppointment(request));
        result.push(this.registerationValidation(request, checkPointTemplate));
        result.push(this.timeDifferenceValidation(request, checkPointTemplate));
        result.push(this.apiBasedTriggerTypeValidation(request, checkPointTemplate));
        result.push(this.checkpointLimitValidation(jobs, checkPointTemplate));

        this.logger.info(`${ request.appointmentId } | ${checkPointTemplate.uuid} | Condition result: ${JSON.stringify(result)}`);
        return result;
    }

    /** 
    * @param { string } requestType
    * @returns { any }
    * @Function = job methods are called as per case;
    */
    public getAppointmentSmsServiceInstance(requestType: string): any {
        switch (requestType) {
            case JOB_METHODS.ADD_JOB:
                return ( data: any, delayTime: number, KAFKA_SUBSCRIBE: any ) => {
                    this.logger.info('Request for adding job');
                    return appointmentSMSService.addJob(data, delayTime, KAFKA_SUBSCRIBE);
                };
            case JOB_METHODS.GET_STATUS:
                return () => {
                    this.logger.info('Request to get job status');
                    return appointmentSMSService.getStatus();
                };
            case JOB_METHODS.REMOVE_JOB:
                return ( jobId: number | string ) => {
                    this.logger.info('Request to remove job');
                    return appointmentSMSService.removeJob(jobId);
                };
            case JOB_METHODS.PROCESS_APPOINTMENT:
                return ( job: any ): Promise<void>  => {
                    this.logger.info('Request to process job');
                    return processAppointmentJob(job);
                };
            case JOB_METHODS.GET_JOB_COUNTS:
                return (): Promise<{[index: string]: number}>  => {
                    this.logger.info('Request to get job count');
                    return appointmentSMSService.getJobCount();
                };
            default:
                this.logger.info('Default get appointment sms service instance');
                break;
        }
    }

    /** 
    * @param { CheckPointTemplate } checkPointTemplate
    * @param { AppointmentEvent } appointmentDetail
    * @param { JobScheduleEntity } jobDetails
    * @returns { Promise<Partial<LimitCheckCheckpoint>> }
    * @Function = limit query is returned to find all jobs ;
    */
    public async getLimitCheckQuery(checkPointTemplate: CheckPointTemplate, appointmentDetail?: AppointmentEvent, jobDetails?: JobScheduleEntity ): Promise<Partial<LimitCheckCheckpoint>> {
        const request = {
            appointmentId: appointmentDetail ? appointmentDetail.id : jobDetails.appointmentId,
            patientId: appointmentDetail && appointmentDetail.patientDetail ? appointmentDetail.patientDetail.patientId : jobDetails.patientId,
            partnerId: appointmentDetail ? appointmentDetail.partnerId : jobDetails.partnerId,
        };

        const checkpointId = checkPointTemplate.uuid;
        const patientId = request.patientId;
        const query: Partial<LimitCheckCheckpoint> = {
            patientId,
            jobStatus: JOB_STATUS.NOTIFICATION_DONE,
            executionTime: Between(moment().startOf('day').toISOString(), moment().endOf('day').toISOString()),
        };

        if (!query.patientId) {
            return undefined;
        }

        if (checkPointTemplate.limit) {
            query.checkpointId = In([ checkpointId ]);
            return query;
        }

        if (checkPointTemplate.combinationLimitSetting && checkPointTemplate.combinationLimitSetting.combinationGroupId) {
            const checkpointIds = await this.checkpointServiceClient.getCombinedCheckpoints(request.partnerId, checkPointTemplate.combinationLimitSetting.combinationGroupId);
            this.logger.info(`${ request.appointmentId } | ${ checkPointTemplate.uuid } | Group checkpoints ${JSON.stringify(checkpointIds)}`);
            query.checkpointId = In(checkpointIds);
            return query;
        }
        return undefined;
    }

    /** 
    * @param { JobScheduleEntity } job
    * @param { CheckPointTemplate } checkpointDetails
    * @param { string } triggerType
    * @param { JobScheduleEntity[] } jobs
    * @returns { Promise<Partial<ValidateCheckpoint>> }
    * @Function =  to check if the updated appointment event is resync, also check if the type is PRE the appointmentStartTime should not be less than current time ;
    */
    public async failSafeCheck(job: JobScheduleEntity, checkpointDetails: CheckPointTemplate, triggerType: string, jobs: JobScheduleEntity[]): Promise<Partial<ValidateCheckpoint>> {
        try {
            this.logger.info(`${ job.appointmentId } | Request for fail safe check`);
            const query = Builder(AppointmentSearchQueryParams)
                        .appointmentId(String(job.appointmentId))
                        .checkInEMR(true)
                        .build();

            const appointmentDetails: AppointmentDetail = await this.appointmentServiceClient.getUpdatedAppointment(query, job.partnerId);
            this.logger.info(`${ job.appointmentId } | updated appointment event | ${ JSON.stringify(appointmentDetails) }`);
            if (appointmentDetails.resync) {
                return {
                    status: false,
                    type: 'RESYNC',
                    reason: `Appointment updated in EMR detected while scheduling ${triggerType} job`,
                };
            }

            this.logger.info(`${ job.appointmentId } | trigger type for Fail safe check | ${ triggerType }`);
            if (triggerType === 'BOOK') {
                if (env.toggle.bookToggle) {
                    return {
                        status: false,
                        reason: 'Checkpoint rejected because TOB partner toggle is ON',
                    };
                 } else {
                    return {
                        status: true,
                        type: '',
                        reason: 'Appointment is ready to process',
                        checkpointDetails,
                    };
                }
            }

            if (triggerType === 'PRE' && ( moment(appointmentDetails.startTime).utc() < moment().utc() )) {
                return {
                    status: false,
                    type: '',
                    reason: 'Appointment start time is already passed',
                };
            }

            const appointmentRequest = this.checkpointRequestMapper.appointmentDetailsMapper(appointmentDetails);
            appointmentRequest.partnerId = String(job.partnerId);
            this.logger.info(`${ job.appointmentId } | fail safe check validate checkpoint request | ${ JSON.stringify(appointmentRequest)} |
            ${ JSON.stringify(checkpointDetails) }`);

            const result = await this.validateCheckpoint(appointmentRequest, checkpointDetails, jobs);
            const reasons = result.filter(obj => !obj.status);
            this.logger.info(`${ job.appointmentId } | fail safe check validate checkpoint | ${ JSON.stringify(reasons)}`);
            if (reasons.length) {
                let message = '';
                reasons.map(item => {
                    message += `${item.reason}`;
                    if (item.expectedSetting) {
                        message += `\nExpected settings: ${JSON.stringify(item.expectedSetting)}`;
                    }
                    if (item.receivedSetting) {
                        message += `\nReceived Settings: ${JSON.stringify(item.receivedSetting)}\n\n`;
                    }
                });
                return { status: false, type: 'VALIDATION_FAILED', reason: message };
            }

            return { status: true, checkpointDetails };
        } catch (error) {
            this.logger.info(`${ job.appointmentId } | Error while Fail safe check | ${ (error as Error).message }`);
            throw error;
        }
    }

}
