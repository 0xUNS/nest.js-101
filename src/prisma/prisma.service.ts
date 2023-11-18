import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        super({
            datasources: {
                db: {
                    url: 'postgresql://db-user:pw1234@localhost:5432/nest101service-db?schema=public'
                }
            }
        })
    }
}
