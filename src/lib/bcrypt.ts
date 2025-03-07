import { compare, genSalt, hash } from 'bcrypt';

async function hashPassword(password: string) {
  try {
    const salt = await genSalt();

    return await hash(password, salt);
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

async function comparePassword(payload: string, password: string) {
  try {
    return await compare(payload, password);
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

export { hashPassword, comparePassword };
