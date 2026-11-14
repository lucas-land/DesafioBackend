import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
  } from "@nestjs/common";
  import { ConfigService } from "@nestjs/config";
  import {
    createPool,
    Pool,
    QueryResult,
  } from "mysql2/promise";
  
  type ParametroSql =
    | string
    | number
    | boolean
    | Date
    | Buffer
    | null;
  
  @Injectable()
  export class DatabaseService
    implements OnModuleInit, OnModuleDestroy
  {
    private readonly pool: Pool;
  
    constructor(configuracao: ConfigService) {
      this.pool = createPool({
        host: configuracao.getOrThrow<string>("DB_HOST"),
        port: Number(configuracao.getOrThrow<string>("DB_PORT")),
        user: configuracao.getOrThrow<string>("DB_USER"),
        password: configuracao.getOrThrow<string>("DB_PASSWORD"),
        database: configuracao.getOrThrow<string>("DB_NAME"),
        waitForConnections: true,
        connectionLimit: 10,
        namedPlaceholders: false,
      });
    }
  
    async onModuleInit() {
      await this.pool.query("SELECT 1");
    }
  
    async executar<T extends QueryResult>(
      sql: string,
      parametros: ParametroSql[] = [],
    ): Promise<T> {
      const [resultado] = await this.pool.execute<T>(sql, parametros);
      return resultado;
    }
  
    async onModuleDestroy() {
      await this.pool.end();
    }
  }