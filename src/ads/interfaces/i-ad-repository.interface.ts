import { Ad } from '../entities/ad.entity';
import { CreateAdDto } from '../dto/create-ad.dto';
import { UpdateAdDto } from '../dto/update-ad.dto';
import { AdsPaginationDto } from '../dto/ads-pagination.dto';

export interface IAdRepository {
  findActiveByCompany(companyId: number): Promise<Ad[]>;
  findPaginated(
    paginationDto: AdsPaginationDto,
    companyId: number,
  ): Promise<[Ad[], number]>;
  findOneById(id: string): Promise<Ad | null>;
  create(dto: CreateAdDto, companyId: number): Promise<Ad>;
  update(ad: Ad, dto: UpdateAdDto): Promise<Ad>;
  softDelete(id: string): Promise<void>;
}
