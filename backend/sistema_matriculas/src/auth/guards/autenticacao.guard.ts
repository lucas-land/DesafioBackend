import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from "@nestjs/common";
  import { Reflector } from "@nestjs/core";
  import { JwtService } from "@nestjs/jwt";
  import type { Request } from "express";
  import {
    CHAVE_PUBLICA,
  } from "../decorators/public.decorator";
  
  export type UsuarioAutenticado = {
    sub: string;
    username: string;
    perfil: "aluno" | "admin";
  };
  
  export type RequisicaoAutenticada = Request & {
    usuario: UsuarioAutenticado;
  };
  
  @Injectable()
  export class AutenticacaoGuard implements CanActivate {
    constructor(
      private readonly reflector: Reflector,
      private readonly jwt: JwtService,
    ) {}
  
    async canActivate(contexto: ExecutionContext) {
      const rotaPublica = this.reflector.getAllAndOverride<boolean>(
        CHAVE_PUBLICA,
        [contexto.getHandler(), contexto.getClass()],
      );
  
      if (rotaPublica) {
        return true;
      }
  
      const requisicao = contexto
        .switchToHttp()
        .getRequest<RequisicaoAutenticada>();
      const [tipo, token] =
        requisicao.headers.authorization?.split(" ") ?? [];
  
      if (tipo !== "Bearer" || !token) {
        throw new UnauthorizedException("Token não informado");
      }
  
      try {
        requisicao.usuario =
          await this.jwt.verifyAsync<UsuarioAutenticado>(token);
        return true;
      } catch {
        throw new UnauthorizedException("Token inválido ou expirado");
      }
    }
  }