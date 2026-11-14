import { Transform } from "class-transformer";
import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegistrarDto {
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).+$/,
    {
      message:
        "A senha deve conter maiúscula, minúscula, número e símbolo",
    },
  )
  senha!: string;
}
