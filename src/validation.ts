import type { StandardSchemaV1 } from "@standard-schema/spec"

export type ValidationIssue = Omit<StandardSchemaV1.Issue, "path"> & {
  path: readonly (string | number | symbol)[]
}

type ValidationFailureResult = {
  success: false
  issues: readonly ValidationIssue[]
}

type ValidationSuccessResult<T> = {
  success: true
  output: T
}

type ValidationResult<T> = ValidationSuccessResult<T> | ValidationFailureResult

const normalizeIssue = (issue: StandardSchemaV1.Issue): ValidationIssue => ({
  ...issue,
  path:
    issue.path?.map((segment) =>
      typeof segment === "object" ? segment.key : segment
    ) ?? []
})

export async function standardValidate<
  T extends StandardSchemaV1<unknown, unknown>
>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>
): Promise<ValidationResult<StandardSchemaV1.InferOutput<T>>> {
  const result = await schema["~standard"].validate(input)

  // if the `issues` field exists, the validation failed
  if (result.issues) {
    return {
      success: false,
      issues: result.issues.map(normalizeIssue)
    }
  }

  return {
    success: true,
    output: result.value
  }
}
