import { Builder } from 'builder-pattern';
import { Service } from 'typedi';
import { JobScheduleEntity } from '../entities/JobSchedule';

@Service()
export class JobScheduleMapper {

    /** 
    * @param { JobScheduleEntity } jobScheduleEntity
    * @returns { JobScheduleEntity } 
    * @function = JobSchedule entity is mapped;
    */
    public toJobScheduleEntity(jobScheduleEntity: JobScheduleEntity): JobScheduleEntity {
        return Builder(JobScheduleEntity)
            .apiType(jobScheduleEntity.apiType)
            .appointmentId(jobScheduleEntity.appointmentId)
            .createdAt(new Date())
            .emrApptStatusCode(jobScheduleEntity.emrApptStatusCode)
            .jobId(jobScheduleEntity.jobId)
            .partnerId(jobScheduleEntity.partnerId)
            .partnerPhone(jobScheduleEntity.partnerPhone)
            .patientId(jobScheduleEntity.patientId)
            .patientPhone(jobScheduleEntity.patientPhone)
            .triggerPeriod(jobScheduleEntity.triggerPeriod)
            .triggerType(jobScheduleEntity.triggerType)
            .updatedAt(new Date())
            .build();
    }
}
