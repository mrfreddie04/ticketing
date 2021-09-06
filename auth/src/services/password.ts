import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  public static async toHash(password: string): Promise<string> {

    const salt = randomBytes(8).toString("hex");
    const buf  = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashed = `${buf.toString("hex")}.${salt}`;

    return hashed;
  }

  public static async compare(storedPassword: string, suppliedPassword: string): Promise<boolean> {

    const [hashedPassword,salt] = storedPassword.split(".");
    const buf  = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    const suppliedhash = buf.toString("hex");
    
    return (hashedPassword === suppliedhash);
  }

}