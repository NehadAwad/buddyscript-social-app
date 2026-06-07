import helmet from "helmet";
import { getAllowedOrigins } from "./cors";

export function configureHelmet() {
  const allowedOrigins = getAllowedOrigins();

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", ...allowedOrigins],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", ...allowedOrigins],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  });
}
