import { LoggerService } from '@nestjs/common';

type LogLevel = 'log' | 'warn' | 'error' | 'debug';

const SENSITIVE_KEYS = new Set([
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'apikey',
    'password',
    'token',
    'access_token',
    'refresh_token',
    'database_url',
    'connectionstring'
]);

function maskValue(value: unknown): unknown {
    if (typeof value === 'string') {
        if (value.length <= 8) return '***';
        return `${value.slice(0, 3)}***${value.slice(-3)}`;
    }
    return '***';
}

function redactObject(input: any, depth = 0): any {
    if (input == null) return input;
    if (depth > 4) return '[MaxDepth]';

    if (Array.isArray(input)) {
        return input.slice(0, 20).map((v) => redactObject(v, depth + 1));
    }

    if (typeof input === 'object') {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(input)) {
            const key = String(k).toLowerCase();
            if (SENSITIVE_KEYS.has(key)) {
                out[k] = maskValue(v);
            } else {
                out[k] = redactObject(v, depth + 1);
            }
        }
        return out;
    }

    return input;
}

/**
 * TgLogger prints structured JSON logs with redaction support.
 */
export class TgLogger implements LoggerService {
    constructor(private readonly context = 'App') { }

    private write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
        const payload = {
            ts: new Date().toISOString(),
            level,
            context: this.context,
            message,
            ...((meta && Object.keys(meta).length > 0) ? { meta: redactObject(meta) } : {})
        };

        // eslint-disable-next-line no-console
        console[level === 'debug' ? 'log' : level](JSON.stringify(payload));
    }

    log(message: string, meta?: Record<string, unknown>): void {
        this.write('log', message, meta);
    }

    warn(message: string, meta?: Record<string, unknown>): void {
        this.write('warn', message, meta);
    }

    error(message: string, meta?: Record<string, unknown>): void {
        this.write('error', message, meta);
    }

    debug(message: string, meta?: Record<string, unknown>): void {
        this.write('debug', message, meta);
    }
}
