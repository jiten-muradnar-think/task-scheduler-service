import { axios } from 'thinkitive-util';
import { env } from '../../env';
import { Service } from 'typedi';
import { AppointmentDetail, AppointmentSearchQueryParams } from '../models/AppointmentDetails';
import { AppointmentRequestMapper } from '../mapper/AppointmentRequestMapper';
import { AppointmentEvent } from '../models/AppointmentEvent';

@Service()
export class AppointmentServiceClient {
    constructor(private appointmentRequestMapper: AppointmentRequestMapper) {
    }

    /**
     * @param { AppointmentSearchQueryParams } queryParam
     * @param { number } partnerId
     * @returns { Promise<AppointmentEvent[]> }
     * @function = fetched the appointment details using AppointmentSearchQueryParams
    */
    public async getAppointmentDetails(queryParam: AppointmentSearchQueryParams, partnerId: number): Promise<AppointmentEvent[]> {
        const response = await axios.get<AppointmentDetail[]>(`${env.serviceMesh.appointmentService.baseUrl}/appointment-detail`, {
            headers: {
                'x-partner-id': partnerId,
                'apikey': env.serviceMesh.appointmentService.apiKey,
            },
            params: queryParam,
        });
        return response.data.map(a => this.appointmentRequestMapper.toAppointmentEventMapper(a, partnerId));
    }

    /**
     * @param { AppointmentSearchQueryParams } queryParam
     * @param { number } partnerId
     * @returns { Promise<AppointmentDetail[]> }
     * @function = fetched the updated appointment
    */
    public async getUpdatedAppointment(queryParam: AppointmentSearchQueryParams, partnerId: number): Promise<AppointmentDetail> {
        const response = await axios.get<AppointmentDetail>(`${env.serviceMesh.appointmentService.baseUrl}/v2/detail`, {
            headers: {
                'x-partner-id': partnerId,
                'apikey': env.serviceMesh.appointmentService.apiKey,
            },
            params: queryParam,
        });
        return response.data;
    }
}
