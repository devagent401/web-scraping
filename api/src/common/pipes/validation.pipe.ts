import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  private readonly logger = new Logger(CustomValidationPipe.name);

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (!metadata.type || !metadata.metatype) {
      return value;
    }

    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', '),
        }))
        .flat();

      this.logger.error(`Validation failed: ${JSON.stringify(errorMessages)}`);

      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    return object;
  }
}
