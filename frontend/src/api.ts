/** Types and websocket calls of the homekit_manager backend. */

export interface HassEntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed?: string;
}

export interface HomeAssistant {
  language: string;
  locale?: { language: string };
  states: Record<string, HassEntityState>;
  themes?: { darkMode?: boolean };
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  formatEntityState?: (stateObj: HassEntityState, state?: string) => string;
}

export type BridgeStatus =
  | "running"
  | "starting"
  | "stopped"
  | "not_loaded"
  | "retry"
  | "error"
  | "disabled"
  | "unknown";

/** HomeKit options of an entity (``entity_config``); null removes a key. */
export interface EntityOptions {
  name?: string | null;
  type?: string | null;
  /** Write-only: the stored code is never sent to the browser. */
  code?: string | null;
  has_code?: boolean;
  feature_list?: string[] | null;
  low_battery_threshold?: number | null;
  [linkField: string]: unknown;
}

export interface Rule {
  enabled: boolean;
  labels: string[];
  areas: string[];
  floors: string[];
  domains: string[];
  exclude: string[];
  members: string[];
}

export interface LinkField {
  domains: string[];
  device_classes: string[];
  applies_to: string[] | null;
  requires_type: string | null;
}

export interface LinkCandidate {
  entity_id: string;
  name: string;
  domain: string;
  device_class: string | null;
  device_id: string | null;
}

export interface Bridge {
  entry_id: string;
  title: string;
  name: string;
  port: number | null;
  mode: "bridge" | "accessory";
  entity_id: string | null;
  yaml: boolean;
  manageable: boolean;
  status: BridgeStatus;
  paired: boolean | null;
  paired_clients: number;
  pin: string | null;
  entities: string[];
  accessory_entities: string[] | null;
  entity_config: Record<string, EntityOptions>;
  filter: Record<string, string[]> | null;
  missing: string[];
  unavailable: string[];
  rule: Rule | null;
  exclude_accessory_mode: boolean;
  disabled: boolean;
}

export interface EntityInfo {
  entity_id: string;
  device_id: string | null;
  labels: string[];
  floor_id: string | null;
  media_features: string[] | null;
  name: string;
  domain: string;
  device_class: string | null;
  icon: string | null;
  area_id: string | null;
  area: string | null;
  device: string | null;
  platform: string | null;
  entity_category: string | null;
  hidden: boolean;
  accessory_type: string | null;
  supported: boolean;
  needs_accessory_mode: boolean;
  bridges: string[];
}

export interface EntitiesResponse {
  entities: EntityInfo[];
  areas: Record<string, string>;
  area_floors: Record<string, string>;
  floors: Record<string, string>;
  labels: Record<string, { name: string; color: string | null; icon: string | null }>;
  link_fields: Record<string, LinkField>;
  link_candidates: LinkCandidate[];
  type_options: Record<string, string[]>;
  max_accessories: number;
}

export interface Pairing {
  available: boolean;
  paired: boolean | null;
  paired_clients?: number;
  pin?: string;
  setup_uri?: string;
  qr?: string | null;
}

const P = "homekit_manager/";

export const fetchBridges = (hass: HomeAssistant) =>
  hass.callWS<{ bridges: Bridge[] }>({ type: P + "bridges" }).then((r) => r.bridges);

export const fetchEntities = (hass: HomeAssistant) =>
  hass.callWS<EntitiesResponse>({ type: P + "entities" });

export const fetchPairing = (hass: HomeAssistant, entryId: string) =>
  hass.callWS<Pairing>({ type: P + "pairing", entry_id: entryId });

export const createBridge = (hass: HomeAssistant, name: string) =>
  hass
    .callWS<{ bridge: Bridge }>({ type: P + "bridge/create", name })
    .then((r) => r.bridge);

export const createAccessory = (
  hass: HomeAssistant,
  entityId: string,
  name: string,
  removeFromBridges: boolean,
) =>
  hass
    .callWS<{ bridge: Bridge }>({
      type: P + "accessory/create",
      entity_id: entityId,
      name,
      remove_from_bridges: removeFromBridges,
    })
    .then((r) => r.bridge);

export const updateBridgeSettings = (
  hass: HomeAssistant,
  entryId: string,
  settings: { name?: string; port?: number },
) =>
  hass
    .callWS<{ bridge: Bridge }>({ type: P + "bridge/settings", entry_id: entryId, ...settings })
    .then((r) => r.bridge);

export const assignEntities = (
  hass: HomeAssistant,
  entryId: string,
  entities: string[],
  entityConfig: Record<string, EntityOptions>,
) =>
  hass
    .callWS<{ bridge: Bridge }>({
      type: P + "bridge/assign",
      entry_id: entryId,
      entities,
      entity_config: entityConfig,
    })
    .then((r) => r.bridge);

export type RuleInput = Pick<Rule, "enabled" | "labels" | "areas" | "floors" | "domains">;

export const setRule = (
  hass: HomeAssistant,
  entryId: string,
  rule: RuleInput,
  resetExclusions = false,
) =>
  hass
    .callWS<{ bridge: Bridge }>({
      type: P + "rules/set",
      entry_id: entryId,
      reset_exclusions: resetExclusions,
      ...rule,
    })
    .then((r) => r.bridge);

export const previewRule = (hass: HomeAssistant, entryId: string, rule: Omit<RuleInput, "enabled">) =>
  hass
    .callWS<{ entities: string[] }>({ type: P + "rules/preview", entry_id: entryId, ...rule })
    .then((r) => r.entities);

export const setEntityOptions = (
  hass: HomeAssistant,
  entryId: string,
  entityId: string,
  options: EntityOptions,
) =>
  hass
    .callWS<{ bridge: Bridge }>({
      type: P + "entity/options",
      entry_id: entryId,
      entity_id: entityId,
      options,
    })
    .then((r) => r.bridge);

const simple = (command: string) => (hass: HomeAssistant, entryId: string) =>
  hass
    .callWS<{ bridge: Bridge | null }>({ type: P + command, entry_id: entryId })
    .then((r) => r.bridge);

export const adoptBridge = simple("bridge/adopt");
export const restartBridge = simple("bridge/restart");
export const unpairBridge = simple("bridge/unpair");
export const deleteBridge = simple("bridge/delete");
export const removeMissing = simple("bridge/remove_missing");

export const errorMessage = (err: unknown): string => {
  if (err && typeof err === "object") {
    const e = err as { message?: string; code?: string; error?: { message?: string } };
    return e.message || e.error?.message || e.code || String(err);
  }
  return String(err);
};

export const errorCode = (err: unknown): string | undefined =>
  err && typeof err === "object" ? (err as { code?: string }).code : undefined;
