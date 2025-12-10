import { MongoClient } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Markup } from "telegraf";

function escapeMarkdownV2(text = "") {
  if (text === null || text === undefined) return "";
  let s = String(text).replace(/\\/g, "\\\\");
 
  s = s.replace(/([_\*\[\]\(\)~`>#+\-=|{}\.!])/g, "\\$1");
  return s;
}

async function safeReply(ctx, text, extraOptions = {}) {
  const escaped = escapeMarkdownV2(text);
  const opts = Object.assign({}, extraOptions, { parse_mode: "MarkdownV2" });
  try {
    return await ctx.replyWithMarkdownV2(escaped, opts);
  } catch (err) {
    // If Telegram still rejects the message, fall back to plain text reply (no parse mode)
    console.warn(
      "safeReply failed, falling back to plain text:",
      err?.message || err
    );
    try {
      // Best-effort plain reply (no Markdown parsing)
      return await ctx.reply(text, extraOptions);
    } catch (err2) {
      console.error("Fallback plain reply also failed:", err2);
      throw err2;
    }
  }
}

export default {
  type: "text",
  async execute(ctx) {
    const {
      id,
      username = "unknown",
      first_name: firstName = "unknown",
    } = ctx.from ?? {};
    const messageText = ctx.text ?? "";

    console.log(`msg from ${firstName} (@${username}): "${messageText}"`);

    if (ctx.chat?.type !== "private") {
      return safeReply(ctx, "_please start a private chat with me_ 🙏");
    }

    const mainMenuMarkup = Markup.keyboard([
      ["🌐 change language"],
      ["❓ help / faqs"],
    ]).resize();

    if (messageText.toLowerCase().startsWith("/start")) {
      const text = `👋 Hello *${firstName}*!\n\nI'm here to help with your *health queries* 🩺\n\nUse the buttons below to set your *language* 🌐 or view *help* ❓`;
      return safeReply(ctx, text, mainMenuMarkup);
    }

     if (messageText === "🌐 change language") {
      return ctx.reply(
        "please choose your preferred language:",
        Markup.keyboard([
          ["English", "हिन्दी"],
          ["বাংলা", "मराठी"],
          ["தமிழ்", "తెలుగు"],
          ["ગુજરાતી", "ಕನ್ನಡ"],
          ["ଓଡ଼ିଆ", "മലയാളം"],
          ["⬅️ back"],
        ]).resize()
      );
    }

    if (messageText === "❓ help / faqs") {
      const helpText = `ℹ️ *FAQs*\n\n1. *what can this bot do?*\n- answer preventive healthcare questions\n- give vaccination reminders\n- provide outbreak alerts\n\n2. *is this medical advice?*\n- NO. this is just educational, always consult a doctor.`;
      return safeReply(ctx, helpText, Markup.keyboard([["⬅️ back"]]).resize());
    }

    if (messageText === "⬅️ back") {
      return ctx.reply("back to main menu:", mainMenuMarkup);
    }

    if (messageText === "📝 update info") {
      return ctx.reply(
        "please type the info you'd like to update (example: age 20, location delhi). i'll save it in your memory.",
        Markup.keyboard([["⬅️ back"]]).resize()
      );
    }

    const vaccinesStructured = [
      { age: "birth", vaccines: ["BCG", "OPV-0", "HepB-1"] },
      { age: "6 weeks", vaccines: ["OPV-1", "Pentavalent-1", "Rotavirus-1"] },
      { age: "10 weeks", vaccines: ["OPV-2", "Pentavalent-2", "Rotavirus-2"] },
      { age: "14 weeks", vaccines: ["OPV-3", "Pentavalent-3", "Rotavirus-3"] },
      { age: "9 months", vaccines: ["MR-1", "JE-1"] },
      { age: "16-24 months", vaccines: ["MR-2", "JE-2", "OPV booster"] },
    ];

    const alertsStructured = [
      {
        disease: "dengue",
        region: "west bengal",
        status: "high cases reported",
      },
      { disease: "malaria", region: "odisha", status: "seasonal rise" },
    ];

    let extraStructuredData = null;


    if (/vaccine|vaccination|immunization/i.test(messageText)) {
      extraStructuredData = { vaccination_schedule: vaccinesStructured };

      
      let reply = "💉 *basic vaccination schedule*\n\n";
      vaccinesStructured.forEach((v) => {
        reply += `*${v.age}* → ${v.vaccines.join(", ")}\n`;
      });

      await safeReply(ctx, reply);
    }

    if (/outbreak|disease alert/i.test(messageText)) {
      extraStructuredData = { health_alerts: alertsStructured };

      let reply = "🚨 *current health alerts*\n\n";
      alertsStructured.forEach((a) => {
        reply += `*${a.disease.toUpperCase()}* in ${a.region} → ${a.status}\n`;
      });

      await safeReply(ctx, reply);
    }

   
    await ctx.sendChatAction("typing");

    let client;
    try {
      client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      const users = client.db("telegrambot").collection("users");
      let user = await users.findOne({ id });

      if (!user) {
        user = { id, username, firstName, memory: [], chatHistory: [] };
        await users.insertOne(user);
      }

      const memory = user.memory ?? [];
      const chatHistory = user.chatHistory ?? [];

      chatHistory.push({ role: "user", text: messageText, ts: Date.now() });
      if (chatHistory.length > 20) chatHistory.shift();

      const gemini = new GoogleGenerativeAI(process.env.GEMINI);
      const agent = gemini.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: [
          "you are the AI agent for swasthi.",
          "your ONLY job is to manage memory and craft a final prompt for swasthi.",
          "inputs you receive: saved memories, chat history, and the latest user query.",
          "output: STRICTLY in JSON matching the given format — no markdown, no free text.",
          "when user provides a language name, add it as their preferred language in memory.",
          "when user provides personal info (like age, gender, location), also save it in memory.",
          "do not roleplay swasthi, do not answer health queries yourself.",
        ].join("\n"),
      });

      const prompt = [
        "Here is the saved memory for the current user:",
        JSON.stringify(memory),
        "---",
        "Here is the chat history for the current user:",
        JSON.stringify(chatHistory),
        "---",
        "Here is the current message from the user:",
        messageText,
        `Please provide a response in the following JSON format:`,
        `{
  "memory_update": { "index": "index to update (if needed)", "content": "new content (if needed)" },
  "memory_add": { "content": "new memory (if needed)" },
  "final_prompt": "Here is the required memory: <...> \\\nHere is the chat history: <...> \\\nHere is the user query: <...>"
}`,
        "",
        `rules for output:\n- respond with EXACT JSON, no markdown, no code fences\n- \"final_prompt\" MUST contain only the required memory, chat history, and user query in the exact format below\n- DO NOT add explanations, roleplay, or commentary in final_prompt\n- if there is nothing to update/add, set memory_update and memory_add to null`,
      ].join("\n\n");

      const result = await agent.generateContent(prompt);
      const rawReply = result.response.text();
      //    console.log("raw agent reply:", rawReply);
      await ctx.sendChatAction("typing");

      let parsed = safeJsonParse(rawReply);
      if (!parsed)
        return safeReply(
          ctx,
          "sorry, i couldn't process that. please try again."
        );
      if (!parsed.final_prompt)
        return safeReply(
          ctx,
          "agent did not return a valid response, please try again."
        );

      // apply memory changes
      if (
        parsed.memory_update?.content &&
        parsed.memory_update.index !== null
      ) {
        memory[parsed.memory_update.index] = parsed.memory_update.content;
        console.log("memory updated at index", parsed.memory_update.index);
      }
      if (parsed.memory_add?.content) {
        memory.push(parsed.memory_add.content);
        console.log("memory added:", parsed.memory_add.content);
      }

      await users.updateOne({ id }, { $set: { memory, chatHistory } });

      // Enrich final_prompt with structured data (if present)
      if (extraStructuredData) {
        parsed.final_prompt += `\n\nHere is the structured data: ${JSON.stringify(
          extraStructuredData
        )}`;
      }

      // swasthi model
      const swasthi = gemini.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction:
          "you are swasthi, a straightforward, evidence-based health assistant." +
          " be compassionate but avoid jargon. always prioritize safety and accuracy. provide clear and empathetic responses to health-related queries. ask short follow-up questions if needed to give better answers. always use the user's preferred language if saved, otherwise default to english. if unsure, advise seeing a healthcare professional. no alternative medicines or ayurveda — explicitly state they don’t work. do not provide diagnoses or prescriptions, but you may recommend lifestyle and diet modifications. Make sure use to keep your responses short and concise and only expand only when the user asks for it",
      });

      const userResult = await swasthi.generateContent(
        [parsed.final_prompt, "your response:"].join("\n")
      );

      // Send Swasthi's reply to the user (escaped for MarkdownV2)
      await safeReply(ctx, userResult.response.text());
    } catch (err) {
      console.error(err);
      try {
        await ctx.reply("error fetching response, please try again.");
      } catch (e) {
        console.error("failed to send error message to user:", e);
      }
    } finally {
      if (client) await client.close();
    }
  },
};

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    let cleaned = str.replace(/\n/g, " ").replace(/\\(?!["\\/bfnrtu])/g, "");
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      console.error("still invalid JSON:", e2, "raw:", str);
      return null;
    }
  }
}
