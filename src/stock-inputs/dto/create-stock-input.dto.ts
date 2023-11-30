import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateStockInputDto {
  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
