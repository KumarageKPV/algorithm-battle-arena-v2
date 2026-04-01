import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({ url: '/test' }),
      }),
    };
  });

  it('should handle HttpException with string response', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    filter.catch(exception, mockHost);
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ statusCode: 404, message: 'Not Found' });
  });

  it('should handle HttpException with object response', () => {
    const exception = new HttpException({ ok: false, errors: ['bad'] }, HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockHost);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ ok: false, errors: ['bad'] });
  });

  it('should handle generic Error with 500 status', () => {
    const exception = new Error('Something broke');
    filter.catch(exception, mockHost);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error: Something broke',
    });
  });

  it('should handle unknown throw with 500 status', () => {
    filter.catch('random string', mockHost);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
    });
  });
});

