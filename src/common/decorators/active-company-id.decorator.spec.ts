import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ExecutionContext } from '@nestjs/common';
import { ActiveCompanyId } from './active-company-id.decorator';

// Helper to extract the parameter decorator factory function from NestJS metadata
function getParamDecoratorFactory(
  decorator: (...args: unknown[]) => ParameterDecorator,
) {
  class TestController {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    testMethod(@decorator() param: unknown) {}
  }
  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestController,
    'testMethod',
  );
  const key = Object.keys(metadata)[0];
  return metadata[key].factory;
}

function createMockContext(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('ActiveCompanyId Decorator', () => {
  const factory = getParamDecoratorFactory(ActiveCompanyId);

  it('should return request.companyId if present on request', () => {
    const ctx = createMockContext({
      companyId: 42,
      user: { companyId: 99 },
    });
    const result = factory(null, ctx);
    expect(result).toBe(42);
  });

  it('should return null if user is not present on request', () => {
    const ctx = createMockContext({ user: null });
    const result = factory(null, ctx);
    expect(result).toBeNull();
  });

  it('should return companyId from query when user is superAdmin and query has companyId', () => {
    const ctx = createMockContext({
      user: { isSuperAdmin: true, companyId: 1 },
      query: { companyId: '10' },
    });
    const result = factory(null, ctx);
    expect(result).toBe(10);
  });

  it('should return companyId from body when user is superAdmin, query has no companyId, but body does', () => {
    const ctx = createMockContext({
      user: { isSuperAdmin: true, companyId: 1 },
      body: { companyId: '20' },
    });
    const result = factory(null, ctx);
    expect(result).toBe(20);
  });

  it('should return user.companyId when user is superAdmin but neither query nor body has companyId', () => {
    const ctx = createMockContext({
      user: { isSuperAdmin: true, companyId: 5 },
      query: {},
      body: {},
    });
    const result = factory(null, ctx);
    expect(result).toBe(5);
  });

  it('should return user.companyId for regular users even if query/body contains companyId', () => {
    const ctx = createMockContext({
      user: { isSuperAdmin: false, companyId: 7 },
      query: { companyId: '999' },
    });
    const result = factory(null, ctx);
    expect(result).toBe(7);
  });
});
