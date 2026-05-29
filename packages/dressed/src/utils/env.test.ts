import { expect, test } from "bun:test";
import { env } from "node:process";
import { asyncLocalStorage, botEnv, config, getContext, tryGetContext } from "./env.ts";

test("Environment variables", () => {
  expect(() => botEnv.DISCORD_APP_ID).toThrow();

  env.DISCORD_APP_ID = "app_id";

  expect(botEnv.DISCORD_APP_ID).toBe("app_id");

  config.requests = { env: { DISCORD_APP_ID: "overriden_app_id" } };

  expect(botEnv.DISCORD_APP_ID).toBe("overriden_app_id");
});

test("Context storage", async () => {
  expect(tryGetContext()).toBeUndefined();
  expect(() => getContext()).toThrow("Context is not available");

  await asyncLocalStorage.run({ env: { DISCORD_APP_ID: "context_app_id" }, var: { foo: "bar" } }, () => {
    const ctx = getContext();
    expect(ctx).toBeDefined();
    expect(ctx.env.DISCORD_APP_ID).toBe("context_app_id");
    expect(ctx.var.foo).toBe("bar");
    expect(botEnv.DISCORD_APP_ID).toBe("context_app_id");
  });

  expect(tryGetContext()).toBeUndefined();
});
