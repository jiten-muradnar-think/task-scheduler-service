import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { adminService, connection, consumerService, producerService } from 'service-connector';
import { Logger } from '../lib/logger/Logger';
import { smsEventListener } from '../api/services/SMSQueueManagementService';
import { env } from '../env';
import {processReportCheckpoint} from '../api/services/ReportService';
import { auditLogger } from 'thinkitive-util';

export const serviceConnectionLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    const logger: Logger = new Logger(__filename);
    connection.init();
    await adminService.createConsumerGroup();
    await adminService.createTopics();
    await producerService.init();
    logger.info(`producer is initiated `);
    await consumerService.init();
    await consumerService.initListening();

    auditLogger.init(producerService);

    consumerService.consumerEventEmitter.on(consumerService.CONSUMER_DATA_EVENT, (data: any) => {
        switch (data.topic) {
            case env.kafka.topic.generateAppointmentNotification:
                smsEventListener(data.message.value.toString());
                break;
            case env.kafka.topic.reportDelivery:
                processReportCheckpoint(data.message.value.toString());
                break;
            default:
                console.warn('No topic handler found');
                break;
        }
    });
    logger.info(`consumer is initiated`);
};
