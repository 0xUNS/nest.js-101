import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) {}

    async signup(dto: AuthDto) {
        try {
            const hash = await argon.hash(dto.password);
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
            });
            return this.signToken(user.id, user.email);
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                    throw new ForbiddenException('Email already exists');
            }
            throw error;
        }
    }

    async login(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });
        if (!user) {
            throw new ForbiddenException('Invalid credentials');
        }
        const pwMatches = await argon.verify(user.hash, dto.password);
        if (!pwMatches) {
            throw new ForbiddenException('Invalid credentials');
        }
        return this.signToken(user.id, user.email);
    }

    async signToken(
        userId: number,
        email: string,
    ): Promise<{ access_token: string }> {
        const payload = { sub: userId, email };
        const token = await this.jwt.signAsync(payload, {
            expiresIn: this.config.get('JWT_EXPIRES_IN'),
            secret: this.config.get('JWT_SECRET'),
        });
        return { access_token: token };
    }
}
