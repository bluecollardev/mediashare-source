import { SnakeCaseToCamelCase, snakeCaseToCamelCase } from './string';

type EnumRecordType<S extends readonly string[]> = {
  [P in S[number] as SnakeCaseToCamelCase<P>]: SnakeCaseToCamelCase<P>
}

export const makeEnum = <T extends readonly string[]>(values: T): EnumRecordType<T> => {
  return values.reduce(
    (prev, curr) => ({ ...prev, [snakeCaseToCamelCase(curr) as string]: curr }),
    Object.create({})
  );
}
