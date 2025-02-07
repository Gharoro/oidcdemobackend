import {
    HttpException,
    Injectable,
    InternalServerErrorException,
  } from '@nestjs/common';
  
  @Injectable()
  export class ResponseService {
    success(message: string, data: any = null, statusCode = 200) {
      return {
        statusCode,
        message,
        data,
      };
    }
  
    error(message: string, error: any = null, statusCode = 400) {
      return {
        statusCode,
        message,
        error,
      };
    }
  
    handleServiceError(error: any): never {
      // Re-throw HTTP exceptions directly
      if (error instanceof HttpException) {
        throw error;
      }
  
      // Wrap other errors as InternalServerErrorException
      throw new InternalServerErrorException(`An unexpected error occurred: ${error}`);
    }
  }
  