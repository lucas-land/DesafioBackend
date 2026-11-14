import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from "@nestjs/common";
  import { Reflector } from "@nestjs/core";
  import { CHAVE_ROLES } from "../decorators/roles.decorator";
  import type {
    RequisicaoAutenticada,
  } from "./autenticacao.guard";
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
  
    canActivate(contexto: ExecutionContext) {
      const roles = this.reflector.getAllAndOverride<string[]>(
        CHAVE_ROLES,
        [contexto.getHandler(), contexto.getClass()],
      );
  
      if (!roles || roles.length === 0) {
        return true;
      }
  
      const requisicao = contexto
        .switchToHttp()
        .getRequest<RequisicaoAutenticada>();
  
      if (!roles.includes(requisicao.usuario.perfil)) {
        throw new ForbiddenException(
          "Perfil sem permissão para esta operação",
        );
      }
  
      return true;
    }
  }