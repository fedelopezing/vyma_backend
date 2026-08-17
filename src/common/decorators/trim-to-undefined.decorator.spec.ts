import { plainToInstance } from 'class-transformer';
import { TrimToUndefined } from './trim-to-undefined.decorator';

class TestDto {
  @TrimToUndefined()
  value?: unknown;
}

describe('TrimToUndefined', () => {
  it('should transform empty strings and whitespace-only strings to undefined', () => {
    const inputs = ['', '   ', '\t', '\n', ' \n '];
    for (const input of inputs) {
      const instance = plainToInstance(TestDto, { value: input });
      expect(instance.value).toBeUndefined();
    }
  });

  it('should trim and keep valid strings', () => {
    const instance = plainToInstance(TestDto, {
      value: '  contacto@abc.com  ',
    });
    expect(instance.value).toBe('contacto@abc.com');
  });

  it('should keep other types unchanged', () => {
    const inputs = [null, undefined, 123, true, false, { key: 'val' }];
    for (const input of inputs) {
      const instance = plainToInstance(TestDto, { value: input });
      expect(instance.value).toEqual(input);
    }
  });
});
