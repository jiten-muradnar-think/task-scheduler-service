import { EntityRepository, Repository } from 'typeorm';
import { ReportEntity } from '../entities/ReportEntity';

@EntityRepository(ReportEntity)
export class ReportRepo extends Repository<ReportEntity >  {

}
