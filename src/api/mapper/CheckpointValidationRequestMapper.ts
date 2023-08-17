import { Builder } from 'builder-pattern';
import { Service } from 'typedi';
import { AppointmentDetail } from '../models/AppointmentDetails';
import { AppointmentEvent } from '../models/AppointmentEvent';
import { CheckPointHandlerRequest } from '../models/CheckpointTemplateRequest';

@Service()
export class CheckpointRequestMapper {

    /** 
    * @param { AppointmentEvent } request
    * @returns { CheckPointHandlerRequest }
    * @function = the appointment Event are mapped to CheckPointHandlerRequest ;
    */
    public appointmentEventMapper(request: AppointmentEvent): CheckPointHandlerRequest {
        return Builder(CheckPointHandlerRequest)
            .status(request.emrDetail.emrStatusCode)
            .physicianId(String(request.providerId))
            .appointmentType(request.type)
            .appointmentStatus(request.status)
            .registration(request.registered)
            .appointmentStartTime(request.startTime)
            .appointmentId(request.id)
            .locationId(request.locationId)
            .appointmentNotes(request.appointmentNotes)
            .emr(request.emr)
            .partnerId(String(request.partnerId))
            .build();
    }

    /** 
    * @param { AppointmentDetail } request
    * @returns { CheckPointHandlerRequest }
    * @function = the appointment Details are mapped to CheckPointHandlerRequest ;
    */
    public appointmentDetailsMapper(request: AppointmentDetail): CheckPointHandlerRequest {
        return Builder(CheckPointHandlerRequest)
            .status(request.emrApptStatusCode)
            .physicianId(String(request.providerId))
            .appointmentType(request.type)
            .appointmentStatus(request.status)
            .registration(request.registered.toLowerCase() === 'yes' ? true : false)
            .appointmentStartTime(request.startTime)
            .appointmentId(request.id)
            .locationId(request.locationId)
            .appointmentNotes(request.appointmentNotes)
            .emr(request.emr)
            .build();
    }
}
