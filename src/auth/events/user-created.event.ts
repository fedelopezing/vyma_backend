export class UserCreatedEvent {
  constructor(
    public readonly userId: number,
    public readonly professionId?: number,
  ) {}
}
