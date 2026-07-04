import { plainToInstance } from 'class-transformer';
import { ParseBooleanQuery } from './parse-boolean-query.decorator';

class TestDto {
  @ParseBooleanQuery()
  value?: unknown;
}

describe('ParseBooleanQuery', () => {
  it('should transform "true" and "1" to true', () => {
    const inputs = ['true', '1'];
    for (const input of inputs) {
      const instance = plainToInstance(TestDto, { value: input });
      expect(instance.value).toBe(true);
    }
  });

  it('should transform "false" and "0" to false', () => {
    const inputs = ['false', '0'];
    for (const input of inputs) {
      const instance = plainToInstance(TestDto, { value: input });
      expect(instance.value).toBe(false);
    }
  });

  it('should keep actual boolean values unchanged', () => {
    expect(plainToInstance(TestDto, { value: true }).value).toBe(true);
    expect(plainToInstance(TestDto, { value: false }).value).toBe(false);
  });

  it('should keep other values unchanged', () => {
    const instance = plainToInstance(TestDto, { value: 'some-string' });
    expect(instance.value).toBe('some-string');
  });
});
