import { glob } from "glob";
import { pathToFileURL } from "node:url";
import { bot } from "../index.js";

async function loadEvents() {
  try {
    const files = await glob(`${process.cwd()}/src/Events/**/*.js`);

    for (let file of files) {
      const fileUrl = pathToFileURL(file).toString();
      const eventModule = await import(fileUrl);
      const event = eventModule.default;

      if (event?.disabled) continue;

      const eventType = event?.type;
      if (!eventType) continue;

      try {
        bot.on(eventType, async (ctx) => {
          try {
            await event.execute(ctx, bot);
          } catch (error) {
            console.error("[EventHandler] -", error);
          }
        });
      } catch (error) {
        console.error("[EventHandler] -", error);
      }
    }

    console.info("[INFO] - Events Loaded");
  } catch (err) {
    console.error("[EventHandler] -", err);
  }
}

loadEvents();
