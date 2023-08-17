import { EntityRepository, Repository } from 'typeorm';
import { ReportTrackEntity } from '../entities/ReportTrackEntity';

@EntityRepository(ReportTrackEntity)
export class ReportTrackRepo extends Repository<ReportTrackEntity >  {

}
