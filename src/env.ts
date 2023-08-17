import * as dotenv from 'dotenv';
import * as path from 'path';

import * as pkg from '../package.json';
import {
    getOsEnv, getOsEnvOptional, getOsPath, getOsPaths, normalizePort, toBool, toNumber
} from './lib/env';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({ path: path.join(process.cwd(), `.env${((process.env.NODE_ENV === 'test') ? '.test' : '')}`) });

/**
 * Environment variables
 */
export const env = {
    node: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    isDevelopment: process.env.NODE_ENV === 'development',
    app: {
        name: getOsEnv('APP_NAME'),
        version: (pkg as any).version,
        description: (pkg as any).description,
        host: getOsEnv('APP_HOST'),
        schema: getOsEnv('APP_SCHEMA'),
        routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
        port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
        banner: toBool(getOsEnv('APP_BANNER')),
        dirs: {
            migrations: getOsPaths('TYPEORM_MIGRATIONS'),
            migrationsDir: getOsPath('TYPEORM_MIGRATIONS_DIR'),
            entities: getOsPaths('TYPEORM_ENTITIES'),
            entitiesDir: getOsPath('TYPEORM_ENTITIES_DIR'),
            controllers: getOsPaths('CONTROLLERS'),
            middlewares: getOsPaths('MIDDLEWARES'),
            interceptors: getOsPaths('INTERCEPTORS'),
            subscribers: getOsPaths('SUBSCRIBERS'),
            resolvers: getOsPaths('RESOLVERS'),
        },
    },
    log: {
        level: getOsEnv('LOG_LEVEL'),
        json: toBool(getOsEnvOptional('LOG_JSON')),
        output: getOsEnv('LOG_OUTPUT'),
    },
    db: {
        type: getOsEnv('TYPEORM_CONNECTION'),
        host: getOsEnvOptional('TYPEORM_HOST'),
        port: toNumber(getOsEnvOptional('TYPEORM_PORT')),
        username: getOsEnvOptional('TYPEORM_USERNAME'),
        password: getOsEnvOptional('TYPEORM_PASSWORD'),
        database: getOsEnv('TYPEORM_DATABASE'),
        synchronize: toBool(getOsEnvOptional('TYPEORM_SYNCHRONIZE')),
        logging: getOsEnv('TYPEORM_LOGGING'),
    },
    swagger: {
        enabled: toBool(getOsEnv('SWAGGER_ENABLED')),
        route: getOsEnv('SWAGGER_ROUTE'),
    },
    kafka: {
        topic: {
            generateAppointmentNotification: getOsEnv('KAFKA_GENERATE_APPOINTMENT_NOTIFICATION'),
            processCheckpoint: getOsEnv('KAFKA_PROCESS_CHECKPOINT'),
            processAppointmentJob: getOsEnv('KAFKA_PROCESS_APPOINTMENT_JOB'),
            processNotification: getOsEnv('KAFKA_PROCESS_NOTIFICATION'),
            reportDeliveryCallback: getOsEnv('REPORT_DELIVERY_CALLBACK_TOPIC'),
            reportDelivery: getOsEnv('REPORT_DELIVERY_TOPIC'),
        },
    },
    monitor: {
        enabled: toBool(getOsEnv('MONITOR_ENABLED')),
        route: getOsEnv('MONITOR_ROUTE'),
        username: getOsEnv('MONITOR_USERNAME'),
        password: getOsEnv('MONITOR_PASSWORD'),
    },
    redis: {
        url: getOsEnv('REDIS_URL'),
        password: getOsEnv('REDIS_PASSWORD'),
        port: toNumber(getOsEnv('REDIS_PORT')),
        sentinelPassword: getOsEnv('REDIS_SENTINEL_PASSWORD'),
    },
    bull: {
        queue: {
            appointmentSMSQueue: getOsEnv('APPOINTMENT_SMS_QUEUE'),
            concurrency: toNumber(getOsEnv('CONCURRENCY')),
        },
        prefix: {
            appointmentSMSPrefix: getOsEnv('APPOINTMENT_SMS_PREFIX'),
        },
    },
    bucketConfig: {
        baseUrl: getOsEnv('STORAGE_BASE_URL'),
        bucketName: getOsEnv('BUCKET_NAME'),
     },
    serviceMesh: {
        notification: {
            baseUrl: getOsEnv('NOTIFICATION_SERVICE_URL'),
            apiKey: getOsEnv('API_KEY'),
        },
        checkpoint: {
            baseUrl: getOsEnv('CHECKPOINT_SERVICE_URL'),
            apiKey: getOsEnv('API_KEY'),
        },
        partner: {
            baseUrl: getOsEnv('PARTNER_SERVICE_URL'),
            clientName: getOsEnv('CLIENT_NAME'),
            clientSecret: getOsEnv('CLIENT_SECRET'),
            apiKey: getOsEnv('API_KEY'),
        },
        patient: {
            baseUrl: getOsEnv('PATIENT_MGMT_SERVICE_URL'),
            apiKey: getOsEnv('API_KEY'),
        },
        webAppIntegrationService: {
            baseUrl: getOsEnv('WEB_APP_INTEGRATION_SERVICE_URL'),
            apiKey: getOsEnv('API_KEY'),
        },
        appointmentService: {
            baseUrl: getOsEnv('APPOINTMENT_SERVICE_URL'),
            apiKey: getOsEnv('API_KEY'),
        },
    },
    delay: {
        resyncTime: toNumber(getOsEnv('RESYNC_TIME')),
    },
    cronSchedule: {
        healthCheckTime: toNumber(getOsEnv('HEALTH_CHECK_TIME')),
        healthCheckUnit: getOsEnv('HEALTH_CHECK_UNIT'),
        normalScheduleTime: toNumber(getOsEnv('NORMAL_JOB_SCHEDULER_TIME')),
        normalScheduleUnit: (getOsEnv('NORMAL_JOB_SCHEDULER_UNIT')),
        stuckedScheduleTime: toNumber(getOsEnv('STUCKED_JOB_SCHEDULER_TIME')),
        stuckedScheduleUnit: getOsEnv('STUCKED_JOB_SCHEDULER_UNIT'),
        oldScheduleToggle: toBool(getOsEnv('OLD_SCHEDULING_TOGGLE')),
        newSchedulePartners: getOsEnv('NEW_SCHEDULING_PARTNERS'),
    },
    toggle: {
        bookToggle: toBool(getOsEnv('STOP_TOB_TOGGLE')),
        checkpointCancelledAppointmentToggle: getOsEnv('TOGGLE_CHECKPOINT_CANCELLED_APPOINTMENT'),
    },
};
