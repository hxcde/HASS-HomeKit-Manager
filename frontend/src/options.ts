/** Helpers for per-entity HomeKit options (drafts, diffs, merges). */

import type { EntityOptions } from "./api";

const normalize = (value: unknown): string | null => {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) return value.length ? JSON.stringify([...value].sort()) : null;
  return String(value);
};

/** True if a patch actually changes the stored options. */
export const patchChanges = (base: EntityOptions | undefined, patch: EntityOptions | undefined) => {
  if (!patch) return false;
  return Object.keys(patch).some((key) => {
    if (key === "has_code") return false;
    if (key === "code") {
      if (patch.code === undefined) return false;
      return patch.code !== null || Boolean(base?.has_code);
    }
    return normalize(patch[key]) !== normalize(base?.[key]);
  });
};

/** Only the keys of a patch that change something. */
export const effectivePatch = (base: EntityOptions | undefined, patch: EntityOptions) => {
  const result: EntityOptions = {};
  for (const key of Object.keys(patch)) {
    if (patchChanges(base, { [key]: patch[key] })) result[key] = patch[key];
  }
  return result;
};

/** Options as they will be after applying a patch (null removes). */
export const mergeOptions = (base: EntityOptions | undefined, patch: EntityOptions | undefined) => {
  const result: EntityOptions = { ...(base ?? {}) };
  for (const [key, value] of Object.entries(patch ?? {})) {
    if (key === "code") {
      if (value === null) delete result.has_code;
      else if (value) result.has_code = true;
      continue;
    }
    if (value === null || value === undefined) delete result[key];
    else result[key] = value;
  }
  return result;
};

/** Combine two patches, the second one wins. */
export const combinePatches = (first: EntityOptions | undefined, second: EntityOptions) => ({
  ...(first ?? {}),
  ...second,
});
