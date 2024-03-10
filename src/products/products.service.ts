import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

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
      throw new NotFoundException('Product not found');
    }

    return {
      ok: true,
      data: product,
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
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
}
