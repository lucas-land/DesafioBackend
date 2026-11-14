import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
  } from "@nestjs/common";
  import { AuthService } from "./auth.service";
  import { Public } from "./decorators/public.decorator";
  import { LoginDto } from "./dto/login.dto";
  import { RegistrarDto } from "./dto/registrar.dto";
  
  @Controller("auth")
  export class AuthController {
    constructor(private readonly auth: AuthService) {}
  
    @Public()
    @Post("registrar")
    registrar(@Body() dados: RegistrarDto) {
      return this.auth.registrar(dados);
    }
  
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("login")
    login(@Body() dados: LoginDto) {
      return this.auth.login(dados);
    }
  }