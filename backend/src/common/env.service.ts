import { plainToInstance, Transform, Type } from 'class-transformer';
import { ArrayNotEmpty, IsInt, IsNotEmpty, IsString, IsUrl, Max, Min, validateSync } from 'class-validator';

const splitList = ({ value }: { value: unknown }) =>
    typeof value === 'string'
        ? value
              .split(',')
              .map(item => item.trim())
              .filter(Boolean)
        : value;

export class EnvService {
    @IsUrl({ require_tld: false, require_protocol: true })
    readonly HOST: string = 'http://127.0.0.1';

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(65535)
    readonly PORT: number = 8000;

    @Transform(splitList)
    @ArrayNotEmpty()
    @IsString({ each: true })
    readonly VALID_API_KEYS!: string[];

    @Transform(splitList)
    @ArrayNotEmpty()
    @IsUrl({ require_tld: false, require_protocol: true }, { each: true })
    readonly CORS_ORIGIN: string[] = ['http://localhost:3000'];

    @IsString()
    @IsNotEmpty()
    readonly MAP_KML_PATH: string = 'map.kml';

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(20000)
    readonly OBJECTS_COUNT: number = 150;

    @Type(() => Number)
    @IsInt()
    @Min(100)
    @Max(60000)
    readonly MOVE_INTERVAL_MS: number = 5000;

    static fromEnv(env: Record<string, unknown>): EnvService {
        const envSvc = plainToInstance(EnvService, env, { exposeDefaultValues: true });
        const errors = validateSync(envSvc);
        if (errors.length) {
            const details = errors.flatMap(error => Object.values(error.constraints ?? {})).join('\n  ');
            throw new Error(`Invalid environment configuration:\n  ${details}`);
        }
        return envSvc;
    }
}
