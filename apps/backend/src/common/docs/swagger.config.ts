export function isSwaggerEnabled(
  configuredValue: boolean | undefined,
  nodeEnv: string | undefined,
): boolean {
  return configuredValue ?? nodeEnv === 'development';
}
