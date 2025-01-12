import { compare, hash, genSalt } from 'bcrypt';

async function hashPassword(password: string) {
  try {
    const salt = await genSalt();

    return await hash(password, salt);
  } catch (error) {
    throw new Error(error);
  }
}

async function comparePassword(payload: string, password: string) {
  try {
    return await compare(payload, password);
  } catch (error) {
    throw new Error(error);
  }
}

export { hashPassword, comparePassword };
