import User from "../../models/User";
import AppError from "../../errors/AppError";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import { SerializeUser } from "../../helpers/SerializeUser";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Setting from "../../models/Setting";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  queues: Queue[];
  companyId: number;
}

interface Request {
  email: string;
  password: string;
}

interface Response {
  serializedUser: SerializedUser;
  token: string;
  refreshToken: string;
}

const AuthUserService = async ({
  email,
  password
}: Request): Promise<Response> => {
  console.log('Tentando autenticar usuário:', email);
  
  const user = await User.findOne({
    where: { email },
    include: ["queues", { model: Company, include: [{ model: Setting }] }]
  });

  if (!user) {
    console.log('Usuário não encontrado');
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  console.log('Usuário encontrado:', {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash
  });

  const isValid = await user.checkPassword(password);
  console.log('Senha válida:', isValid);

  if (!isValid) {
    console.log('Senha inválida');
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  const token = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  const serializedUser = await SerializeUser(user);

  return {
    serializedUser,
    token,
    refreshToken
  };
};

export default AuthUserService;
