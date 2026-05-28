import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);

    // Mock Date.now for predictable TTL testing
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should store and retrieve a value', () => {
    service.set('key', 'value');
    expect(service.get('key')).toBe('value');
  });

  it('should return null for non-existent key', () => {
    expect(service.get('unknown')).toBeNull();
  });

  it('should delete a key', () => {
    service.set('key', 'value');
    service.delete('key');
    expect(service.get('key')).toBeNull();
  });

  it('should clear all keys', () => {
    service.set('key1', 'value1');
    service.set('key2', 'value2');
    service.clear();
    expect(service.get('key1')).toBeNull();
    expect(service.get('key2')).toBeNull();
  });

  it('should expire keys based on TTL', () => {
    // Setting TTL to 5 seconds
    service.set('key', 'value', 5);

    // Fast-forward 4 seconds
    jest.advanceTimersByTime(4000);
    expect(service.get('key')).toBe('value');

    // Fast-forward 2 more seconds (total 6 seconds)
    jest.advanceTimersByTime(2000);
    expect(service.get('key')).toBeNull();
  });
});
