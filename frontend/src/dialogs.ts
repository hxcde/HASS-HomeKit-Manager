import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import {
  mdiArrowLeft,
  mdiChevronRight,
  mdiClose,
  mdiHomeAutomation,
  mdiInformationOutline,
  mdiMagnify,
  mdiStarOutline,
  mdiTelevision,
} from "@mdi/js";
import type { EntityInfo, HomeAssistant } from "./api";
import type { Translate } from "./i18n";
import { accessoryTypeLabel, domainIcon } from "./meta";
import { controls, icon, tokens } from "./styles";

export const fire = (el: HTMLElement, name: string, detail?: unknown) =>
  el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));

/** Modal shell built on the native <dialog> element (top layer). */
export class HkmDialog extends LitElement {
  static properties = {
    heading: { type: String },
    wide: { type: Boolean },
  };

  declare heading: string;
  declare wide: boolean;

  firstUpdated() {
    const dialog = this.renderRoot.querySelector("dialog")!;
    dialog.showModal();
    dialog.addEventListener("close", () => fire(this, "closed"));
    dialog.addEventListener("click", (ev) => {
      if (ev.target === dialog) dialog.close();
    });
  }

  close() {
    this.renderRoot.querySelector("dialog")?.close();
  }

  render() {
    return html`
      <dialog class=${this.wide ? "wide" : ""} aria-label=${this.heading}>
        <div class="surface">
          <header>
            <slot name="icon"></slot>
            <h2>${this.heading}</h2>
            <button class="icon-btn" @click=${this.close} aria-label="close">
              ${icon(mdiClose)}
            </button>
          </header>
          <div class="content"><slot></slot></div>
          <footer><slot name="actions"></slot></footer>
        </div>
      </dialog>
    `;
  }

  static styles = [
    tokens,
    controls,
    css`
      dialog {
        padding: 0;
        border: none;
        background: transparent;
        max-width: min(480px, calc(100vw - 24px));
        width: 100%;
        max-height: calc(100vh - 32px);
        overflow: visible;
        color: var(--hkm-text);
      }
      dialog.wide {
        max-width: min(560px, calc(100vw - 24px));
      }
      dialog::backdrop {
        background: rgba(10, 12, 16, 0.45);
        backdrop-filter: blur(3px);
      }
      dialog[open] .surface {
        animation: pop 0.18s cubic-bezier(0.2, 0.9, 0.3, 1.1);
      }
      @keyframes pop {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
        }
      }
      .surface {
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 32px);
        background: var(--hkm-card);
        border-radius: 24px;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
        overflow: hidden;
      }
      header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 12px 8px 24px;
      }
      h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        line-height: 1.3;
        overflow-wrap: anywhere;
      }
      .content {
        padding: 8px 24px 8px;
        overflow-y: auto;
      }
      footer {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 8px;
        padding: 16px 24px 20px;
      }
    `,
  ];
}

/** Confirmation dialog. */
export class HkmConfirm extends LitElement {
  static properties = {
    heading: { type: String },
    text: { type: String },
    confirmLabel: { type: String },
    cancelLabel: { type: String },
    danger: { type: Boolean },
  };

  declare heading: string;
  declare text: string;
  declare confirmLabel: string;
  declare cancelLabel: string;
  declare danger: boolean;

  private _confirm() {
    fire(this, "confirm");
    this.renderRoot.querySelector<HkmDialog>("hkm-dialog")?.close();
  }

  render() {
    return html`
      <hkm-dialog .heading=${this.heading}>
        <p>${this.text}</p>
        <button
          slot="actions"
          class="btn outlined"
          @click=${() => this.renderRoot.querySelector<HkmDialog>("hkm-dialog")?.close()}
        >
          ${this.cancelLabel}
        </button>
        <button
          slot="actions"
          class="btn filled ${this.danger ? "danger" : ""}"
          @click=${this._confirm}
        >
          ${this.confirmLabel}
        </button>
      </hkm-dialog>
    `;
  }

  static styles = [
    tokens,
    controls,
    css`
      p {
        margin: 0;
        line-height: 1.55;
        color: var(--hkm-text-2);
      }
    `,
  ];
}

/** Create a bridge or edit its name/port. */
export class HkmBridgeForm extends LitElement {
  static properties = {
    t: { attribute: false },
    mode: { type: String },
    name: { type: String },
    port: { type: Number },
    _error: { state: true },
  };

  declare t: Translate;
  declare mode: "create" | "settings";
  declare name: string;
  declare port: number | null;
  declare _error: string | null;

  constructor() {
    super();
    this._error = null;
  }

  private _submit(ev: Event) {
    ev.preventDefault();
    const form = this.renderRoot.querySelector("form")!;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    if (name.length < 3 || name.length > 25) {
      this._error = this.t("bridge_name_helper");
      return;
    }
    const detail: { name: string; port?: number } = { name };
    if (this.mode === "settings") {
      const port = Number(data.get("port"));
      if (!Number.isInteger(port) || port < 1024 || port > 65535) {
        this._error = "Port 1024–65535";
        return;
      }
      detail.port = port;
    }
    fire(this, "submit-form", detail);
    this.renderRoot.querySelector<HkmDialog>("hkm-dialog")?.close();
  }

  render() {
    const t = this.t;
    return html`
      <hkm-dialog .heading=${t(this.mode === "create" ? "create_title" : "settings_title")}>
        <form @submit=${this._submit}>
          ${this.mode === "create" ? html`<p class="intro">${t("create_text")}</p>` : nothing}
          <div class="field">
            <label for="name">${t("bridge_name")}</label>
            <input
              id="name"
              name="name"
              .value=${this.name ?? ""}
              minlength="3"
              maxlength="25"
              required
              autocomplete="off"
              autofocus
            />
            <span class="helper">${t("bridge_name_helper")}</span>
          </div>
          ${this.mode === "settings"
            ? html`<div class="field">
                <label for="port">${t("bridge_port")}</label>
                <input
                  id="port"
                  name="port"
                  type="number"
                  min="1024"
                  max="65535"
                  .value=${String(this.port ?? "")}
                  required
                />
                <span class="helper">${t("bridge_port_helper")}</span>
              </div>`
            : nothing}
          ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
          <button type="submit" hidden></button>
        </form>
        <button
          slot="actions"
          class="btn outlined"
          @click=${() => this.renderRoot.querySelector<HkmDialog>("hkm-dialog")?.close()}
        >
          ${t("cancel")}
        </button>
        <button slot="actions" class="btn filled" @click=${this._submit}>
          ${t(this.mode === "create" ? "create" : "save")}
        </button>
      </hkm-dialog>
    `;
  }

  static styles = [
    tokens,
    controls,
    css`
      form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .intro {
        margin: 0;
        color: var(--hkm-text-2);
        line-height: 1.5;
      }
      .error {
        color: var(--hkm-error);
        font-size: 13px;
      }
    `,
  ];
}

/** Choose what to add: a bridge or a standalone accessory. */
export class HkmNewDialog extends LitElement {
  static properties = { t: { attribute: false } };

  declare t: Translate;

  private _choose(kind: "bridge" | "accessory") {
    fire(this, "choose", kind);
    this.renderRoot.querySelector<HkmDialog>("hkm-dialog")?.close();
  }

  render() {
    const t = this.t;
    return html`
      <hkm-dialog .heading=${t("new_title")} wide>
        <div class="options">
          <button class="option" @click=${() => this._choose("bridge")}>
            <span class="option-icon bridge">${icon(mdiHomeAutomation)}</span>
            <span class="option-text">
              <span class="option-title">${t("new_bridge_title")}</span>
              <span class="option-desc">${t("new_bridge_text")}</span>
            </span>
            ${icon(mdiChevronRight, "chev")}
          </button>
          <button class="option" @click=${() => this._choose("accessory")}>
            <span class="option-icon accessory">${icon(mdiTelevision)}</span>
            <span class="option-text">
              <span class="option-title">${t("new_accessory_title")}</span>
              <span class="option-desc">${t("new_accessory_text")}</span>
            </span>
            ${icon(mdiChevronRight, "chev")}
          </button>
        </div>
      </hkm-dialog>
    `;
  }

  static styles = [
    tokens,
    controls,
    css`
      .options {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-bottom: 8px;
      }
      .option {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
        padding: 16px;
        border-radius: 18px;
        border: 1px solid var(--hkm-divider);
        background: var(--hkm-card);
        text-align: left;
        cursor: pointer;
        transition: background-color 0.15s ease, border-color 0.15s ease;
      }
      .option:hover {
        background: var(--hkm-surface-2);
        border-color: var(--hkm-primary);
      }
      .option-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 52px;
        height: 52px;
        border-radius: 16px;
        color: #fff;
      }
      .option-icon svg {
        width: 28px;
        height: 28px;
        fill: currentColor;
      }
      .option-icon.bridge {
        background: linear-gradient(135deg, #29b6f6, #5b3fd9);
      }
      .option-icon.accessory {
        background: linear-gradient(135deg, #ff8a65, #d81b60);
      }
      .option-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .option-title {
        font-weight: 600;
        font-size: 16px;
      }
      .option-desc {
        font-size: 13px;
        line-height: 1.45;
        color: var(--hkm-text-2);
      }
      .chev {
        width: 22px;
        height: 22px;
        fill: var(--hkm-text-2);
        flex: none;
      }
    `,
  ];
}

/** Pick an entity and create a standalone (accessory mode) HomeKit instance. */
export class HkmAccessoryPicker extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    german: { type: Boolean },
    entities: { attribute: false },
    bridgeNames: { attribute: false },
    preselected: { attribute: false },
    _search: { state: true },
    _selected: { state: true },
    _name: { state: true },
    _remove: { state: true },
    _error: { state: true },
  };

  declare hass: HomeAssistant;
  declare t: Translate;
  declare german: boolean;
  declare entities: EntityInfo[];
  declare bridgeNames: Record<string, string>;
  declare preselected: string | null;
  declare _search: string;
  declare _selected: EntityInfo | null;
  declare _name: string;
  declare _remove: boolean;
  declare _error: string | null;

  constructor() {
    super();
    this._search = "";
    this._selected = null;
    this._name = "";
    this._remove = true;
    this._error = null;
  }

  willUpdate(changed: PropertyValues) {
    if (changed.has("preselected") && this.preselected) {
      const entity = this.entities?.find((e) => e.entity_id === this.preselected);
      if (entity) this._pick(entity);
    }
  }

  private _pick(entity: EntityInfo | null) {
    this._selected = entity;
    this._name = entity ? entity.name.slice(0, 25) : "";
    this._remove = true;
    this._error = null;
  }

  private _bridgesOf(entity: EntityInfo) {
    return entity.bridges.map((id) => this.bridgeNames[id]).filter(Boolean);
  }

  private _create() {
    const entity = this._selected;
    if (!entity) return;
    const name = this._name.trim();
    if (name.length < 3 || name.length > 25) {
      this._error = this.t("bridge_name_helper");
      return;
    }
    fire(this, "create-accessory", {
      entityId: entity.entity_id,
      name,
      removeFromBridges: this._remove,
    });
    this.renderRoot.querySelector<HkmDialog>("hkm-dialog")?.close();
  }

  private _icon(entity: EntityInfo) {
    const stateObj = this.hass.states[entity.entity_id];
    if (stateObj && customElements.get("ha-state-icon")) {
      return html`<ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>`;
    }
    return icon(domainIcon(entity.domain));
  }

  private _item(entity: EntityInfo) {
    const type = accessoryTypeLabel(
      entity.accessory_type,
      entity.domain,
      entity.device_class,
      this.german,
    );
    const bridges = this._bridgesOf(entity);
    return html`<button class="item" @click=${() => this._pick(entity)}>
      <span class="item-icon">${this._icon(entity)}</span>
      <span class="item-text">
        <span class="item-name">${entity.name}</span>
        <span class="item-sub">${entity.area ? `${entity.area} · ` : ""}${entity.entity_id}</span>
      </span>
      <span class="item-badges">
        ${type ? html`<span class="badge">${type}</span>` : nothing}
        ${bridges.length
          ? html`<span class="badge">${this.t("badge_other_bridge", { name: bridges[0] })}</span>`
          : nothing}
      </span>
    </button>`;
  }

  private _renderList() {
    const t = this.t;
    const terms = this._search.toLowerCase().split(/\s+/).filter(Boolean);
    const match = (e: EntityInfo) => {
      const hay = `${e.name} ${e.entity_id} ${e.area ?? ""} ${e.device ?? ""}`.toLowerCase();
      return terms.every((term) => hay.includes(term));
    };
    const list = this.entities.filter(match);
    const recommended = list.filter((e) => e.needs_accessory_mode);
    const others = list.filter((e) => !e.needs_accessory_mode);
    return html`
      <p class="intro">${t("picker_text")}</p>
      <div class="search">
        ${icon(mdiMagnify)}
        <input
          type="search"
          placeholder=${t("search")}
          .value=${this._search}
          @input=${(ev: InputEvent) => (this._search = (ev.target as HTMLInputElement).value)}
          autofocus
        />
      </div>
      <div class="list">
        ${recommended.length
          ? html`<div class="section">${icon(mdiStarOutline)} ${t("picker_recommended")}</div>
              ${recommended.map((e) => this._item(e))}`
          : nothing}
        ${others.length
          ? html`<div class="section">${t("picker_others")}</div>
              ${others.map((e) => this._item(e))}`
          : nothing}
        ${list.length ? nothing : html`<div class="none">${t("no_results")}</div>`}
      </div>
    `;
  }

  private _renderForm(entity: EntityInfo) {
    const t = this.t;
    const bridges = this._bridgesOf(entity);
    const type = accessoryTypeLabel(
      entity.accessory_type,
      entity.domain,
      entity.device_class,
      this.german,
    );
    return html`
      <button class="item selected" @click=${() => this._pick(null)}>
        <span class="item-icon">${this._icon(entity)}</span>
        <span class="item-text">
          <span class="item-name">${entity.name}</span>
          <span class="item-sub">${entity.entity_id}</span>
        </span>
        <span class="change">${icon(mdiArrowLeft)} ${t("picker_change")}</span>
      </button>
      <div class="form">
        <div class="field">
          <label for="acc-name">${t("bridge_name")}</label>
          <input
            id="acc-name"
            .value=${this._name}
            maxlength="25"
            autocomplete="off"
            @input=${(ev: InputEvent) => (this._name = (ev.target as HTMLInputElement).value)}
          />
          <span class="helper">${t("accessory_name_helper")}</span>
        </div>
        ${bridges.length
          ? html`<label class="check" @click=${() => (this._remove = !this._remove)}>
              <button
                class="switch"
                role="switch"
                aria-checked=${String(this._remove)}
                aria-label=${t("picker_remove")}
              ></button>
              <span>${t("picker_remove_named", { names: bridges.join(", ") })}</span>
            </label>`
          : nothing}
        ${!entity.needs_accessory_mode
          ? html`<div class="note">${icon(mdiInformationOutline)}<span>${t("picker_not_needed", { type: type ?? "" })}</span></div>`
          : nothing}
        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      </div>
    `;
  }

  render() {
    const t = this.t;
    const entity = this._selected;
    return html`
      <hkm-dialog .heading=${t("picker_title")} wide>
        ${entity ? this._renderForm(entity) : this._renderList()}
        <button
          slot="actions"
          class="btn outlined"
          @click=${() => this.renderRoot.querySelector<HkmDialog>("hkm-dialog")?.close()}
        >
          ${t("cancel")}
        </button>
        <button slot="actions" class="btn filled" ?disabled=${!entity} @click=${this._create}>
          ${t("create")}
        </button>
      </hkm-dialog>
    `;
  }

  static styles = [
    tokens,
    controls,
    css`
      .intro {
        margin: 0 0 14px;
        color: var(--hkm-text-2);
        line-height: 1.5;
        font-size: 14px;
      }
      .search {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 44px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--hkm-divider);
        background: var(--hkm-surface-2);
      }
      .search:focus-within {
        border-color: var(--hkm-primary);
      }
      .search svg {
        width: 20px;
        height: 20px;
        fill: var(--hkm-text-2);
      }
      .search input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        color: var(--hkm-text);
        font: inherit;
        font-size: 15px;
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 12px;
        max-height: min(46vh, 420px);
        overflow-y: auto;
      }
      .section {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 12px 4px 6px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--hkm-text-2);
      }
      .section svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 12px;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }
      .item:hover {
        background: var(--hkm-surface-2);
      }
      .item.selected {
        background: var(--hkm-tint);
        margin-bottom: 18px;
      }
      .item-icon {
        display: grid;
        place-items: center;
        flex: none;
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: var(--hkm-surface-3);
        color: var(--hkm-text-2);
        --mdc-icon-size: 22px;
      }
      .item-icon svg {
        width: 22px;
        height: 22px;
        fill: currentColor;
      }
      .item.selected .item-icon {
        background: var(--hkm-card);
        color: var(--hkm-primary);
      }
      .item-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .item-name {
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-sub {
        font-size: 12px;
        color: var(--hkm-text-2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-badges {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 4px;
        max-width: 45%;
      }
      .change {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--hkm-primary);
        font-weight: 500;
        white-space: nowrap;
      }
      .change svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }
      .none {
        padding: 24px;
        text-align: center;
        color: var(--hkm-text-2);
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .check {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        cursor: pointer;
      }
      .note {
        display: flex;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 12px;
        background: var(--hkm-surface-2);
        font-size: 13px;
        line-height: 1.5;
      }
      .note svg {
        width: 18px;
        height: 18px;
        flex: none;
        fill: var(--hkm-text-2);
      }
      .error {
        color: var(--hkm-error);
        font-size: 13px;
      }
      @media (max-width: 520px) {
        .item-badges {
          display: none;
        }
      }
    `,
  ];
}

const define = (name: string, ctor: CustomElementConstructor) => {
  if (!customElements.get(name)) customElements.define(name, ctor);
};

define("hkm-dialog", HkmDialog);
define("hkm-confirm", HkmConfirm);
define("hkm-bridge-form", HkmBridgeForm);
define("hkm-new-dialog", HkmNewDialog);
define("hkm-accessory-picker", HkmAccessoryPicker);
