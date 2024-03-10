import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  public name: string;

  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Type(() => Number)
  public price: number;

  @IsString()
  @IsOptional()
  public description: string;
}
