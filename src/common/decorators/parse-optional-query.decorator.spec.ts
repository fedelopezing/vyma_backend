import { plainToInstance } from 'class-transformer';
import { ParseOptionalQuery } from './parse-optional-query.decorator';

class TestDto {
  @ParseOptionalQuery()
  value?: unknown;
}

describe('ParseOptionalQuery', () => {
  it('should transform null, "null", "NULL", "undefined", and "" to undefined', () => {
    const inputs = [null, 'null', 'NULL', 'undefined', ''];
    for (const input of inputs) {
      const instance = plainToInstance(TestDto, { value: input });
      expect(instance.value).toBeUndefined();
    }
  });

  it('should keep valid string values unchanged', () => {
    const instance = plainToInstance(TestDto, { value: 'NOTICIA' });
    expect(instance.value).toBe('NOTICIA');
  });

  it('should keep other values unchanged', () => {
    const instance = plainToInstance(TestDto, { value: 123 });
    expect(instance.value).toBe(123);
  });
});
