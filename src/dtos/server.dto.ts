import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateServerDto {
  @IsString()
  public name: string;

  @IsNotEmpty()
  public ip: string;

  @IsNumber(undefined, { message: 'Memory limit must be a number in MB' })
  @Min(1, { message: 'Memory limit must be at least 1MB' })
  @Max(999999, { message: 'Memory limit must be at most 999999MB' })
  public memory: string;

  @IsOptional()
  public port: string;

  @IsNotEmpty()
  public image: string;
}
