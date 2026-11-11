import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import {
  mdiAlertCircleOutline,
  mdiAlertOutline,
  mdiAutoFix,
  mdiCheck,
  mdiCheckCircle,
  mdiChevronDown,
  mdiClose,
  mdiCog,
  mdiContentCopy,
  mdiDeleteOutline,
  mdiHomeAutomation,
  mdiInformationOutline,
  mdiLinkVariantOff,
  mdiMagnify,
  mdiPlus,
  mdiQrcodeScan,
  mdiRefresh,
  mdiRestart,
  mdiShieldCheckOutline,
  mdiTelevision,
  mdiThermostatAuto,
  mdiTuneVariant,
} from "@mdi/js";
import {
  adoptBridge,
  assignEntities,
  createAccessory,
  createBridge,
  deleteBridge,
  errorMessage,
  fetchBridges,
  fetchEntities,
  fetchPairing,
  restartBridge,
  setEntityOptions,
  setRule,
  unpairBridge,
  updateBridgeSettings,
  type Bridge,
  type EntitiesResponse,
  type EntityInfo,
  type EntityOptions,
  type HassEntityState,
  type HomeAssistant,
  type Pairing,
  type RuleInput,
} from "./api";
import "./dialogs";
import "./entity-dialog";
import "./rules-dialog";
import { combinePatches, effectivePatch, mergeOptions, patchChanges } from "./options";
import { getTranslator, isGerman, type Translate } from "./i18n";
import {
  CATEGORIES,
  accessoryTypeLabel,
  categoryOf,
  domainIcon,
  typeFromOption,
} from "./meta";
import { controls, icon, tokens } from "./styles";

type View = "all" | "assigned" | "unassigned";
type GroupBy = "area" | "domain" | "none";

type DialogState =
  | { kind: "entity"; entityId: string; accessoryId?: string }
  | { kind: "rules" }
  | { kind: "new" }
  | { kind: "create" }
  | { kind: "add-accessory"; entityId?: string }
  | { kind: "settings"; entryId: string }
  | {
      kind: "confirm";
      heading: string;
      text: string;
      confirmLabel: string;
      danger?: boolean;
      action: () => void | Promise<void>;
      /** Second choice instead of "cancel". */
      altLabel?: string;
      alt?: () => void;
    };

interface Group {
  key: string;
  label: string;
  icon?: string;
  entities: EntityInfo[];
}

const POLL_INTERVAL = 5000;
const ACCESSORIES_TAB = "__accessories__";
const STORAGE_PREFIX = "homekit_manager.";

const storage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(STORAGE_PREFIX + key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch {
      /* storage unavailable */
    }
  },
};


class HomeKitManagerPanel extends LitElement {
  static properties = {
    narrow: { type: Boolean, reflect: true },
    panel: { attribute: false },
    _bridges: { state: true },
    _instances: { state: true },
    _accessories: { state: true },
    _selected: { state: true },
    _entities: { state: true },
    _pairing: { state: true },
    _draft: { state: true },
    _draftConfig: { state: true },
    _search: { state: true },
    _view: { state: true },
    _groupBy: { state: true },
    _categories: { state: true },
    _showHidden: { state: true },
    _showUnsupported: { state: true },
    _showFilters: { state: true },
    _collapsed: { state: true },
    _busy: { state: true },
    _dialog: { state: true },
    _loadError: { state: true },
  };

  declare narrow: boolean;
  declare panel: unknown;
  declare _bridges: Bridge[] | null;
  declare _instances: Bridge[];
  declare _accessories: Bridge[];
  declare _selected: string | null;
  declare _entities: EntitiesResponse | null;
  declare _pairing: Record<string, Pairing>;
  declare _draft: Set<string>;
  declare _draftConfig: Record<string, EntityOptions>;
  declare _search: string;
  declare _view: View;
  declare _groupBy: GroupBy;
  declare _categories: Set<string>;
  declare _showHidden: boolean;
  declare _showUnsupported: boolean;
  declare _showFilters: boolean;
  declare _collapsed: Set<string>;
  declare _busy: string | null;
  declare _dialog: DialogState | null;
  declare _loadError: string | null;

  private _hass?: HomeAssistant;
  private _nextDialog: DialogState | null = null;
  private _hassTimer?: number;
  private _pollTimer?: number;
  private _t: Translate = getTranslator("en");
  private _german = false;
  private _loaded = false;

  constructor() {
    super();
    this._bridges = null;
    this._instances = [];
    this._accessories = [];
    this._selected = storage.get("selected");
    this._entities = null;
    this._pairing = {};
    this._draft = new Set();
    this._draftConfig = {};
    this._search = "";
    this._view = "all";
    this._groupBy = (storage.get("group_by") as GroupBy) || "area";
    this._categories = new Set();
    this._showHidden = false;
    this._showUnsupported = false;
    this._showFilters = false;
    this._collapsed = new Set();
    this._busy = null;
    this._dialog = null;
    this._loadError = null;
  }

  // Home Assistant pushes a new hass object on every state change. Only the
  // first one (and language changes) render immediately, the rest is throttled.
  get hass(): HomeAssistant {
    return this._hass!;
  }

  set hass(value: HomeAssistant) {
    const old = this._hass;
    this._hass = value;
    const language = value.locale?.language || value.language;
    if (!old || (old.locale?.language || old.language) !== language) {
      this._t = getTranslator(language);
      this._german = isGerman(language);
      this.requestUpdate("hass", old);
      if (!old && this.isConnected) this._start();
      return;
    }
    if (this._hassTimer === undefined) {
      this._hassTimer = window.setTimeout(() => {
        this._hassTimer = undefined;
        this.requestUpdate("hass");
      }, 1000);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._hass) this._start();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearInterval(this._pollTimer);
    window.clearTimeout(this._hassTimer);
    this._pollTimer = undefined;
    this._hassTimer = undefined;
  }

  private _start() {
    if (!this._loaded) {
      this._loaded = true;
      this._loadAll();
    }
    if (this._pollTimer === undefined) {
      this._pollTimer = window.setInterval(() => this._poll(), POLL_INTERVAL);
    }
  }

  // ------------------------------------------------------------------ data

  private get _bridge(): Bridge | undefined {
    return this._bridges?.find((b) => b.entry_id === this._selected);
  }

  private _instance(entryId: string): Bridge | undefined {
    return this._instances.find((b) => b.entry_id === entryId);
  }

  private _setInstances(all: Bridge[]) {
    this._instances = all;
    this._bridges = all.filter((b) => b.mode === "bridge");
    this._accessories = all.filter((b) => b.mode === "accessory");
    const valid =
      this._selected === ACCESSORIES_TAB || this._bridges.some((b) => b.entry_id === this._selected);
    if (!valid) {
      this._selected =
        this._bridges[0]?.entry_id ?? (this._accessories.length ? ACCESSORIES_TAB : null);
    }
  }

  /** HomeKit instances whose pairing info is currently on screen. */
  private _visibleInstances(): Bridge[] {
    if (this._selected === ACCESSORIES_TAB) return this._accessories;
    const bridge = this._bridge;
    return bridge ? [bridge] : [];
  }

  private async _loadAll() {
    try {
      const [bridges, entities] = await Promise.all([
        fetchBridges(this.hass),
        fetchEntities(this.hass),
      ]);
      this._entities = entities;
      this._setInstances(bridges);
      this._resetDraft();
      this._loadError = null;
      this._loadPairing();
    } catch (err) {
      this._loadError = errorMessage(err);
    }
  }

  private async _reloadEntities() {
    try {
      this._entities = await fetchEntities(this.hass);
    } catch (err) {
      this._toast(this._t("error", { message: errorMessage(err) }));
    }
  }

  private async _poll() {
    if (!this._hass || this._busy || document.hidden) return;
    try {
      const previous = new Map(this._instances.map((b) => [b.entry_id, b]));
      const before = this._bridge;
      const wasDirty = this._isDirty;
      this._setInstances(await fetchBridges(this.hass));
      const after = this._bridge;
      if (
        after &&
        !wasDirty &&
        (!before || before.entities.join() !== after.entities.join() || before.entry_id !== after.entry_id)
      ) {
        this._resetDraft();
      }
      for (const inst of this._visibleInstances()) {
        const old = previous.get(inst.entry_id);
        const pairing = this._pairing[inst.entry_id];
        if (
          !old ||
          old.status !== inst.status ||
          old.paired !== inst.paired ||
          !pairing?.available ||
          (inst.pin && pairing.pin !== inst.pin)
        ) {
          this._loadPairingFor(inst.entry_id);
        }
      }
    } catch {
      /* transient websocket errors are ignored while polling */
    }
  }

  private _loadPairing() {
    for (const inst of this._visibleInstances()) this._loadPairingFor(inst.entry_id);
  }

  private async _loadPairingFor(entryId: string) {
    try {
      const pairing = await fetchPairing(this.hass, entryId);
      this._pairing = { ...this._pairing, [entryId]: pairing };
    } catch {
      /* pairing info is optional */
    }
  }

  private _resetDraft() {
    const bridge = this._bridge;
    this._draft = new Set(bridge?.entities ?? []);
    this._draftConfig = {};
  }

  private _replaceBridge(updated: Bridge) {
    this._setInstances(
      this._instances.map((b) => (b.entry_id === updated.entry_id ? updated : b)),
    );
  }

  private _options(entityId: string): EntityOptions {
    return mergeOptions(this._bridge?.entity_config[entityId], this._draftConfig[entityId]);
  }

  private get _changes() {
    const bridge = this._bridge;
    if (!bridge) return { added: [], removed: [], config: [] as string[] };
    const current = new Set(bridge.entities);
    const added = [...this._draft].filter((id) => !current.has(id));
    const removed = bridge.entities.filter((id) => !this._draft.has(id));
    const config = Object.keys(this._draftConfig).filter((id) =>
      patchChanges(bridge.entity_config[id], this._draftConfig[id]),
    );
    return { added, removed, config };
  }

  private get _isDirty() {
    const { added, removed, config } = this._changes;
    return added.length + removed.length + config.length > 0;
  }

  private _toast(message: string) {
    this.dispatchEvent(
      new CustomEvent("hass-notification", {
        detail: { message },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private async _run<T>(message: string, job: () => Promise<T>, success?: string) {
    this._busy = message;
    try {
      const result = await job();
      if (success) this._toast(success);
      return result;
    } catch (err) {
      this._toast(this._t("error", { message: errorMessage(err) }));
      return undefined;
    } finally {
      this._busy = null;
    }
  }

  // --------------------------------------------------------------- actions

  private _toggle(entityId: string, force?: boolean) {
    if (this._busy) return;
    const draft = new Set(this._draft);
    const on = force ?? !draft.has(entityId);
    if (on) draft.add(entityId);
    else draft.delete(entityId);
    this._draft = draft;
  }

  /** Row switch: suggests the regulating entity for e.g. Better Thermostat TRVs. */
  private _onSwitch(e: EntityInfo) {
    const controller = this._draft.has(e.entity_id) ? undefined : this._controllerOf(e);
    if (!controller) {
      this._toggle(e.entity_id);
      return;
    }
    const t = this._t;
    const vars = {
      name: e.name,
      controller: controller.name,
      integration: this._controllerTitle(controller.entity_id),
    };
    if (this._draft.has(controller.entity_id)) {
      this._confirm(
        t("controlled_duplicate_title", vars),
        t("controlled_duplicate_text", vars),
        t("controlled_duplicate_confirm"),
        () => this._toggle(e.entity_id, true),
      );
      return;
    }
    this._dialog = {
      kind: "confirm",
      heading: t("controlled_title", vars),
      text: t("controlled_text", vars),
      confirmLabel: t("controlled_use", vars),
      action: () => this._toggle(controller.entity_id, true),
      altLabel: t("controlled_original"),
      alt: () => this._toggle(e.entity_id, true),
    };
  }

  private _toggleGroup(entities: EntityInfo[], on: boolean) {
    const draft = new Set(this._draft);
    let replaced = 0;
    let integration = "";
    for (const e of entities) {
      const controller = this._controllerOf(e);
      if (on && e.supported) {
        // Regulated thermostats join through their regulating entity
        if (controller && !draft.has(e.entity_id)) {
          if (!draft.has(controller.entity_id)) {
            draft.add(controller.entity_id);
            replaced++;
            integration = this._controllerTitle(controller.entity_id);
          }
        } else {
          draft.add(e.entity_id);
        }
      } else if (!on) {
        draft.delete(e.entity_id);
        if (controller) draft.delete(controller.entity_id);
      }
    }
    this._draft = draft;
    if (replaced) this._toast(this._t("controlled_replaced", { count: replaced, integration }));
  }

  private _replaceControlled(entities: EntityInfo[]) {
    const draft = new Set(this._draft);
    for (const e of entities) {
      const controller = this._controllerOf(e);
      if (!controller) continue;
      draft.delete(e.entity_id);
      draft.add(controller.entity_id);
    }
    this._draft = draft;
  }

  private _byId?: { source: EntitiesResponse; map: Map<string, EntityInfo> };

  private _entity(entityId: string): EntityInfo | undefined {
    const data = this._entities;
    if (!data) return undefined;
    if (this._byId?.source !== data) {
      this._byId = { source: data, map: new Map(data.entities.map((e) => [e.entity_id, e])) };
    }
    return this._byId.map.get(entityId);
  }

  /** The entity regulating ``e`` (Better Thermostat …), if HomeKit supports it. */
  private _controllerOf(e: EntityInfo): EntityInfo | undefined {
    if (!e.controlled_by) return undefined;
    const controller = this._entity(e.controlled_by);
    return controller?.supported ? controller : undefined;
  }

  private _controllerTitle(entityId: string): string {
    return this._entities?.controllers?.[entityId]?.title ?? entityId;
  }

  /** Assigned directly or through its regulating entity. */
  private _isCovered(e: EntityInfo): boolean {
    if (this._draft.has(e.entity_id)) return true;
    return Boolean(e.controlled_by && this._draft.has(e.controlled_by) && this._controllerOf(e));
  }

  private async _apply() {
    const bridge = this._bridge;
    if (!bridge) return;
    const { config } = this._changes;
    const patch: Record<string, EntityOptions> = {};
    for (const id of config) {
      patch[id] = effectivePatch(bridge.entity_config[id], this._draftConfig[id]);
    }
    const updated = await this._run(
      this._t("applying"),
      () => assignEntities(this.hass, bridge.entry_id, [...this._draft].sort(), patch),
      this._t("applied"),
    );
    if (updated) {
      this._replaceBridge(updated);
      this._resetDraft();
      this._reloadEntities();
      this._loadPairing();
    }
  }

  private _select(target: string) {
    if (target === this._selected) return;
    const go = () => {
      this._selected = target;
      storage.set("selected", target);
      this._resetDraft();
      this._loadPairing();
    };
    if (this._isDirty) {
      this._confirm(this._t("confirm_discard_title"), this._t("confirm_discard_text"), this._t("discard"), go, true);
    } else {
      go();
    }
  }

  private _confirm(
    heading: string,
    text: string,
    confirmLabel: string,
    action: () => void | Promise<void>,
    danger = false,
  ) {
    this._dialog = { kind: "confirm", heading, text, confirmLabel, danger, action };
  }

  private async _create(name: string) {
    const bridge = await this._run(
      this._t("creating"),
      () => createBridge(this.hass, name),
      this._t("created", { name }),
    );
    if (bridge) {
      this._setInstances([...this._instances, bridge]);
      this._selected = bridge.entry_id;
      storage.set("selected", bridge.entry_id);
      this._resetDraft();
      this._reloadEntities();
      this._loadPairing();
    }
  }

  private async _createAccessory(entityId: string, name: string, removeFromBridges: boolean) {
    const accessory = await this._run(
      this._t("creating_accessory"),
      () => createAccessory(this.hass, entityId, name, removeFromBridges),
      this._t("created_accessory", { name }),
    );
    if (accessory) {
      // The entity may have left a bridge: refresh everything
      this._setInstances(await fetchBridges(this.hass).catch(() => [...this._instances, accessory]));
      this._selected = ACCESSORIES_TAB;
      storage.set("selected", ACCESSORIES_TAB);
      this._resetDraft();
      this._reloadEntities();
      this._loadPairing();
    }
  }

  private async _saveSettings(entryId: string, name: string, port: number | undefined) {
    const updated = await this._run(
      this._t("saving"),
      () => updateBridgeSettings(this.hass, entryId, { name, port }),
      this._t("saved"),
    );
    if (updated) {
      this._replaceBridge(updated);
      this._loadPairingFor(entryId);
    }
  }

  private async _saveAccessoryOptions(entryId: string, entityId: string, patch: EntityOptions) {
    const updated = await this._run(
      this._t("saving"),
      () => setEntityOptions(this.hass, entryId, entityId, patch),
      this._t("saved"),
    );
    if (updated) {
      this._replaceBridge(updated);
      this._loadPairingFor(entryId);
    }
  }

  private async _saveRule(rule: RuleInput, reset: boolean) {
    const bridge = this._bridge;
    if (!bridge) return;
    const updated = await this._run(
      this._t("applying"),
      () => setRule(this.hass, bridge.entry_id, rule, reset),
      this._t(rule.enabled ? "rules_saved" : "rules_disabled"),
    );
    if (updated) {
      this._replaceBridge(updated);
      this._resetDraft();
      this._reloadEntities();
      this._loadPairing();
    }
  }

  /** Drop deleted entities from the draft (applied with the apply bar). */
  private _removeMissingFromDraft(ids: string[]) {
    const draft = new Set(this._draft);
    for (const id of ids) draft.delete(id);
    this._draft = draft;
  }

  private _askDelete(entryId: string) {
    const inst = this._instance(entryId);
    if (!inst) return;
    const accessory = inst.mode === "accessory";
    this._confirm(
      this._t("confirm_delete_title", { name: inst.name }),
      this._t(accessory ? "confirm_delete_accessory_text" : "confirm_delete_text"),
      this._t("action_delete"),
      async () => {
        const ok = await this._run(
          this._t("loading"),
          () => deleteBridge(this.hass, entryId).then(() => true),
          this._t("deleted"),
        );
        if (ok) {
          this._setInstances(this._instances.filter((b) => b.entry_id !== entryId));
          this._resetDraft();
          this._loadPairing();
          this._reloadEntities();
        }
      },
      true,
    );
  }

  private _askUnpair(entryId: string) {
    this._confirm(
      this._t("confirm_unpair_title"),
      this._t("confirm_unpair_text"),
      this._t("action_unpair"),
      async () => {
        const updated = await this._run(
          this._t("loading"),
          () => unpairBridge(this.hass, entryId),
          this._t("unpaired"),
        );
        if (updated) this._replaceBridge(updated);
        this._loadPairingFor(entryId);
      },
      true,
    );
  }

  private async _restart(entryId: string) {
    const updated = await this._run(
      this._t("status_starting"),
      () => restartBridge(this.hass, entryId),
      this._t("restarted"),
    );
    if (updated) this._replaceBridge(updated);
    this._loadPairingFor(entryId);
  }

  private _askAdopt() {
    const bridge = this._bridge!;
    const count = bridge.accessory_entities?.length ?? this._implicitCount(bridge);
    this._confirm(
      this._t("confirm_adopt_title", { name: bridge.name }),
      this._t("confirm_adopt_text", { count }),
      this._t("adopt"),
      async () => {
        const updated = await this._run(
          this._t("loading"),
          () => adoptBridge(this.hass, bridge.entry_id),
          this._t("adopted"),
        );
        if (updated) {
          this._replaceBridge(updated);
          this._resetDraft();
          this._reloadEntities();
        }
      },
    );
  }

  private _implicitCount(bridge: Bridge) {
    return this._entities?.entities.filter((e) => e.bridges.includes(bridge.entry_id)).length ?? 0;
  }

  private async _copyPin(pin: string) {
    try {
      await navigator.clipboard.writeText(pin.replace(/-/g, ""));
      this._toast(this._t("copied"));
    } catch {
      /* clipboard not available (insecure context) */
    }
  }

  /** Accessory-mode instance that exposes the entity, if any. */
  private _accessoryFor(entityId: string): Bridge | undefined {
    return this._accessories.find((a) => a.entity_id === entityId);
  }

  // -------------------------------------------------------------- filtering

  private _baseEntities(): EntityInfo[] {
    const bridge = this._bridge;
    if (!this._entities || !bridge) return [];
    const current = new Set(bridge.entities);
    return this._entities.entities.filter((e) => {
      if (this._draft.has(e.entity_id) || current.has(e.entity_id)) return true;
      if (!this._showUnsupported && !e.supported) return false;
      if (!this._showHidden && (e.hidden || e.entity_category)) return false;
      return true;
    });
  }

  private _matchesSearch(e: EntityInfo, terms: string[]) {
    if (!terms.length) return true;
    const custom = this._options(e.entity_id).name ?? "";
    const haystack = `${e.name} ${e.entity_id} ${e.area ?? ""} ${e.device ?? ""} ${custom}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }

  private _filtered(base: EntityInfo[]): EntityInfo[] {
    const terms = this._search.toLowerCase().split(/\s+/).filter(Boolean);
    return base.filter((e) => {
      const on = this._draft.has(e.entity_id);
      if (this._view === "assigned" && !on) return false;
      if (this._view === "unassigned" && on) return false;
      if (this._categories.size && !this._categories.has(categoryOf(e.domain).id)) return false;
      return this._matchesSearch(e, terms);
    });
  }

  private _groups(entities: EntityInfo[]): Group[] {
    const t = this._t;
    if (this._groupBy === "none") {
      return [{ key: "all", label: t("view_all"), entities }];
    }
    const map = new Map<string, Group>();
    for (const e of entities) {
      let key: string;
      let label: string;
      let groupIcon: string | undefined;
      if (this._groupBy === "area") {
        key = e.area_id ?? "";
        label = e.area ?? t("no_area");
      } else {
        const cat = categoryOf(e.domain);
        key = cat.id;
        label = t(cat.label);
        groupIcon = cat.icon;
      }
      let group = map.get(key);
      if (!group) {
        group = { key, label, icon: groupIcon, entities: [] };
        map.set(key, group);
      }
      group.entities.push(e);
    }
    const groups = [...map.values()];
    if (this._groupBy === "area") {
      groups.sort((a, b) => {
        if (!a.key) return 1;
        if (!b.key) return -1;
        return a.label.localeCompare(b.label);
      });
    } else {
      const order = [...CATEGORIES.map((c) => c.id), "other"];
      groups.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    }
    return groups;
  }

  // ---------------------------------------------------------------- render

  protected willUpdate(changed: PropertyValues) {
    if (changed.has("_groupBy")) storage.set("group_by", this._groupBy);
  }

  render() {
    const t = this._t;
    return html`
      <div class="toolbar">
        <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
        <div class="toolbar-title">${t("title")}</div>
        <button
          class="icon-btn"
          title=${t("refresh")}
          aria-label=${t("refresh")}
          @click=${() => this._loadAll()}
        >
          ${icon(mdiRefresh)}
        </button>
      </div>
      <div class="scroller">
        <div class="content">${this._renderBody()}</div>
      </div>
      ${this._renderDialog()}
    `;
  }

  private _renderBody(): TemplateResult {
    const t = this._t;
    if (this._loadError) {
      return html`<div class="card message error-card">
        ${icon(mdiAlertCircleOutline)}
        <div>${t("error", { message: this._loadError })}</div>
        <button class="btn tonal" @click=${() => this._loadAll()}>${t("refresh")}</button>
      </div>`;
    }
    if (!this._bridges || !this._entities) {
      return html`<div class="loading"><div class="spinner"></div>${t("loading")}</div>`;
    }
    if (!this._bridges.length && !this._accessories.length && this._selected !== ACCESSORIES_TAB) {
      return this._renderEmpty();
    }
    if (this._selected === ACCESSORIES_TAB || !this._bridge) {
      return html`${this._renderTabs()} ${this._renderAccessories()}`;
    }
    const bridge = this._bridge;
    return html`
      ${this._renderTabs()} ${this._renderHero(bridge)}
      ${bridge.yaml
        ? this._renderNotice(mdiInformationOutline, t("yaml_title"), t("yaml_text"))
        : !bridge.manageable
          ? this._renderUnmanaged(bridge)
          : this._renderEntities(bridge)}
    `;
  }

  private _renderEmpty() {
    const t = this._t;
    return html`
      <div class="empty card">
        <div class="empty-art">
          <div class="empty-ring"></div>
          <div class="bridge-tile large">${icon(mdiHomeAutomation)}</div>
        </div>
        <h2>${t("empty_title")}</h2>
        <p>${t("empty_text")}</p>
        <div class="empty-actions">
          <button
            class="btn filled"
            ?disabled=${Boolean(this._busy)}
            @click=${() => (this._dialog = { kind: "create" })}
          >
            ${this._busy ? html`<span class="spinner small"></span>` : icon(mdiPlus)}
            ${this._busy ?? t("empty_action")}
          </button>
          <button
            class="btn outlined"
            ?disabled=${Boolean(this._busy)}
            @click=${() => (this._dialog = { kind: "add-accessory" })}
          >
            ${icon(mdiTelevision)} ${t("empty_action_accessory")}
          </button>
        </div>
        <p class="empty-hint">${t("empty_hint_accessory")}</p>
      </div>
    `;
  }

  private _statusInfo(bridge: Bridge): { cls: string; label: string } {
    const t = this._t;
    switch (bridge.status) {
      case "running":
        return bridge.paired
          ? { cls: "ok", label: t("status_running_paired") }
          : { cls: "ready", label: t("status_running_unpaired") };
      case "starting":
      case "retry":
        return { cls: "busy", label: t(bridge.status === "retry" ? "status_retry" : "status_starting") };
      case "disabled":
      case "not_loaded":
      case "stopped":
        return { cls: "off", label: t(`status_${bridge.status}`) };
      case "error":
        return { cls: "bad", label: t("status_error") };
      default:
        return { cls: "off", label: t("status_unknown") };
    }
  }

  private _renderTabs() {
    const t = this._t;
    return html`
      <nav class="tabs" aria-label="Bridges">
        ${this._bridges!.map((b) => {
          const status = this._statusInfo(b);
          return html`<button
            class="tab"
            aria-selected=${String(b.entry_id === this._selected)}
            @click=${() => this._select(b.entry_id)}
            title=${status.label}
          >
            <span class="dot ${status.cls}"></span>
            <span class="tab-name">${b.name}</span>
            ${b.manageable ? html`<span class="tab-count">${b.entities.length}</span>` : nothing}
          </button>`;
        })}
        <span class="tab-sep" aria-hidden="true"></span>
        <button
          class="tab"
          aria-selected=${String(this._selected === ACCESSORIES_TAB)}
          @click=${() => this._select(ACCESSORIES_TAB)}
          title=${t("accessories_hint")}
        >
          ${icon(mdiTelevision)}
          <span class="tab-name">${t("accessories_tab")}</span>
          <span class="tab-count">${this._accessories.length}</span>
        </button>
        <button
          class="tab add"
          ?disabled=${Boolean(this._busy)}
          @click=${() => (this._dialog = { kind: "new" })}
        >
          ${icon(mdiPlus)} ${t("new_instance")}
        </button>
      </nav>
    `;
  }

  private _renderHero(bridge: Bridge) {
    const t = this._t;
    const status = this._statusInfo(bridge);
    const max = this._entities!.max_accessories;
    const count = bridge.manageable ? this._draft.size : bridge.accessory_entities?.length ?? 0;
    const pct = Math.min(100, Math.round((count / max) * 100));
    const busy = Boolean(this._busy);
    return html`
      <section class="card hero">
        <div class="hero-main">
          <div class="hero-head">
            <div class="bridge-tile">${icon(mdiHomeAutomation)}</div>
            <div class="hero-titles">
              <h1>${bridge.name}</h1>
              <div class="hero-meta">
                <span class="status ${status.cls}"><span class="dot ${status.cls}"></span>${status.label}</span>
                ${bridge.port ? html`<span>${t("port", { port: bridge.port })}</span>` : nothing}
                ${bridge.accessory_entities
                  ? html`<span>${t("accessories_active", { count: bridge.accessory_entities.length })}</span>`
                  : nothing}
              </div>
            </div>
          </div>

          <div class="capacity">
            <div class="capacity-label">
              <span>${t("capacity", { count, max })}</span><span>${pct}%</span>
            </div>
            <div class="meter ${count > max ? "over" : ""}"><div style="width:${pct}%"></div></div>
          </div>

          <div class="hero-actions">
            ${bridge.manageable && !bridge.yaml
              ? html`<button
                  class="btn small ${bridge.rule?.enabled ? "tonal" : "outlined"}"
                  ?disabled=${busy || this._isDirty}
                  title=${this._isDirty ? t("rules_dirty") : t("rules_title")}
                  @click=${() => (this._dialog = { kind: "rules" })}
                >
                  ${icon(mdiAutoFix)} ${t("rules_button")}
                  ${bridge.rule?.enabled ? html`<span class="pill">${t("rules_active")}</span>` : nothing}
                </button>`
              : nothing}
            ${bridge.yaml
              ? nothing
              : html`<button class="btn outlined small" ?disabled=${busy} @click=${() => (this._dialog = { kind: "settings", entryId: bridge.entry_id })}>
                  ${icon(mdiCog)} ${t("action_settings")}
                </button>`}
            <button class="btn outlined small" ?disabled=${busy} @click=${() => this._restart(bridge.entry_id)}>
              ${icon(mdiRestart)} ${t("action_restart")}
            </button>
            ${bridge.paired
              ? html`<button class="btn outlined small" ?disabled=${busy} @click=${() => this._askUnpair(bridge.entry_id)}>
                  ${icon(mdiLinkVariantOff)} ${t("action_unpair")}
                </button>`
              : nothing}
            ${bridge.yaml
              ? nothing
              : html`<button class="btn small danger" ?disabled=${busy} @click=${() => this._askDelete(bridge.entry_id)}>
                  ${icon(mdiDeleteOutline)} ${t("action_delete")}
                </button>`}
          </div>
        </div>
        ${this._renderPairing(bridge)}
      </section>
    `;
  }

  private _renderPairing(bridge: Bridge) {
    const t = this._t;
    const pairing = this._pairing[bridge.entry_id];
    if (bridge.paired) {
      return html`<div class="pairing paired">
        <div class="paired-icon">${icon(mdiShieldCheckOutline)}</div>
        <div class="pairing-title">${t("paired_title")}</div>
        <p>${t("paired_text", { count: bridge.paired_clients || 1 })}</p>
      </div>`;
    }
    if (!pairing?.available || !pairing.pin) {
      return html`<div class="pairing pending">
        <div class="spinner"></div>
        <p>${t("pairing_unavailable")}</p>
      </div>`;
    }
    return html`<div class="pairing">
      <div class="pairing-title">${icon(mdiQrcodeScan)} ${t("pair_title")}</div>
      <div class="pairing-body">
        ${pairing.qr ? html`<img class="qr" src=${pairing.qr} alt="HomeKit QR" />` : nothing}
        <div class="code-box">
          <div class="code-label">${t("setup_code")}</div>
          <button class="code" title=${t("copy")} @click=${() => this._copyPin(pairing.pin!)}>
            <span>${pairing.pin}</span>${icon(mdiContentCopy)}
          </button>
          <p>${t("pair_steps")}</p>
        </div>
      </div>
    </div>`;
  }

  private _renderNotice(path: string, title: string, text: string, action?: TemplateResult) {
    return html`<section class="card notice">
      <div class="notice-icon">${icon(path)}</div>
      <div class="notice-body">
        <h3>${title}</h3>
        <p>${text}</p>
        ${action ?? nothing}
      </div>
    </section>`;
  }

  private _renderAccessories() {
    const t = this._t;
    const busy = Boolean(this._busy);
    return html`
      <section class="card notice accessories-intro">
        <div class="notice-icon">${icon(mdiTelevision)}</div>
        <div class="notice-body">
          <h3>${t("accessories_title")}</h3>
          <p>${t("accessories_text")}</p>
          <button
            class="btn filled"
            ?disabled=${busy}
            @click=${() => (this._dialog = { kind: "add-accessory" })}
          >
            ${busy ? html`<span class="spinner small"></span>` : icon(mdiPlus)}
            ${this._busy ?? t("add_accessory")}
          </button>
        </div>
      </section>
      ${this._accessories.length
        ? html`<div class="acc-grid">${this._accessories.map((a) => this._renderAccessoryCard(a))}</div>`
        : html`<div class="card message">${icon(mdiTelevision)}<div>${t("accessories_empty")}</div></div>`}
    `;
  }

  private _renderAccessoryCard(acc: Bridge) {
    const t = this._t;
    const busy = Boolean(this._busy);
    const status = this._statusInfo(acc);
    const entity = this._entities?.entities.find((e) => e.entity_id === acc.entity_id);
    const stateObj = acc.entity_id ? this.hass.states[acc.entity_id] : undefined;
    const typeLabel = entity
      ? accessoryTypeLabel(entity.accessory_type, entity.domain, entity.device_class, this._german)
      : null;
    const pairing = this._pairing[acc.entry_id];
    let pairingBlock: TemplateResult;
    if (acc.paired) {
      pairingBlock = html`<div class="acc-paired">
        ${icon(mdiShieldCheckOutline)}<span>${t("status_running_paired")}</span>
      </div>`;
    } else if (pairing?.available && pairing.pin) {
      pairingBlock = html`<div class="acc-pairing">
        ${pairing.qr ? html`<img class="qr small" src=${pairing.qr} alt="HomeKit QR" />` : nothing}
        <div class="code-box">
          <div class="code-label">${t("setup_code")}</div>
          <button class="code" title=${t("copy")} @click=${() => this._copyPin(pairing.pin!)}>
            <span>${pairing.pin}</span>${icon(mdiContentCopy)}
          </button>
        </div>
      </div>`;
    } else {
      pairingBlock = html`<div class="acc-pairing pending">
        <div class="spinner"></div><span>${t("pairing_unavailable")}</span>
      </div>`;
    }
    return html`
      <section class="card acc-card">
        <div class="acc-head">
          <div class="row-icon on">
            ${entity ? this._stateIcon(entity, stateObj) : icon(mdiTelevision)}
          </div>
          <div class="acc-titles">
            <div class="acc-name">${acc.name}</div>
            <div class="mono">${acc.entity_id ?? "—"}</div>
          </div>
        </div>
        <div class="acc-meta">
          <span class="status"><span class="dot ${status.cls}"></span>${status.label}</span>
          ${typeLabel ? html`<span class="badge primary">${typeLabel}</span>` : nothing}
          ${acc.port ? html`<span class="badge">${t("port", { port: acc.port })}</span>` : nothing}
        </div>
        ${pairingBlock}
        <div class="acc-actions">
          ${acc.yaml
            ? nothing
            : html`<button
                class="icon-btn"
                title=${t("action_settings")}
                aria-label=${t("action_settings")}
                ?disabled=${busy}
                @click=${() => (this._dialog = { kind: "settings", entryId: acc.entry_id })}
              >
                ${icon(mdiCog)}
              </button>`}
          ${entity
            ? html`<button
                class="icon-btn"
                title=${t("action_options")}
                aria-label=${t("action_options")}
                ?disabled=${busy || acc.yaml}
                @click=${() =>
                  (this._dialog = { kind: "entity", entityId: entity.entity_id, accessoryId: acc.entry_id })}
              >
                ${icon(mdiTuneVariant)}
              </button>`
            : nothing}
          <button
            class="icon-btn"
            title=${t("action_restart")}
            aria-label=${t("action_restart")}
            ?disabled=${busy}
            @click=${() => this._restart(acc.entry_id)}
          >
            ${icon(mdiRestart)}
          </button>
          ${acc.paired
            ? html`<button
                class="icon-btn"
                title=${t("action_unpair")}
                aria-label=${t("action_unpair")}
                ?disabled=${busy}
                @click=${() => this._askUnpair(acc.entry_id)}
              >
                ${icon(mdiLinkVariantOff)}
              </button>`
            : nothing}
          <span class="spacer"></span>
          ${acc.yaml
            ? nothing
            : html`<button
                class="btn small danger"
                ?disabled=${busy}
                @click=${() => this._askDelete(acc.entry_id)}
              >
                ${icon(mdiDeleteOutline)} ${t("action_delete")}
              </button>`}
        </div>
      </section>
    `;
  }

  private _renderUnmanaged(bridge: Bridge) {
    const t = this._t;
    const filter = bridge.filter ?? {};
    const parts = [
      ...(filter.include_domains ?? []),
      ...(filter.include_entity_globs ?? []),
    ];
    const excluded = [...(filter.exclude_domains ?? []), ...(filter.exclude_entities ?? [])];
    const summary =
      (parts.length ? parts.join(", ") : this._german ? "alle" : "all") +
      (excluded.length ? (this._german ? `, ohne ${excluded.length}` : `, minus ${excluded.length}`) : "");
    const count = bridge.accessory_entities?.length ?? this._implicitCount(bridge);
    return this._renderNotice(
      mdiTuneVariant,
      t("unmanaged_title"),
      t("unmanaged_text", { filter: summary, count }),
      html`<button class="btn filled" ?disabled=${Boolean(this._busy)} @click=${() => this._askAdopt()}>
        ${t("adopt")}
      </button>`,
    );
  }

  private _renderHealth(bridge: Bridge) {
    const t = this._t;
    const missing = bridge.missing.filter((id) => this._draft.has(id));
    const unavailable = bridge.unavailable.filter((id) => !this.hass.states[id]);
    const controlled = [...this._draft]
      .map((id) => this._entity(id))
      .filter((e): e is EntityInfo => Boolean(e && this._controllerOf(e)));
    if (!missing.length && !unavailable.length && !controlled.length) return nothing;
    const integration = controlled.length ? this._controllerTitle(controlled[0].controlled_by!) : "";
    return html`<section class="card health">
      ${controlled.length
        ? html`<div class="health-row">
            <div class="health-icon">${icon(mdiThermostatAuto)}</div>
            <div class="health-body">
              <strong>${t("health_controlled_title", { count: controlled.length })}</strong>
              <p>${t("health_controlled_text", { integration })}</p>
              <div class="ids">${controlled.map((e) => html`<code>${e.name}</code>`)}</div>
            </div>
            <button class="btn small tonal" @click=${() => this._replaceControlled(controlled)}>
              ${t("health_controlled_replace", { integration })}
            </button>
          </div>`
        : nothing}
      ${missing.length
        ? html`<div class="health-row">
            <div class="health-icon">${icon(mdiAlertOutline)}</div>
            <div class="health-body">
              <strong>${t("missing_title", { count: missing.length })}</strong>
              <p>${t("missing_text")}</p>
              <div class="ids">${missing.map((id) => html`<code>${id}</code>`)}</div>
            </div>
            <button class="btn small tonal" @click=${() => this._removeMissingFromDraft(missing)}>
              ${t("missing_remove")}
            </button>
          </div>`
        : nothing}
      ${unavailable.length
        ? html`<div class="health-row muted">
            <div class="health-icon">${icon(mdiInformationOutline)}</div>
            <div class="health-body">
              <strong>${t("unavailable_title")}</strong>
              <p>${t("unavailable_text")}</p>
              <div class="ids">${unavailable.map((id) => html`<code>${id}</code>`)}</div>
            </div>
          </div>`
        : nothing}
    </section>`;
  }

  private _renderEntities(bridge: Bridge) {
    const t = this._t;
    const base = this._baseEntities();
    const filtered = this._filtered(base);
    const groups = this._groups(filtered);
    const assignedCount = base.filter((e) => this._draft.has(e.entity_id)).length;

    const catCounts = new Map<string, number>();
    for (const e of base) {
      const id = categoryOf(e.domain).id;
      catCounts.set(id, (catCounts.get(id) ?? 0) + 1);
    }
    const hasFilters =
      this._search || this._view !== "all" || this._categories.size || this._showHidden || this._showUnsupported;

    return html`
      ${this._renderHealth(bridge)}
      <section class="filters">
        <div class="search">
          ${icon(mdiMagnify)}
          <input
            type="search"
            .value=${this._search}
            placeholder=${t("search")}
            aria-label=${t("search")}
            @input=${(ev: InputEvent) => (this._search = (ev.target as HTMLInputElement).value)}
          />
          ${this._search
            ? html`<button class="icon-btn small" aria-label=${t("close")} @click=${() => (this._search = "")}>
                ${icon(mdiClose)}
              </button>`
            : nothing}
        </div>
        <div class="filter-row">
          <div class="segmented" role="group">
            ${(["all", "assigned", "unassigned"] as View[]).map(
              (view) => html`<button
                aria-pressed=${String(this._view === view)}
                @click=${() => (this._view = view)}
              >
                ${t(`view_${view}`)}
                ${view === "assigned" ? html`<span class="seg-count">${assignedCount}</span>` : nothing}
              </button>`,
            )}
          </div>
          <div class="spacer"></div>
          <label class="select">
            <span>${t("group_by")}</span>
            <select
              @change=${(ev: Event) => (this._groupBy = (ev.target as HTMLSelectElement).value as GroupBy)}
            >
              ${(["area", "domain", "none"] as GroupBy[]).map(
                (g) => html`<option value=${g} ?selected=${this._groupBy === g}>${t(`group_${g}`)}</option>`,
              )}
            </select>
          </label>
          <button
            class="icon-btn ${this._showFilters ? "active" : ""}"
            title=${t("show_more")}
            aria-label=${t("show_more")}
            aria-expanded=${String(this._showFilters)}
            @click=${() => (this._showFilters = !this._showFilters)}
          >
            ${icon(mdiTuneVariant)}
          </button>
        </div>
        <div class="chips">
          ${[...CATEGORIES, { id: "other", label: "cat_other" as const, icon: mdiInformationOutline, domains: [] }]
            .filter((cat) => catCounts.get(cat.id))
            .map(
              (cat) => html`<button
                class="chip"
                aria-pressed=${String(this._categories.has(cat.id))}
                @click=${() => {
                  const next = new Set(this._categories);
                  if (next.has(cat.id)) next.delete(cat.id);
                  else next.add(cat.id);
                  this._categories = next;
                }}
              >
                ${icon(cat.icon)} ${t(cat.label)} <span class="count">${catCounts.get(cat.id)}</span>
              </button>`,
            )}
        </div>
        ${this._showFilters
          ? html`<div class="more-filters">
              <label class="check">
                <button
                  class="switch"
                  role="switch"
                  aria-checked=${String(this._showHidden)}
                  @click=${() => (this._showHidden = !this._showHidden)}
                ></button>
                ${t("show_hidden")}
              </label>
              <label class="check">
                <button
                  class="switch"
                  role="switch"
                  aria-checked=${String(this._showUnsupported)}
                  @click=${() => (this._showUnsupported = !this._showUnsupported)}
                ></button>
                ${t("show_unsupported")}
              </label>
            </div>`
          : nothing}
      </section>

      <div class="list-meta">
        <span>${t("showing", { shown: filtered.length, total: base.length })}</span>
        ${hasFilters
          ? html`<button class="btn small" @click=${this._resetFilters}>${t("reset_filters")}</button>`
          : nothing}
      </div>

      ${filtered.length
        ? groups.map((group) => this._renderGroup(group, bridge))
        : html`<div class="card message">${icon(mdiMagnify)}<div>${t("no_results")}</div></div>`}
      ${this._renderApplyBar()}
    `;
  }

  private _resetFilters = () => {
    this._search = "";
    this._view = "all";
    this._categories = new Set();
    this._showHidden = false;
    this._showUnsupported = false;
  };

  private _renderGroup(group: Group, bridge: Bridge) {
    const t = this._t;
    const collapsed = this._collapsed.has(group.key) && !this._search;
    const on = group.entities.filter((e) => this._isCovered(e)).length;
    const selectable = group.entities.filter((e) => e.supported);
    const allOn = selectable.length > 0 && selectable.every((e) => this._isCovered(e));
    const toggleCollapse = () => {
      const next = new Set(this._collapsed);
      if (next.has(group.key)) next.delete(group.key);
      else next.add(group.key);
      this._collapsed = next;
    };
    return html`
      <section class="card group">
        <header class="group-head">
          <button class="group-toggle" aria-expanded=${String(!collapsed)} @click=${toggleCollapse}>
            <span class="chev ${collapsed ? "collapsed" : ""}">${icon(mdiChevronDown)}</span>
            ${group.icon ? html`<span class="group-icon">${icon(group.icon)}</span>` : nothing}
            <span class="group-title">${group.label}</span>
            <span class="group-count">${t("in_group", { count: on, total: group.entities.length })}</span>
          </button>
          <button
            class="btn small ${allOn ? "" : "tonal"}"
            ?disabled=${Boolean(this._busy) || (!allOn && !selectable.length)}
            @click=${() => this._toggleGroup(group.entities, !allOn)}
          >
            ${allOn ? t("remove_all") : t("add_all")}
          </button>
        </header>
        ${collapsed
          ? nothing
          : html`<div class="rows">${group.entities.map((e) => this._renderRow(e, bridge))}</div>`}
      </section>
    `;
  }

  private _stateIcon(e: EntityInfo, stateObj: HassEntityState | undefined) {
    if (stateObj && customElements.get("ha-state-icon")) {
      return html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    }
    if (e.icon && customElements.get("ha-icon")) {
      return html`<ha-icon .icon=${e.icon}></ha-icon>`;
    }
    return icon(domainIcon(e.domain));
  }

  private _renderRow(e: EntityInfo, bridge: Bridge) {
    const t = this._t;
    const on = this._draft.has(e.entity_id);
    const was = bridge.entities.includes(e.entity_id);
    const pending = on !== was ? (on ? "adding" : "removing") : "";
    const options = this._options(e.entity_id);
    const configChanged = patchChanges(bridge.entity_config[e.entity_id], this._draftConfig[e.entity_id]);
    const stateObj = this.hass.states[e.entity_id];
    const typeLabel = accessoryTypeLabel(
      typeFromOption(e.domain, options.type) ?? e.accessory_type,
      e.domain,
      e.device_class,
      this._german,
    );
    const others = e.bridges
      .filter((id) => id !== bridge.entry_id)
      .map((id) => this._instance(id))
      .filter((b): b is Bridge => Boolean(b) && b!.mode === "bridge")
      .map((b) => b.name);
    const ownAccessory = this._accessoryFor(e.entity_id);
    const controller = this._controllerOf(e);
    const regulates = this._entities?.controllers?.[e.entity_id];
    const stateText = stateObj
      ? this.hass.formatEntityState?.(stateObj) ?? stateObj.state
      : "";
    const open = () => (this._dialog = { kind: "entity", entityId: e.entity_id });

    return html`
      <div
        class="row ${on ? "on" : ""} ${pending}"
        role="button"
        tabindex="0"
        @click=${open}
        @keydown=${(ev: KeyboardEvent) => {
          if (ev.key === "Enter") open();
        }}
      >
        <div class="row-icon">${this._stateIcon(e, stateObj)}</div>
        <div class="row-main">
          <div class="row-title">
            <span class="name">${options.name || e.name}</span>
            ${options.name ? html`<span class="orig">${e.name}</span>` : nothing}
          </div>
          <div class="row-sub">
            ${this._groupBy !== "area" && e.area ? html`<span>${e.area}</span><span class="sep">·</span>` : nothing}
            <span class="mono">${e.entity_id}</span>
          </div>
          <div class="row-badges">
            ${typeLabel ? html`<span class="badge ${on ? "primary" : ""}">${typeLabel}</span>` : nothing}
            ${!e.supported ? html`<span class="badge error">${icon(mdiAlertOutline)}${t("badge_unsupported")}</span>` : nothing}
            ${ownAccessory
              ? html`<span class="badge primary">${icon(mdiTelevision)}${t("badge_is_accessory")}</span>`
              : e.needs_accessory_mode
                ? html`<span class="badge warning">${t("badge_accessory_mode")}</span>`
                : nothing}
            ${controller
              ? this._draft.has(controller.entity_id)
                ? html`<span class="badge primary">
                    ${icon(mdiThermostatAuto)}${t("controlled_via_badge", { integration: this._controllerTitle(controller.entity_id) })}
                  </span>`
                : html`<span class="badge warning">
                    ${icon(mdiThermostatAuto)}${t("controlled_badge", { integration: this._controllerTitle(controller.entity_id) })}
                  </span>`
              : nothing}
            ${regulates ? html`<span class="badge">${icon(mdiThermostatAuto)}${regulates.title}</span>` : nothing}
            ${e.hidden ? html`<span class="badge">${t("badge_hidden")}</span>` : nothing}
            ${e.entity_category ? html`<span class="badge">${t("badge_diagnostic")}</span>` : nothing}
            ${bridge.rule?.enabled && bridge.rule.members.includes(e.entity_id)
              ? html`<span class="badge primary">${icon(mdiAutoFix)}${t("badge_auto")}</span>`
              : nothing}
            ${others.map((name) => html`<span class="badge">${t("badge_other_bridge", { name })}</span>`)}
            ${pending
              ? html`<span class="badge ${pending === "adding" ? "success" : "error"}">
                  ${icon(pending === "adding" ? mdiCheck : mdiClose)}
                  ${t(pending === "adding" ? "badge_new" : "badge_removed")}
                </span>`
              : nothing}
            ${configChanged ? html`<span class="badge success">${icon(mdiCog)}${t("pending_config", { count: 1 })}</span>` : nothing}
          </div>
        </div>
        <div class="row-state">${stateText}</div>
        <button
          class="switch"
          role="switch"
          aria-checked=${String(on)}
          aria-label=${e.name}
          ?disabled=${Boolean(this._busy)}
          @click=${(ev: Event) => {
            ev.stopPropagation();
            this._onSwitch(e);
          }}
          @keydown=${(ev: KeyboardEvent) => ev.stopPropagation()}
        ></button>
      </div>
    `;
  }

  private _renderApplyBar() {
    const t = this._t;
    const { added, removed, config } = this._changes;
    const dirty = added.length + removed.length + config.length > 0;
    if (!dirty && !this._busy) return nothing;
    const max = this._entities!.max_accessories;
    const tooMany = this._draft.size > max && added.length > 0;
    return html`
      <div class="apply-bar ${this._busy ? "busy" : ""}">
        ${this._busy
          ? html`<div class="spinner"></div><div class="apply-text">${this._busy}</div>`
          : html`
              <div class="apply-text">
                <div class="apply-summary">
                  ${added.length ? html`<span class="badge success">${icon(mdiPlus)}${t("pending_add", { count: added.length })}</span>` : nothing}
                  ${removed.length ? html`<span class="badge error">${icon(mdiClose)}${t("pending_remove", { count: removed.length })}</span>` : nothing}
                  ${config.length ? html`<span class="badge primary">${icon(mdiCog)}${t("pending_config", { count: config.length })}</span>` : nothing}
                </div>
                <div class="apply-hint">${tooMany ? t("too_many", { max }) : t("apply_hint")}</div>
              </div>
              <button class="btn outlined" @click=${() => this._resetDraft()}>${t("discard")}</button>
              <button class="btn filled" ?disabled=${tooMany} @click=${() => this._apply()}>
                ${icon(mdiCheckCircle)} ${t("apply")}
              </button>
            `}
      </div>
    `;
  }

  private _renderDialog() {
    const dialog = this._dialog;
    if (!dialog) return nothing;
    // A dialog can queue a follow-up dialog that opens once it has closed
    const close = () => {
      this._dialog = this._nextDialog;
      this._nextDialog = null;
    };
    const t = this._t;
    switch (dialog.kind) {
      case "confirm":
        return html`<hkm-confirm
          .heading=${dialog.heading}
          .text=${dialog.text}
          .confirmLabel=${dialog.confirmLabel}
          .cancelLabel=${t("cancel")}
          .altLabel=${dialog.altLabel}
          ?danger=${dialog.danger}
          @confirm=${() => dialog.action()}
          @alt=${() => dialog.alt?.()}
          @closed=${close}
        ></hkm-confirm>`;
      case "new":
        return html`<hkm-new-dialog
          .t=${t}
          @choose=${(ev: CustomEvent) => {
            this._nextDialog = ev.detail === "accessory" ? { kind: "add-accessory" } : { kind: "create" };
          }}
          @closed=${close}
        ></hkm-new-dialog>`;
      case "add-accessory": {
        const taken = new Set(this._accessories.map((a) => a.entity_id));
        const bridgeNames: Record<string, string> = {};
        for (const b of this._bridges ?? []) bridgeNames[b.entry_id] = b.name;
        const candidates = (this._entities?.entities ?? []).filter(
          (e) => e.supported && !taken.has(e.entity_id),
        );
        return html`<hkm-accessory-picker
          .hass=${this.hass}
          .t=${t}
          ?german=${this._german}
          .entities=${candidates}
          .bridgeNames=${bridgeNames}
          .preselected=${dialog.entityId ?? null}
          @create-accessory=${(ev: CustomEvent) =>
            this._createAccessory(ev.detail.entityId, ev.detail.name, ev.detail.removeFromBridges)}
          @closed=${close}
        ></hkm-accessory-picker>`;
      }
      case "create":
        return html`<hkm-bridge-form
          .t=${t}
          mode="create"
          .name=${this._bridges?.length ? "" : "HA Bridge"}
          @submit-form=${(ev: CustomEvent) => this._create(ev.detail.name)}
          @closed=${close}
        ></hkm-bridge-form>`;
      case "settings": {
        const inst = this._instance(dialog.entryId);
        if (!inst) return nothing;
        return html`<hkm-bridge-form
          .t=${t}
          mode="settings"
          .name=${inst.name}
          .port=${inst.port}
          @submit-form=${(ev: CustomEvent) =>
            this._saveSettings(
              inst.entry_id,
              ev.detail.name,
              ev.detail.port !== inst.port ? ev.detail.port : undefined,
            )}
          @closed=${close}
        ></hkm-bridge-form>`;
      }
      case "entity": {
        const accessory = dialog.accessoryId ? this._instance(dialog.accessoryId) : undefined;
        const bridge = accessory ?? this._bridge;
        const entity = this._entities?.entities.find((e) => e.entity_id === dialog.entityId);
        if (!bridge || !entity) return nothing;
        const others = entity.bridges
          .filter((id) => id !== bridge.entry_id)
          .map((id) => this._instance(id)?.name)
          .filter((name): name is string => Boolean(name));
        const canBeAccessory = !this._accessoryFor(entity.entity_id) && entity.supported;
        return html`<hkm-entity-dialog
          .hass=${this.hass}
          .t=${t}
          ?german=${this._german}
          ?standalone=${Boolean(accessory)}
          .entity=${entity}
          .assigned=${accessory ? true : this._draft.has(entity.entity_id)}
          .options=${accessory
            ? accessory.entity_config[entity.entity_id] ?? {}
            : this._options(entity.entity_id)}
          .typeOptions=${this._entities?.type_options[entity.domain]}
          .linkFields=${this._entities?.link_fields ?? {}}
          .linkCandidates=${this._entities?.link_candidates ?? []}
          .otherBridges=${others}
          ?canBeAccessory=${canBeAccessory}
          @make-accessory=${(ev: CustomEvent) => {
            this._nextDialog = { kind: "add-accessory", entityId: ev.detail.entityId };
          }}
          @save-entity=${(ev: CustomEvent) => {
            const { entityId, assigned, patch } = ev.detail as {
              entityId: string;
              assigned: boolean;
              patch: EntityOptions;
            };
            if (accessory) {
              if (Object.keys(patch).length) this._saveAccessoryOptions(accessory.entry_id, entityId, patch);
              return;
            }
            this._toggle(entityId, assigned);
            if (Object.keys(patch).length) {
              this._draftConfig = {
                ...this._draftConfig,
                [entityId]: combinePatches(this._draftConfig[entityId], patch),
              };
            }
          }}
          @closed=${close}
        ></hkm-entity-dialog>`;
      }
      case "rules": {
        const bridge = this._bridge;
        if (!bridge || !this._entities) return nothing;
        return html`<hkm-rules-dialog
          .hass=${this.hass}
          .t=${t}
          .entryId=${bridge.entry_id}
          .rule=${bridge.rule}
          .data=${this._entities}
          @save-rule=${(ev: CustomEvent) => this._saveRule(ev.detail.rule, ev.detail.reset)}
          @closed=${close}
        ></hkm-rules-dialog>`;
      }
    }
    return nothing;
  }

  static styles = [
    tokens,
    controls,
    css`
      :host {
        display: flex;
        flex-direction: column;
        /* Since HA 2026.x the panel wrapper has no fixed height; a panel always
           spans the full viewport height, so size against the viewport. */
        height: 100vh;
        height: 100dvh;
        background: var(--hkm-bg);
        color: var(--hkm-text);
        font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, Roboto, sans-serif));
        -webkit-font-smoothing: antialiased;
      }
      /* The panel is registered with handle_safe_area, so it extends behind
         the status bar / home indicator of the companion apps itself. */
      :host {
        --hkm-inset-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px));
        --hkm-inset-bottom: var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));
        --hkm-inset-left: 0px;
        --hkm-inset-right: var(
          --safe-area-content-inset-right,
          var(--safe-area-inset-right, env(safe-area-inset-right, 0px))
        );
      }
      :host([narrow]) {
        --hkm-inset-left: var(
          --safe-area-content-inset-left,
          var(--safe-area-inset-left, env(safe-area-inset-left, 0px))
        );
      }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: none;
        height: calc(var(--header-height, 56px) + var(--hkm-inset-top));
        padding: var(--hkm-inset-top) calc(8px + var(--hkm-inset-right)) 0
          calc(4px + var(--hkm-inset-left));
        box-sizing: border-box;
        background: var(--app-header-background-color, var(--hkm-card));
        color: var(--app-header-text-color, var(--hkm-text));
        border-bottom: var(--app-header-border-bottom, 1px solid var(--hkm-divider));
      }
      .toolbar-title {
        flex: 1;
        margin-left: 12px;
        font-size: 20px;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .scroller {
        flex: 1;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 0 var(--hkm-inset-right) 0 var(--hkm-inset-left);
      }
      .content {
        max-width: 1080px;
        margin: 0 auto;
        padding: 20px 16px calc(32px + var(--hkm-inset-bottom));
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .card {
        background: var(--hkm-card);
        border-radius: var(--hkm-radius);
        box-shadow: var(--hkm-shadow);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--hkm-divider));
      }
      .loading,
      .message {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 48px 16px;
        color: var(--hkm-text-2);
      }
      .message svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .error-card {
        color: var(--hkm-error);
        flex-wrap: wrap;
      }
      .spacer {
        flex: 1;
      }

      /* Empty state */
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 56px 24px 48px;
        margin-top: 24px;
      }
      .empty h2 {
        margin: 28px 0 8px;
        font-size: 24px;
        font-weight: 600;
      }
      .empty p {
        margin: 0 0 28px;
        max-width: 440px;
        color: var(--hkm-text-2);
        line-height: 1.55;
      }
      .empty-art {
        position: relative;
        display: grid;
        place-items: center;
        width: 160px;
        height: 160px;
      }
      .empty-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: radial-gradient(circle, var(--hkm-tint-strong) 0%, var(--hkm-tint) 45%, transparent 70%);
      }

      .bridge-tile {
        display: grid;
        place-items: center;
        flex: none;
        width: 56px;
        height: 56px;
        border-radius: 16px;
        color: #fff;
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--hkm-primary) 85%, white),
          color-mix(in srgb, var(--hkm-primary) 70%, #6d28d9)
        );
        box-shadow: 0 6px 16px color-mix(in srgb, var(--hkm-primary) 35%, transparent);
      }
      .bridge-tile svg {
        width: 30px;
        height: 30px;
        fill: currentColor;
      }
      .bridge-tile.large {
        position: relative;
        width: 88px;
        height: 88px;
        border-radius: 26px;
      }
      .bridge-tile.large svg {
        width: 48px;
        height: 48px;
      }

      /* Tabs */
      .tabs {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 2px;
        scrollbar-width: none;
      }
      .tabs::-webkit-scrollbar {
        display: none;
      }
      .tab {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 38px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--hkm-divider);
        background: var(--hkm-card);
        cursor: pointer;
        font-size: 14px;
        white-space: nowrap;
        transition: background-color 0.15s ease;
      }
      .tab:hover {
        background: var(--hkm-surface-2);
      }
      .tab[aria-selected="true"] {
        background: var(--hkm-text);
        color: var(--hkm-card);
        border-color: transparent;
      }
      .tab-count {
        font-size: 12px;
        opacity: 0.7;
        font-variant-numeric: tabular-nums;
      }
      .tab.add {
        color: var(--hkm-primary);
        border-style: dashed;
      }
      .tab.add svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex: none;
        background: var(--hkm-text-2);
      }
      .dot.ok {
        background: var(--hkm-success);
      }
      .dot.ready {
        background: var(--hkm-warning);
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--hkm-warning) 60%, transparent);
        animation: pulse 2s infinite;
      }
      .dot.busy {
        background: var(--hkm-primary);
        animation: pulse 1.2s infinite;
      }
      .dot.bad {
        background: var(--hkm-error);
      }
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 0%, transparent);
          opacity: 1;
        }
        50% {
          opacity: 0.55;
        }
        100% {
          opacity: 1;
        }
      }

      /* Hero */
      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 380px);
        overflow: hidden;
      }
      .hero-main {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 24px;
        min-width: 0;
      }
      .hero-head {
        display: flex;
        align-items: center;
        gap: 16px;
        min-width: 0;
      }
      .hero-titles {
        min-width: 0;
      }
      h1 {
        margin: 0 0 6px;
        font-size: 26px;
        font-weight: 650;
        letter-spacing: -0.01em;
        line-height: 1.15;
        overflow-wrap: anywhere;
      }
      .hero-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px 14px;
        font-size: 13px;
        color: var(--hkm-text-2);
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        color: var(--hkm-text);
      }
      .capacity-label {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: var(--hkm-text-2);
        margin-bottom: 8px;
        font-variant-numeric: tabular-nums;
      }
      .meter {
        height: 8px;
        border-radius: 999px;
        background: var(--hkm-surface-3);
        overflow: hidden;
      }
      .meter > div {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--hkm-primary), color-mix(in srgb, var(--hkm-primary) 60%, #6d28d9));
        transition: width 0.35s ease;
      }
      .meter.over > div {
        background: var(--hkm-error);
      }
      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: auto;
      }

      /* Pairing */
      .pairing {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 24px;
        background: var(--hkm-surface-2);
        border-left: 1px solid var(--hkm-divider);
      }
      .pairing-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 15px;
      }
      .pairing-title svg {
        width: 20px;
        height: 20px;
        fill: var(--hkm-primary);
      }
      .pairing-body {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }
      .qr {
        width: 112px;
        height: 112px;
        flex: none;
        padding: 6px;
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
        image-rendering: pixelated;
      }
      .code-box {
        min-width: 0;
      }
      .code-label {
        font-size: 12px;
        color: var(--hkm-text-2);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .code {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin: 4px 0 8px;
        padding: 4px 10px 4px 0;
        border: none;
        background: none;
        cursor: pointer;
        font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace);
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 0.04em;
        white-space: nowrap;
        color: var(--hkm-text);
        border-radius: 8px;
      }
      .code svg {
        width: 16px;
        height: 16px;
        fill: var(--hkm-text-2);
      }
      .code:hover svg {
        fill: var(--hkm-primary);
      }
      .pairing p {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: var(--hkm-text-2);
      }
      .pairing.paired,
      .pairing.pending {
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      .paired-icon {
        display: grid;
        place-items: center;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--hkm-success) 15%, transparent);
      }
      .paired-icon svg {
        width: 30px;
        height: 30px;
        fill: var(--hkm-success);
      }

      /* Notices */
      .notice {
        display: flex;
        gap: 16px;
        padding: 24px;
      }
      .notice-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: var(--hkm-tint);
      }
      .notice-icon svg {
        width: 24px;
        height: 24px;
        fill: var(--hkm-primary);
      }
      .notice h3 {
        margin: 0 0 6px;
        font-size: 17px;
      }
      .notice p {
        margin: 0 0 16px;
        line-height: 1.55;
        color: var(--hkm-text-2);
      }

      /* Filters */
      .filters {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
      }
      .search {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 48px;
        padding: 0 8px 0 16px;
        border-radius: 999px;
        background: var(--hkm-card);
        border: 1px solid var(--hkm-divider);
        box-shadow: var(--hkm-shadow);
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .search:focus-within {
        border-color: var(--hkm-primary);
        box-shadow: 0 0 0 3px var(--hkm-tint);
      }
      .search > svg {
        width: 22px;
        height: 22px;
        fill: var(--hkm-text-2);
        flex: none;
      }
      .search input {
        flex: 1;
        min-width: 0;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        color: var(--hkm-text);
        font: inherit;
        font-size: 15px;
      }
      .search input::-webkit-search-cancel-button {
        display: none;
      }
      .icon-btn.small {
        width: 32px;
        height: 32px;
      }
      .icon-btn.small svg {
        width: 18px;
        height: 18px;
      }
      .icon-btn.active {
        background: var(--hkm-tint);
        color: var(--hkm-primary);
      }
      .filter-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .segmented {
        display: inline-flex;
        padding: 3px;
        border-radius: 999px;
        background: var(--hkm-surface-3);
      }
      .segmented button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 32px;
        padding: 0 14px;
        border: none;
        border-radius: 999px;
        background: transparent;
        font-size: 13px;
        font-weight: 500;
        color: var(--hkm-text-2);
        cursor: pointer;
        white-space: nowrap;
      }
      .segmented button[aria-pressed="true"] {
        background: var(--hkm-card);
        color: var(--hkm-text);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }
      .seg-count {
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        box-sizing: border-box;
        border-radius: 999px;
        background: var(--hkm-primary);
        color: var(--hkm-on-primary);
        font-size: 11px;
        line-height: 18px;
        text-align: center;
      }
      .select {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--hkm-text-2);
      }
      .select select {
        font: inherit;
        font-size: 13px;
        height: 34px;
        padding: 0 10px;
        border-radius: 10px;
        border: 1px solid var(--hkm-divider);
        background: var(--hkm-card);
        color: var(--hkm-text);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
        padding-bottom: 2px;
      }
      .chips::-webkit-scrollbar {
        display: none;
      }
      .more-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 28px;
        padding: 14px 16px;
        border-radius: 14px;
        background: var(--hkm-surface-2);
      }
      .check {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        cursor: pointer;
      }
      .list-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 32px;
        padding: 0 4px;
        font-size: 13px;
        color: var(--hkm-text-2);
      }

      /* Groups & rows */
      .group {
        overflow: hidden;
      }
      .group-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px 8px 8px;
        border-bottom: 1px solid var(--hkm-divider);
      }
      .group-toggle {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        height: 40px;
        padding: 0 8px;
        border: none;
        border-radius: 10px;
        background: none;
        cursor: pointer;
        text-align: left;
      }
      .group-toggle:hover {
        background: var(--hkm-surface-2);
      }
      .chev svg,
      .group-icon svg {
        width: 20px;
        height: 20px;
        fill: var(--hkm-text-2);
        display: block;
      }
      .chev {
        transition: transform 0.2s ease;
      }
      .chev.collapsed {
        transform: rotate(-90deg);
      }
      .group-title {
        font-weight: 600;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .group-count {
        font-size: 12px;
        color: var(--hkm-text-2);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .rows {
        display: flex;
        flex-direction: column;
      }
      .row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 16px;
        cursor: pointer;
        content-visibility: auto;
        contain-intrinsic-size: auto 72px;
        transition: background-color 0.12s ease;
      }
      .row + .row {
        border-top: 1px solid color-mix(in srgb, var(--hkm-divider) 60%, transparent);
      }
      .row:hover {
        background: var(--hkm-surface-2);
      }
      .row:focus-visible {
        outline: 2px solid var(--hkm-primary);
        outline-offset: -2px;
      }
      .row::before {
        content: "";
        position: absolute;
        left: 0;
        top: 10px;
        bottom: 10px;
        width: 3px;
        border-radius: 0 3px 3px 0;
        background: transparent;
      }
      .row.adding::before {
        background: var(--hkm-success);
      }
      .row.removing::before {
        background: var(--hkm-error);
      }
      .row-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: var(--hkm-surface-3);
        color: var(--hkm-text-2);
        --mdc-icon-size: 22px;
        transition: background-color 0.2s ease, color 0.2s ease;
      }
      .row-icon svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .row-icon.on,
      .row.on .row-icon {
        background: var(--hkm-tint);
        color: var(--hkm-primary);
      }
      .row-main {
        flex: 1;
        min-width: 0;
      }
      .row-title {
        display: flex;
        align-items: baseline;
        gap: 8px;
        min-width: 0;
      }
      .name {
        font-weight: 500;
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .orig {
        font-size: 12px;
        color: var(--hkm-text-2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row-sub {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 2px;
        font-size: 12px;
        color: var(--hkm-text-2);
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
      }
      .row-sub .sep {
        opacity: 0.6;
      }
      .mono {
        font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace);
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
      }
      .row-badges:empty {
        display: none;
      }
      .row-state {
        flex: none;
        max-width: 140px;
        font-size: 13px;
        color: var(--hkm-text-2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: right;
      }

      /* Apply bar */
      .apply-bar {
        position: sticky;
        bottom: calc(16px + var(--hkm-inset-bottom));
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 4px;
        padding: 12px 12px 12px 20px;
        border-radius: 20px;
        background: color-mix(in srgb, var(--hkm-card) 88%, transparent);
        backdrop-filter: blur(12px) saturate(1.4);
        -webkit-backdrop-filter: blur(12px) saturate(1.4);
        border: 1px solid var(--hkm-divider);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
        animation: slide-up 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.1);
      }
      @keyframes slide-up {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
      }
      .apply-text {
        flex: 1;
        min-width: 0;
      }
      .apply-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .apply-summary .badge {
        height: 24px;
        font-size: 12px;
      }
      .apply-hint {
        margin-top: 4px;
        font-size: 12px;
        color: var(--hkm-text-2);
      }
      .apply-bar.busy {
        padding: 18px 20px;
      }
      .apply-bar.busy .apply-text {
        font-weight: 500;
      }
      .spinner.small {
        width: 16px;
        height: 16px;
        border-width: 2px;
        border-color: rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
      }

      .pill {
        margin-left: 2px;
        padding: 1px 7px;
        border-radius: 999px;
        background: var(--hkm-primary);
        color: var(--hkm-on-primary);
        font-size: 11px;
        font-weight: 600;
      }
      .health {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 18px 20px;
        border-color: color-mix(in srgb, var(--hkm-warning) 45%, var(--hkm-divider));
      }
      .health-row {
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }
      .health-row + .health-row {
        padding-top: 14px;
        border-top: 1px solid var(--hkm-divider);
      }
      .health-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--hkm-warning) 18%, transparent);
      }
      .health-icon svg {
        width: 20px;
        height: 20px;
        fill: color-mix(in srgb, var(--hkm-warning) 75%, var(--hkm-text));
      }
      .health-row.muted .health-icon {
        background: var(--hkm-surface-3);
      }
      .health-row.muted .health-icon svg {
        fill: var(--hkm-text-2);
      }
      .health-body {
        flex: 1;
        min-width: 0;
      }
      .health-body p {
        margin: 2px 0 8px;
        font-size: 13px;
        color: var(--hkm-text-2);
      }
      .ids {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .ids code {
        padding: 2px 8px;
        border-radius: 6px;
        background: var(--hkm-surface-3);
        font-size: 12px;
      }

      /* Standalone accessories */
      .tab svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }
      .tab-sep {
        flex: none;
        width: 1px;
        margin: 6px 2px;
        background: var(--hkm-divider);
      }
      .accessories-intro .notice-icon {
        background: color-mix(in srgb, #ff7043 16%, transparent);
      }
      .accessories-intro .notice-icon svg {
        fill: #f4511e;
      }
      .acc-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }
      .acc-card {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 18px;
      }
      .acc-head {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }
      .acc-titles {
        min-width: 0;
      }
      .acc-name {
        font-weight: 600;
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .acc-titles .mono {
        display: block;
        font-size: 12px;
        color: var(--hkm-text-2);
      }
      .acc-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        font-size: 13px;
      }
      .acc-pairing {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px;
        border-radius: 14px;
        background: var(--hkm-surface-2);
      }
      .acc-pairing.pending {
        font-size: 13px;
        color: var(--hkm-text-2);
      }
      .qr.small {
        width: 84px;
        height: 84px;
        padding: 4px;
        border-radius: 10px;
      }
      .acc-paired {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--hkm-success) 12%, transparent);
        font-weight: 500;
        font-size: 14px;
      }
      .acc-paired svg {
        width: 22px;
        height: 22px;
        fill: var(--hkm-success);
      }
      .acc-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: auto;
        color: var(--hkm-text-2);
      }
      .empty-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }
      .empty-hint {
        margin: 18px 0 0 !important;
        font-size: 13px;
      }

      /* Narrow / mobile */
      @media (max-width: 760px) {
        .hero {
          grid-template-columns: 1fr;
        }
        .pairing {
          border-left: none;
          border-top: 1px solid var(--hkm-divider);
        }
        .row-state {
          display: none;
        }
      }
      @media (max-width: 520px) {
        .content {
          padding: 12px 10px calc(24px + var(--hkm-inset-bottom));
          gap: 12px;
        }
        .hero-main,
        .pairing,
        .notice {
          padding: 18px;
        }
        h1 {
          font-size: 22px;
        }
        .bridge-tile {
          width: 48px;
          height: 48px;
        }
        .row {
          padding: 12px;
          gap: 12px;
        }
        .apply-bar {
          flex-wrap: wrap;
          padding: 12px;
        }
        .apply-bar .apply-text {
          flex-basis: 100%;
        }
        .apply-bar .btn {
          flex: 1;
        }
        .select span {
          display: none;
        }
        .chips {
          flex-wrap: nowrap;
        }
        .health-row {
          flex-wrap: wrap;
        }
        .health-body {
          flex: 1 1 calc(100% - 50px);
        }
        .health-row > .btn {
          margin-left: 50px;
        }
        .pairing-body {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .group-count {
          display: none;
        }
      }
    `,
  ];
}

if (!customElements.get("homekit-manager-panel")) {
  customElements.define("homekit-manager-panel", HomeKitManagerPanel);
}
