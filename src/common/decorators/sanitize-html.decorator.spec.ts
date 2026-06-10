import { plainToInstance } from 'class-transformer';
import { SanitizeHtml } from './sanitize-html.decorator';

class TestSanitizeDto {
  @SanitizeHtml()
  html?: unknown;
}

describe('SanitizeHtml', () => {
  it('should not transform non-string values', () => {
    const instance = plainToInstance(TestSanitizeDto, { html: 123 });
    expect(instance.html).toBe(123);

    const instanceNull = plainToInstance(TestSanitizeDto, { html: null });
    expect(instanceNull.html).toBeNull();
  });

  it('should sanitize scripts and unwanted tags', () => {
    const input = '<p>Hello <script>alert("XSS")</script></p>';
    const instance = plainToInstance(TestSanitizeDto, { html: input });
    expect(instance.html).toBe('<p>Hello </p>');
  });

  it('should keep allowed HTML tags', () => {
    const input =
      '<h1>Title</h1><p>Paragraph with <strong>bold</strong> text</p>';
    const instance = plainToInstance(TestSanitizeDto, { html: input });
    expect(instance.html).toBe(input);
  });
});
