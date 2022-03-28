import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateServerDto {
  @IsString()
  public name: string;

  @IsNotEmpty()
  public ip: string;

  @IsNumber(undefined, { message: 'Memory limit must be a number in MB' })
  @Min(1, { message: 'Memory limit must be at least 1MB' })
  @Max(99999, { message: 'Memory limit must be at most 99999MB' })
  public memory: string;

  public port: string;
}
