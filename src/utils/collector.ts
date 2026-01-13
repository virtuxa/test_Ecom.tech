import type { LogEvent, Report, UserErrors } from "../types/interface.js";

function toTopUsersWithErrors(
  errorsByUser: ReadonlyMap<string, number>,
  topN: number,
): UserErrors[] {
  return [...errorsByUser.entries()]
    .sort((a, b) => {
      const diff = b[1] - a[1];
      if (diff !== 0) return diff;
      return a[0].localeCompare(b[0]);
    })
    .slice(0, topN)
    .map(([user, errors]) => ({ user, errors }));
}

export class StatsCollector {
  private totalLines = 0;
  private errorLines = 0;
  private invalidLines = 0;
  private errorLinesWithoutUser = 0;
  private errorsByUser = new Map<string, number>();

  onLine(): void {
    this.totalLines += 1;
  }

  onInvalidLine(): void {
    this.invalidLines += 1;
  }

  onEvent(event: LogEvent): void {
    if (event.level !== "ERROR") return;
    this.errorLines += 1;

    const user = event.fields.user;
    if (!user) {
      this.errorLinesWithoutUser += 1;
      return;
    }

    this.errorsByUser.set(user, (this.errorsByUser.get(user) ?? 0) + 1);
  }

  finalize(topN: number): Report {
    return {
      totalLines: this.totalLines,
      errorLines: this.errorLines,
      topUsersWithErrors: toTopUsersWithErrors(this.errorsByUser, topN),
      invalidLines: this.invalidLines,
      errorLinesWithoutUser: this.errorLinesWithoutUser,
    };
  }
}
