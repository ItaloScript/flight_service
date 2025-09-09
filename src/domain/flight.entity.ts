export class Flight {
  constructor(
    public readonly id: number,
    public readonly flight_number: string,
    public readonly airline_id: number,
    public readonly origin_iata: string,
    public readonly destination_iata: string,
    public readonly departure_time_local: string, // HH:mm
    public readonly arrival_time_local: string, // HH:mm
    public readonly frequency: number[], // dias da semana [0..6]
  ) {}
}
