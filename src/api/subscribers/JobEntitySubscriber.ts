import { JobScheduleEntity } from '../entities/JobSchedule';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { auditLogger, Logger, sessionManager } from 'thinkitive-util';

@EventSubscriber()
export class JobEntitySubscriber implements EntitySubscriberInterface<JobScheduleEntity>  {
    private logger = new Logger(__filename);

    // This event subscriber is for JobScheduleEntity, passing it while adding old-data.
    private entityName = 'JobScheduleEntity';

    /**
     * Indicates that this subscriber only listen to Post events.
     */
    // tslint:disable-next-line:typedef
    public listenTo() {
        return JobScheduleEntity;
    }

    // tslint:disable-next-line:typedef
    public beforeInsert(event: any): Promise<any> | void {
        auditLogger.logEntityOldData(event.databaseEntity, this.entityName);
        this.logger.info(`Entity before insert - ${sessionManager.getNamespace('session').get('oldData')}`);
    }

    // tslint:disable-next-line:typedef
    public beforeUpdate(event: any): Promise<any> | void {
        auditLogger.logEntityOldData(event.databaseEntity, this.entityName);
        this.logger.info(`Entity before update - ${sessionManager.getNamespace('session').get('oldData')}`);
    }

    // tslint:disable-next-line:typedef
    public afterUpdate(event: UpdateEvent<any>): Promise<any> | void {
        auditLogger.logNewEntityData(event.entity);
        this.logger.info(`Entity after update - ${sessionManager.getNamespace('session').get('newData')}`);
    }

    // tslint:disable-next-line:typedef
    public afterInsert(event: InsertEvent<any>): Promise<any> | void {
        auditLogger.logNewEntityData(event.entity);
        this.logger.info(`Entity after insert - ${sessionManager.getNamespace('session').get('newData')}`);
    }
}
