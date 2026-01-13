export type LogLevel = string;

export type ParseErrorCode =
  | "empty_line"
  | "missing_timestamp"
  | "invalid_timestamp"
  | "missing_level"
  | "invalid_kv_pair";

export type ParseError = {
  code: ParseErrorCode;
  message: string;
  line: string;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ParseError };

export type LogEvent = {
  timestamp: string;
  level: LogLevel;
  fields: Record<string, string>;
  raw: string;
};

export type UserErrors = { user: string; errors: number };

export type Report = {
  totalLines: number;
  errorLines: number;
  topUsersWithErrors: UserErrors[];
  invalidLines: number;
  errorLinesWithoutUser: number;
};

export type AnalyzeOptions = {
  topN?: number;
  strict?: boolean;
  maxInvalidLines?: number;
};

export type CliOptions = AnalyzeOptions & {
  filePath?: string;
  help?: boolean;
};
