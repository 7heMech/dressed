import { AsyncLocalStorage } from "node:async_hooks";
import { env } from "node:process";
import type { DressedConfig } from "../types/config.ts";
import { loadEnvConfig } from "./dotenv.ts";

interface BotEnvs {
	DISCORD_APP_ID: string;
	DISCORD_PUBLIC_KEY: string;
	DISCORD_TOKEN: string;
}

/**
 * @module
 * Context Storage for Dressed.
 */

export interface Env {
	Variables?: Record<string, any>;
	Bindings?: Record<string, any>;
}

/**
 * The context of the current request.
 * Matches Hono's Context where possible.
 */
export interface Context<E extends Env = Env> {
	env: E["Bindings"];
	var: E["Variables"];
}

export const asyncLocalStorage = new AsyncLocalStorage<Context<any>>();

/**
 * Get the context of the current request.
 * @returns The context or undefined if not available.
 */
export const tryGetContext = <E extends Env = Env>(): Context<E> | undefined => {
	return asyncLocalStorage.getStore() as Context<E> | undefined;
};

/**
 * Get the context of the current request.
 * @returns The context.
 * @throws Error if context is not available.
 */
export const getContext = <E extends Env = Env>(): Context<E> => {
	const context = tryGetContext<E>();
	if (!context) {
		throw new Error("Context is not available");
	}
	return context;
};

loadEnvConfig();

/** The global configuration for various Dressed services. */
export const config: DressedConfig = {};

/** The loaded env vars pertaining to bots, overriden by {@link config}. */
export const botEnv: BotEnvs = new Proxy({} as BotEnvs, {
	get(_, key: keyof BotEnvs) {
		const value =
			(tryGetContext()?.env?.[key] as string | undefined) ?? config.requests?.env?.[key] ?? env[key];
		if (!value) throw new Error(`Missing ${key}: please set it in your environment variables.`);
		return value;
	},
});
