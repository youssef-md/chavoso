import 'reflect-metadata';

import { inject, injectable } from 'tsyringe';
import { getDaysInMonth, getDate, isAfter } from 'date-fns';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';

interface IRequest {
  provider_id: string;
  month: number;
  year: number;
}

type IResponse = Array<{
  day: number;
  available: boolean;
}>;

@injectable()
class ListProviderMonthAvailability {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentsRepository,
  ) {}

  public async execute({
    provider_id,
    year,
    month,
  }: IRequest): Promise<IResponse> {
    const appointmentsInMonth = await this.appointmentsRepository.findAllInMonthFromProvider(
      {
        provider_id,
        year,
        month,
      },
    );

    const numberOfDaysInMonth = getDaysInMonth(new Date(year, month - 1));

    const eachDayArray = Array.from(
      Array(numberOfDaysInMonth),
      (_, i) => i + 1,
    );

    const availability = eachDayArray.map(function getDaysAvailability(day) {
      const appointmentsInDay = appointmentsInMonth.filter(
        appointment => getDate(appointment.date) === day,
      );

      // JS starts month with 0
      const endOfDayCompareDate = new Date(year, month - 1, day, 23, 59, 59);

      return {
        day,
        available:
          isAfter(endOfDayCompareDate, new Date()) &&
          appointmentsInDay.length < 11,
      };
    });

    return availability;
  }
}

export default ListProviderMonthAvailability;
