import { UserCreatedEvent } from './user-created.event';

describe('UserCreatedEvent', () => {
  it('should create an instance with userId and optional professionId', () => {
    const event = new UserCreatedEvent(1, 2);
    expect(event.userId).toBe(1);
    expect(event.professionId).toBe(2);
  });

  it('should create an instance without professionId', () => {
    const event = new UserCreatedEvent(1);
    expect(event.userId).toBe(1);
    expect(event.professionId).toBeUndefined();
  });
});
