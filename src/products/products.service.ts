import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Products Service');

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;

    const totalItems = await this.product.count({ where: { deletedAt: null } });

    const lastPage = Math.ceil(totalItems / limit);

    const products = await this.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { deletedAt: null },
    });

    return {
      ok: true,
      data: products,
      pagination: {
        totalItems: totalItems,
        perPage: limit,
        currentPage: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, deletedAt: null },
    });
    if (!product) {
      throw new RpcException({
        message: `Product #id: ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return {
      ok: true,
      data: product,
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: __, ...data } = updateProductDto;
    console.log('data', data);
    console.log('id', id);
    await this.findOne(id);
    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async validateProduct(ids: number[]) {
    ids = Array.from(new Set(ids));
    const products = await this.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products id where not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }
}
