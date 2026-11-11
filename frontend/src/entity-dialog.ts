import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import {
  mdiAlertOutline,
  mdiBatteryHigh,
  mdiInformationOutline,
  mdiOpenInNew,
  mdiTelevision,
} from "@mdi/js";
import type {
  EntityInfo,
  EntityOptions,
  HassEntityState,
  HomeAssistant,
  LinkCandidate,
  LinkField,
} from "./api";
import { fire, type HkmDialog } from "./dialogs";
import type { Translate } from "./i18n";
import {
  accessoryTypeLabel,
  domainIcon,
  isBatteryLink,
  linkLabel,
  mediaFeatureLabel,
  optionLabel,
  typeFromOption,
} from "./meta";
import { effectivePatch } from "./options";
import { controls, icon, tokens } from "./styles";

const CODE_DOMAINS = ["alarm_control_panel", "lock"];
const BATTERY_KEYS = ["linked_battery_sensor", "linked_battery_charging_sensor"];

/**
 * Per-entity HomeKit options: assignment, name, type, code, media player
 * functions and linked sensors. Emits ``save-entity`` with a patch.
 */
export class HkmEntityDialog extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    german: { type: Boolean },
    entity: { attribute: false },
    assigned: { type: Boolean },
    options: { attribute: false },
    typeOptions: { attribute: false },
    otherBridges: { attribute: false },
    canBeAccessory: { type: Boolean },
    standalone: { type: Boolean },
    linkFields: { attribute: false },
    linkCandidates: { attribute: false },
    _assigned: { state: true },
    _values: { state: true },
    _code: { state: true },
    _clearCode: { state: true },
    _battery: { state: true },
  };

  declare hass: HomeAssistant;
  declare t: Translate;
  declare german: boolean;
  declare entity: EntityInfo;
  declare assigned: boolean;
  declare options: EntityOptions;
  declare typeOptions: string[] | undefined;
  declare otherBridges: string[];
  declare canBeAccessory: boolean;
  declare standalone: boolean;
  declare linkFields: Record<string, LinkField>;
  declare linkCandidates: LinkCandidate[];
  declare _assigned: boolean;
  declare _values: EntityOptions;
  declare _code: string;
  declare _clearCode: boolean;
  declare _battery: boolean;

  /** Entity the local draft belongs to; the parent re-renders (and passes
   *  fresh option objects) on every state update and poll. */
  private _draftFor?: string;

  willUpdate() {
    if (this.entity && this._draftFor !== this.entity.entity_id) {
      this._draftFor = this.entity.entity_id;
      this._assigned = this.assigned;
      const { has_code: _ignored, ...values } = this.options ?? {};
      this._values = values;
      this._code = "";
      this._clearCode = false;
      this._battery = this._batteryDetected() || this._batteryConfigured();
    }
  }

  private _close() {
    this.renderRoot.querySelector<HkmDialog>("hkm-dialog")?.close();
  }

  private _set(key: string, value: unknown) {
    this._values = { ...this._values, [key]: value === "" ? null : value };
  }

  private _save() {
    const edited: EntityOptions = {};
    const keys = new Set([...Object.keys(this._values), ...Object.keys(this.options ?? {})]);
    keys.delete("has_code");
    keys.delete("code");
    for (const key of keys) edited[key] = this._values[key] ?? null;
    if (typeof edited.name === "string") edited.name = edited.name.trim() || null;
    if (!this._battery) {
      for (const key of [...BATTERY_KEYS, "low_battery_threshold"]) edited[key] = null;
    }
    if (this._clearCode) edited.code = null;
    else if (this._code) edited.code = this._code;
    fire(this, "save-entity", {
      entityId: this.entity.entity_id,
      assigned: this._assigned,
      patch: effectivePatch(this.options, edited),
    });
    this._close();
  }

  private _makeAccessory = () => {
    fire(this, "make-accessory", { entityId: this.entity.entity_id });
    this._close();
  };

  private _moreInfo() {
    const entityId = this.entity.entity_id;
    this._close();
    fire(this, "hass-more-info", { entityId });
  }

  private _stateIcon(stateObj: HassEntityState | undefined) {
    if (stateObj && customElements.get("ha-state-icon")) {
      return html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    }
    return icon(domainIcon(this.entity.domain));
  }

  /** Link fields that apply to this entity (and its chosen type). */
  private _links(): [string, LinkField][] {
    const domain = this.entity.domain;
    const type = (this._values.type as string | null | undefined) ?? null;
    return Object.entries(this.linkFields ?? {}).filter(([, field]) => {
      if (field.applies_to && !field.applies_to.includes(domain)) return false;
      if (field.requires_type && field.requires_type !== type) return false;
      return true;
    });
  }

  private _candidates(field: LinkField): LinkCandidate[] {
    const own = this.entity.device_id;
    const score = (c: LinkCandidate) =>
      (own && c.device_id === own ? 0 : 2) +
      (c.device_class && field.device_classes.includes(c.device_class) ? 0 : 1);
    return (this.linkCandidates ?? [])
      .filter((c) => field.domains.includes(c.domain) && c.entity_id !== this.entity.entity_id)
      .sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name));
  }

  private _linkSelect(key: string, field: LinkField): TemplateResult {
    const t = this.t;
    const value = (this._values[key] as string | null | undefined) ?? "";
    const own = this.entity.device_id;
    return html`<div class="field">
      <label for=${key}>${linkLabel(key, this.german)}</label>
      <select id=${key} @change=${(ev: Event) => this._set(key, (ev.target as HTMLSelectElement).value)}>
        <option value="" ?selected=${!value}>${t("link_auto")}</option>
        ${this._candidates(field).map(
          (c) => html`<option value=${c.entity_id} ?selected=${c.entity_id === value}>
            ${c.name}${own && c.device_id === own ? ` · ${t("link_same_device")}` : ""}
          </option>`,
        )}
      </select>
    </div>`;
  }

  private _renderGeneral(autoLabel: string | null) {
    const t = this.t;
    const e = this.entity;
    const type = (this._values.type as string | null | undefined) ?? "";
    const typeChanged = (this.options?.type ?? "") !== type && this.assigned;
    return html`
      <div class="field">
        <label for="hk-name">${t("homekit_name")}</label>
        <input
          id="hk-name"
          .value=${(this._values.name as string | null | undefined) ?? ""}
          placeholder=${e.name}
          maxlength="64"
          autocomplete="off"
          @input=${(ev: InputEvent) => this._set("name", (ev.target as HTMLInputElement).value)}
        />
        <span class="helper">${t("homekit_name_helper")}</span>
      </div>
      ${this.typeOptions?.length
        ? html`<div class="field">
            <label for="hk-type">${t("accessory_type")}</label>
            <select
              id="hk-type"
              @change=${(ev: Event) => this._set("type", (ev.target as HTMLSelectElement).value)}
            >
              <option value="" ?selected=${!type}>
                ${t("accessory_type_auto", { type: autoLabel ?? "—" })}
              </option>
              ${this.typeOptions.map(
                (opt) =>
                  html`<option value=${opt} ?selected=${type === opt}>
                    ${optionLabel(opt, this.german)}
                  </option>`,
              )}
            </select>
            ${typeChanged ? html`<span class="helper warn">${t("warn_type_reset")}</span>` : nothing}
          </div>`
        : nothing}
    `;
  }

  private _renderCode() {
    const t = this.t;
    if (!CODE_DOMAINS.includes(this.entity.domain)) return nothing;
    const stored = Boolean(this.options?.has_code) && !this._clearCode;
    return html`<section>
      <h3>${t("code_title")}</h3>
      <div class="field">
        <label for="hk-code">${t("code_label")}</label>
        <input
          id="hk-code"
          type="password"
          autocomplete="new-password"
          inputmode="numeric"
          maxlength="64"
          .value=${this._code}
          placeholder=${stored ? t("code_stored") : ""}
          @input=${(ev: InputEvent) => {
            this._code = (ev.target as HTMLInputElement).value;
            if (this._code) this._clearCode = false;
          }}
        />
        <span class="helper">${t("code_helper")}</span>
      </div>
      ${stored
        ? html`<button class="btn small danger" @click=${() => {
            this._clearCode = true;
            this._code = "";
          }}>${t("code_remove")}</button>`
        : nothing}
    </section>`;
  }

  private _renderMedia() {
    const t = this.t;
    const e = this.entity;
    if (e.domain !== "media_player" || e.accessory_type !== "MediaPlayer" || !e.media_features?.length) {
      return nothing;
    }
    const selected = new Set((this._values.feature_list as string[] | null | undefined) ?? []);
    const toggle = (feature: string) => {
      const next = new Set(selected);
      if (next.has(feature)) next.delete(feature);
      else next.add(feature);
      this._set("feature_list", next.size ? [...next] : null);
    };
    return html`<section>
      <h3>${t("media_title")}</h3>
      <div class="checks">
        ${e.media_features.map(
          (feature) => html`<label class="check">
            <input
              type="checkbox"
              .checked=${selected.has(feature)}
              @change=${() => toggle(feature)}
            />
            ${mediaFeatureLabel(feature, this.german)}
          </label>`,
        )}
      </div>
      <span class="helper">${t("media_helper")}</span>
    </section>`;
  }

  /** A battery sensor exists on the same device (core links it automatically). */
  private _batteryDetected(): boolean {
    const device = this.entity?.device_id;
    if (!device) return false;
    return (this.linkCandidates ?? []).some(
      (c) =>
        c.device_id === device &&
        (c.device_class === "battery" || c.device_class === "battery_charging"),
    );
  }

  private _batteryConfigured(): boolean {
    const options = this.options ?? {};
    return BATTERY_KEYS.some((key) => options[key]) || Boolean(options.low_battery_threshold);
  }

  private _renderBattery(battery: [string, LinkField][]) {
    const t = this.t;
    const detected = this._batteryDetected();
    return html`<section class="battery">
      <label class="toggle-row" @click=${() => (this._battery = !this._battery)}>
        <span class="toggle-icon">${icon(mdiBatteryHigh)}</span>
        <span class="toggle-text">
          <span class="toggle-title">${t("battery_toggle")}</span>
          <span class="toggle-sub">${t(detected ? "battery_detected" : "battery_hint")}</span>
        </span>
        <button
          class="switch"
          role="switch"
          aria-checked=${String(this._battery)}
          aria-label=${t("battery_toggle")}
        ></button>
      </label>
      ${this._battery
        ? html`<div class="grid">
            ${battery.map(([key, field]) => this._linkSelect(key, field))}
            <div class="field">
              <label for="hk-threshold">${t("battery_threshold")}</label>
              <input
                id="hk-threshold"
                type="number"
                min="1"
                max="99"
                placeholder="20"
                .value=${String(this._values.low_battery_threshold ?? "")}
                @input=${(ev: InputEvent) => {
                  const raw = (ev.target as HTMLInputElement).value;
                  this._set("low_battery_threshold", raw ? Number(raw) : null);
                }}
              />
            </div>
          </div>`
        : nothing}
    </section>`;
  }

  private _renderLinks() {
    const t = this.t;
    const links = this._links();
    const main = links.filter(([key]) => !isBatteryLink(key));
    const battery = links.filter(([key]) => isBatteryLink(key));
    return html`
      ${main.length
        ? html`<section>
            <h3>${t("links_title")}</h3>
            <p class="section-hint">${t("links_helper")}</p>
            <div class="grid">${main.map(([key, field]) => this._linkSelect(key, field))}</div>
          </section>`
        : nothing}
      ${battery.length ? this._renderBattery(battery) : nothing}
    `;
  }

  render() {
    const t = this.t;
    const e = this.entity;
    const stateObj = this.hass.states[e.entity_id];
    const type = (this._values.type as string | null | undefined) ?? null;
    const resolved = typeFromOption(e.domain, type) ?? e.accessory_type;
    const typeLabel = accessoryTypeLabel(resolved, e.domain, e.device_class, this.german);
    const autoLabel = accessoryTypeLabel(e.accessory_type, e.domain, e.device_class, this.german);
    const stateText = stateObj ? this.hass.formatEntityState?.(stateObj) ?? stateObj.state : "—";
    return html`
      <hkm-dialog .heading=${e.name} wide>
        <div slot="icon" class="hero-icon ${this._assigned ? "on" : ""}">${this._stateIcon(stateObj)}</div>

        ${this.standalone
          ? html`<div class="assign static">
              ${icon(mdiTelevision)}
              <div>
                <div class="assign-title">${t("standalone_title")}</div>
                <div class="mono">${e.entity_id}</div>
              </div>
            </div>`
          : html`<div class="assign" @click=${() => (this._assigned = !this._assigned)}>
              <div>
                <div class="assign-title">${t("entity_in_bridge")}</div>
                <div class="mono">${e.entity_id}</div>
              </div>
              <button
                class="switch"
                role="switch"
                aria-checked=${String(this._assigned)}
                aria-label=${t("entity_in_bridge")}
              ></button>
            </div>`}

        ${!e.supported
          ? html`<div class="note warning">${icon(mdiAlertOutline)}<span>${t("warn_unsupported")}</span></div>`
          : nothing}
        ${e.needs_accessory_mode && !this.standalone
          ? html`<div class="note info">
              ${icon(mdiInformationOutline)}
              <div>
                <span>${t("warn_accessory_mode")}</span>
                ${this.canBeAccessory
                  ? html`<button class="btn small tonal note-action" @click=${this._makeAccessory}>
                      ${icon(mdiTelevision)} ${t("make_accessory")}
                    </button>`
                  : nothing}
              </div>
            </div>`
          : nothing}

        <div class="form">
          ${this._renderGeneral(autoLabel)} ${this._renderCode()} ${this._renderMedia()}
          ${this._renderLinks()}
        </div>

        <dl class="facts">
          <div><dt>${t("info_type")}</dt><dd>${typeLabel ?? "—"}</dd></div>
          <div><dt>${t("info_state")}</dt><dd>${stateText}</dd></div>
          <div><dt>${t("info_area")}</dt><dd>${e.area ?? "—"}</dd></div>
          <div><dt>${t("info_device")}</dt><dd>${e.device ?? "—"}</dd></div>
          <div><dt>${t("info_integration")}</dt><dd>${e.platform ?? "—"}</dd></div>
        </dl>
        ${this.otherBridges?.length
          ? html`<div class="others">
              ${this.otherBridges.map(
                (name) => html`<span class="badge">${t("badge_other_bridge", { name })}</span>`,
              )}
            </div>`
          : nothing}

        <button slot="actions" class="btn" @click=${this._moreInfo}>
          ${icon(mdiOpenInNew)} ${t("open_more_info")}
        </button>
        <span slot="actions" class="spacer"></span>
        <button slot="actions" class="btn outlined" @click=${this._close}>${t("cancel")}</button>
        <button slot="actions" class="btn filled" @click=${this._save}>
          ${t(this.standalone ? "save" : "done")}
        </button>
      </hkm-dialog>
    `;
  }

  static styles = [
    tokens,
    controls,
    css`
      .hero-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: var(--hkm-surface-3);
        color: var(--hkm-text-2);
        flex: none;
        --mdc-icon-size: 24px;
      }
      .hero-icon svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
      }
      .hero-icon.on {
        background: var(--hkm-tint);
        color: var(--hkm-primary);
      }
      .assign {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 16px;
        border-radius: 14px;
        background: var(--hkm-surface-2);
        cursor: pointer;
        margin-bottom: 16px;
      }
      .assign.static {
        justify-content: flex-start;
        cursor: default;
      }
      .assign.static > svg {
        width: 22px;
        height: 22px;
        fill: var(--hkm-primary);
        flex: none;
      }
      .assign-title {
        font-weight: 500;
      }
      .mono {
        font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace);
        font-size: 12px;
        color: var(--hkm-text-2);
        overflow-wrap: anywhere;
        margin-top: 2px;
      }
      .note {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.5;
        margin-bottom: 12px;
      }
      .note > svg {
        width: 18px;
        height: 18px;
        flex: none;
        fill: currentColor;
        margin-top: 1px;
      }
      .note > div {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .note.warning {
        background: color-mix(in srgb, var(--hkm-warning) 14%, transparent);
      }
      .note.info {
        background: var(--hkm-tint);
      }
      .note-action {
        margin-top: 10px;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid var(--hkm-divider);
      }
      section > .btn {
        align-self: flex-start;
      }
      h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
      }
      .section-hint {
        margin: -4px 0 0;
        font-size: 12px;
        color: var(--hkm-text-2);
        line-height: 1.45;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px 16px;
      }
      .toggle-row {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      }
      .toggle-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: var(--hkm-surface-3);
      }
      .toggle-icon svg {
        width: 18px;
        height: 18px;
        fill: var(--hkm-text-2);
      }
      .toggle-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .toggle-title {
        font-weight: 600;
        font-size: 15px;
      }
      .toggle-sub {
        font-size: 12px;
        color: var(--hkm-text-2);
        line-height: 1.4;
      }
      .helper {
        font-size: 12px;
        color: var(--hkm-text-2);
      }
      .checks {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 20px;
      }
      .check {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
      }
      .check input {
        width: 18px;
        height: 18px;
        accent-color: var(--hkm-primary);
      }
      .helper.warn {
        color: color-mix(in srgb, var(--hkm-warning) 70%, var(--hkm-text));
      }
      .facts {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px 20px;
        margin: 20px 0 4px;
        padding: 16px 0 0;
        border-top: 1px solid var(--hkm-divider);
      }
      .facts div {
        min-width: 0;
      }
      dt {
        font-size: 12px;
        color: var(--hkm-text-2);
        margin-bottom: 2px;
      }
      dd {
        margin: 0;
        font-size: 14px;
        overflow-wrap: anywhere;
      }
      .others {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 14px;
      }
      .spacer {
        flex: 1;
      }
    `,
  ];
}

if (!customElements.get("hkm-entity-dialog")) {
  customElements.define("hkm-entity-dialog", HkmEntityDialog);
}
