import { SessionOptions } from "express-session";

export const __prod__ = false;

export const cookieOptions: SessionOptions = {
  secret:
    "6AJ#7tcQ6ZsN8XG@5vugu5ymr6Qbmy#aNws^Gy8VDb9u3^XCxa9PYMk^qa&yrWDF*X!tHKiY5CtZTDPPj3Bw^gv3V5DDrnDGgZR8rFm4JPeJ33Pj4dvEPi@&ZkdHwNqo",
  name: "id",
  cookie: {
    httpOnly: true,
    secure: __prod__,
    maxAge: 1000 * 60 * 60 * 24 * 365, //1y
    sameSite: "lax",
  },
};
