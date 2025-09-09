export class Itinerary {
  constructor(
    public readonly id: number,
    public readonly leg_ids: number[],
  ) {}
}
