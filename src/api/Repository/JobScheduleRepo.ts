import { EntityRepository, Repository } from 'typeorm';
import { JobScheduleEntity } from '../entities/JobSchedule';

@EntityRepository(JobScheduleEntity)
export class JobScheduleRepo extends Repository<JobScheduleEntity>  {

}
