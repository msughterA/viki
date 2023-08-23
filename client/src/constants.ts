//export const _prod_ = process.env.NODE_ENV === "production";
const _prod_ = true;
export const apiBaseUrl = _prod_
  ? "https://github.com/login/oauth/authorize"
  : "http://localhost:3001";
export const accessTokenKey = "@vsinder/token" + (_prod_ ? "" : "dev");
export const refreshTokenKey = "@vsinder/refresh-token" + (_prod_ ? "" : "dev");
export const avatarUrlkey ="avatarUrl";
export const userNameKey = "userName";
export const websocketUrl = "ws://localhost:8000/ws/errands/";
export const chatUrl = "http://127.0.0.1:8000/chat/";
export const stateSocketUrl = "ws://localhost:8000/ws/state/";