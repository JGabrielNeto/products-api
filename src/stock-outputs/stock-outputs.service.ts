import { Injectable } from '@nestjs/common';
import { CreateStockOutputDto } from './dto/create-stock-output.dto';
import { NotFoundError } from 'src/errors';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StockOutputsService {
  constructor(private prismaService: PrismaService) {}

  async create(createStockOutputDto: CreateStockOutputDto) {
    const product = await this.prismaService.product.findUnique({
      where: { id: createStockOutputDto.productId },
    });

    if (!product) {
      throw new NotFoundError('Product Not Found');
    }

    //TODO: This will throw error 500, treat them to generate meaningful messages on the response
    if (product.quantity === 0) {
      throw new Error('Product out of stock');
    }

    if (product.quantity < createStockOutputDto.quantity) {
      throw new Error('Not enough products in stock');
    }

    //TODO: Lock product row on this id so only one person can increment it at a time
    const result = await this.prismaService.$transaction([
      this.prismaService.stockOutput.create({ data: createStockOutputDto }),

      this.prismaService.product.update({
        where: {
          id: createStockOutputDto.productId,
        },
        data: {
          quantity: {
            decrement: createStockOutputDto.quantity,
          },
        },
      }),
    ]);

    return result[0];
  }

  findAll() {
    return this.prismaService.stockOutput.findMany();
  }

  async findOne(id: number) {
    try {
      return await this.prismaService.stockOutput.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025')
        throw new NotFoundError(`Stock Output with ID ${id} not found`);
    }
  }
}
