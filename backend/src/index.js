import * as dotenv from "dotenv";
dotenv.config();
import { Telegraf } from "telegraf";

export const bot = new Telegraf(process.env.BOT_TOKEN);

import "./Utils/eventHandler.js";
import "./Utils/frontendHandler.js";

console.log("[INFO] - bot is online");
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
