import {
    ConflictException,
    Injectable,
    UnauthorizedException,
  } from "@nestjs/common";
  import { JwtService } from "@nestjs/jwt";
  import {
    randomBytes,
    randomUUID,
    scrypt as scryptCallback,
    timingSafeEqual,
  } from "node:crypto";
  import { promisify } from "node:util";
  import {
    ResultSetHeader,
    RowDataPacket,
  } from "mysql2";
  import { DatabaseService } from "../database/database.service";
  import { LoginDto } from "./dto/login.dto";
  import { RegistrarDto } from "./dto/registrar.dto";
  
  const scrypt = promisify(scryptCallback);
  
  type UsuarioBanco = RowDataPacket & {
    id: string;
    username: string;
    password: string;
    perfil: "aluno" | "admin";
  };
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly banco: DatabaseService,
      private readonly jwt: JwtService,
    ) {}
  
    private async criarHash(senha: string) {
      const salt = randomBytes(16).toString("hex");
      const hash = (await scrypt(senha, salt, 64)) as Buffer;
      return `${salt}:${hash.toString("hex")}`;
    }
  
    private async verificarSenha(senha: string, senhaHash: string) {
      const [salt, hashHex] = senhaHash.split(":");
  
      if (!salt || !hashHex) {
        return false;
      }
  
      const hashArmazenado = Buffer.from(hashHex, "hex");
      const hashRecebido = (await scrypt(
        senha,
        salt,
        hashArmazenado.length,
      )) as Buffer;
  
      return (
        hashArmazenado.length === hashRecebido.length &&
        timingSafeEqual(hashArmazenado, hashRecebido)
      );
    }
  
    private ehUsernameDuplicado(erro: unknown) {
      return (
        typeof erro === "object" &&
        erro !== null &&
        "code" in erro &&
        (erro as { code?: string }).code === "ER_DUP_ENTRY"
      );
    }
  
    async registrar(dados: RegistrarDto) {
      const username = dados.username.trim();
      const id = randomUUID();
      const senhaHash = await this.criarHash(dados.senha);
  
      try {
        await this.banco.executar<ResultSetHeader>(
          `INSERT INTO users
            (id, username, password, perfil)
           VALUES (?, ?, ?, 'aluno')`,
          [id, username, senhaHash],
        );
      } catch (erro) {
        if (this.ehUsernameDuplicado(erro)) {
          throw new ConflictException("Username já cadastrado");
        }
  
        throw erro;
      }
  
      return {
        id,
        username,
        perfil: "aluno" as const,
      };
    }
  
    async login(dados: LoginDto) {
      const username = dados.username.trim();
      const users = await this.banco.executar<UsuarioBanco[]>(
        `SELECT id, username, password, perfil
         FROM users
         WHERE username = ?`,
        [username],
      );
      const usuario = users[0];
  
      if (
        !usuario ||
        !(await this.verificarSenha(dados.senha, usuario.password))
      ) {
        throw new UnauthorizedException("Username ou senha inválidos");
      }
  
      const accessToken = await this.jwt.signAsync({
        sub: usuario.id,
        username: usuario.username,
        perfil: usuario.perfil,
      });
  
      return {
        accessToken,
        usuario: {
          id: usuario.id,
          username: usuario.username,
          perfil: usuario.perfil,
        },
      };
    }
  }