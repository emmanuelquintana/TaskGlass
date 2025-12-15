# TaskGlass API (NestJS) — Developer Notes

## Response contract
All HTTP responses are wrapped using `ApiResponse<T>`:
- code: `TG_<subservice>_<suffix>`
- message: human readable string
- traceId: propagated from `x-trace-id` or generated
- data: payload
- metadata: pagination info

Controllers return raw data. The global ResponseWrapInterceptor wraps them.
Errors must throw AppException with a code and HTTP status.

## Style
- camelCase
- English identifiers
- JSDoc comments only
