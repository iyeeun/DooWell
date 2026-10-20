import { isSwaggerEnabled } from './swagger.config';

describe('isSwaggerEnabled', () => {
  it('development에서는 별도 설정 없이 활성화한다', () => {
    expect(isSwaggerEnabled(undefined, 'development')).toBe(true);
  });

  it('production에서는 별도 설정 없이 비활성화한다', () => {
    expect(isSwaggerEnabled(undefined, 'production')).toBe(false);
  });

  it('명시적 설정을 환경 기본값보다 우선한다', () => {
    expect(isSwaggerEnabled(true, 'production')).toBe(true);
    expect(isSwaggerEnabled(false, 'development')).toBe(false);
  });
});
