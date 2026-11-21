/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aashraya from "../aashraya.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as cbt from "../cbt.js";
import type * as helpdesk from "../helpdesk.js";
import type * as platform from "../platform.js";
import type * as sahayi from "../sahayi.js";
import type * as samskara from "../samskara.js";
import type * as scholarx from "../scholarx.js";
import type * as setup from "../setup.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aashraya: typeof aashraya;
  ai: typeof ai;
  auth: typeof auth;
  cbt: typeof cbt;
  helpdesk: typeof helpdesk;
  platform: typeof platform;
  sahayi: typeof sahayi;
  samskara: typeof samskara;
  scholarx: typeof scholarx;
  setup: typeof setup;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionRefere���q�^