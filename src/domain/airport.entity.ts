export class Airport {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly iata_code: string,
    public readonly timezone: string, // IANA
  ) {}
}
