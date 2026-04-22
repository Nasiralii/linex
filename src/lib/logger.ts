// ============================================================================
// Structured Logger — Production-ready logging for LineX-Forsa
// ============================================================================

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL as LogLevel] ?? LOG_LEVELS.info;

function formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
    ...(error && {
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    }),
  };
  
  return JSON.stringify(logEntry);
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= CURRENT_LEVEL;
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (shouldLog("debug")) {
      console.debug(formatLog("debug", message, context));
    }
  },

  info(message: string, context?: LogContext) {
    if (shouldLog("info")) {
      console.log(formatLog("info", message, context));
    }
  },

  warn(message: string, context?: LogContext, error?: Error) {
    if (shouldLog("warn")) {
      console.warn(formatLog("warn", message, context, error));
    }
  },

  error(message: string, context?: LogContext, error?: Error) {
    if (shouldLog("error")) {
      console.error(formatLog("error", message, context, error));
    }
  },

  // Convenience methods for common scenarios
  auth(action: string, userId?: string, success: boolean = true) {
    this.info(`Auth: ${action}`, {
      userId,
      action,
      success,
      entityType: "auth",
    });
  },

  db(operation: string, entityType: string, entityId?: string, userId?: string) {
    this.debug(`DB: ${operation}`, {
      userId,
      action: operation,
      entityType,
      entityId,
    });
  },

  api(method: string, path: string, statusCode: number, userId?: string, duration?: number) {
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    this[level](`API: ${method} ${path}`, {
      userId,
      action: `${method} ${path}`,
      statusCode,
      duration,
      entityType: "api",
    });
  },

  security(event: string, userId?: string, details?: Record<string, unknown>) {
    this.warn(`Security: ${event}`, {
      userId,
      action: event,
      entityType: "security",
      ...details,
    });
  },
};