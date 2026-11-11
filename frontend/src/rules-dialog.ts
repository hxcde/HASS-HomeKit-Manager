import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { mdiAutoFix, mdiLabelOutline } from "@mdi/js";
import { previewRule, type EntitiesResponse, type HomeAssistant, type Rule } from "./api";
import { fire, type HkmDialog } from "./dialogs";
import type { Translate } from "./i18n";
import { CATEGORIES } from "./meta";
import { controls, icon, tokens } from "./styles";

/** Automatic assignment by label, floor, area and type. Emits ``save-rule``. */
export class HkmRulesDialog extends LitElement {
  static properties = {
    hass: { attribute: false },
    t: { attribute: false },
    entryId: { type: String },
    rule: { attribute: false },
    data: { attribute: false },
    _enabled: { state: true },
    _labels: { state: true },
    _floors: { state: true },
    _areas: { state: true },
    _categories: { state: true },
    _reset: { state: true },
    _preview: { state: true },
  };

  declare hass: HomeAssistant;
  declare t: Translate;
  declare entryId: string;
  declare rule: Rule | null;
  declare data: EntitiesResponse;
  declare _enabled: boolean;
  declare _labels: Set<string>;
  declare _floors: Set<string>;
  declare _areas: Set<string>;
  declare _categories: Set<string>;
  declare _reset: boolean;
  declare _preview: string[] | null;

  private _timer?: number;

  willUpdate(changed: PropertyValues) {
    if (changed.has("rule")) {
      const rule = this.rule;
      this._enabled = rule ? rule.enabled : true;
      this._labels = new Set(rule?.labels ?? []);
      this._floors = new Set(rule?.floors ?? []);
      this._areas = new Set(rule?.areas ?? []);
      const domains = new Set(rule?.domains ?? []);
      this._categories = new Set(
        CATEGORIES.filter((c) => c.domains.some((d) => domains.has(d))).map((c) => c.id),
      );
      this._reset = false;
      this._schedulePreview();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.clearTimeout(this._timer);
  }

  private get _domains() {
    return CATEGORIES.filter((c) => this._categories.has(c.id)).flatMap((c) => c.domains);
  }

  private _schedulePreview() {
    window.clearTimeout(this._timer);
    this._timer = window.setTimeout(async () => {
      try {
        this._preview = await previewRule(this.hass, this.entryId, {
          labels: [...this._labels],
          areas: [...this._areas],
          floors: [...this._floors],
          domains: this._domains,
        });
      } catch {
        this._preview = null;
      }
    }, 250);
  }

  private _toggle(set: "_labels" | "_floors" | "_areas" | "_categories", id: string) {
    const next = new Set(this[set]);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this[set] = next;
    this._schedulePreview();
  }

  private _save() {
    fire(this, "save-rule", {
      rule: {
        enabled: this._enabled,
        labels: [...this._labels],
        areas: [...this._areas],
        floors: [...this._floors],
        domains: this._domains,
      },
      reset: this._reset,
    });
    this.renderRoot.querySelector<HkmDialog>("hkm-dialog")?.close();
  }

  private _chips(
    entries: [string, string][],
    set: "_labels" | "_floors" | "_areas" | "_categories",
    color?: (id: string) => string | null,
  ) {
    return html`<div class="chips">
      ${entries.map(([id, name]) => {
        const c = color?.(id);
        return html`<button
          class="chip"
          aria-pressed=${String(this[set].has(id))}
          @click=${() => this._toggle(set, id)}
        >
          ${c ? html`<span class="swatch" style="background:${c}"></span>` : nothing}${name}
        </button>`;
      })}
    </div>`;
  }

  render() {
    const t = this.t;
    const data = this.data;
    const labels = Object.entries(data.labels ?? {});
    const floors = Object.entries(data.floors ?? {});
    const areas = Object.entries(data.areas ?? {});
    const names = new Map(data.entities.map((e) => [e.entity_id, e.name]));
    const preview = this._preview;
    const hasCriteria =
      this._labels.size + this._floors.size + this._areas.size + this._categories.size > 0;
    const excluded = this.rule?.exclude.length ?? 0;
    const labelColor = (id: string) => {
      const color = data.labels[id]?.color;
      if (!color) return null;
      return color.startsWith("#") ? color : `var(--${color}-color, ${color})`;
    };
    return html`
      <hkm-dialog .heading=${t("rules_title")} wide>
        <div slot="icon" class="hero-icon">${icon(mdiAutoFix)}</div>
        <p class="intro">${t("rules_text")}</p>

        <label class="enable" @click=${() => (this._enabled = !this._enabled)}>
          <span>
            <span class="enable-title">${t("rules_enabled")}</span>
            <span class="enable-sub">${t("rules_enabled_helper")}</span>
          </span>
          <button class="switch" role="switch" aria-checked=${String(this._enabled)}></button>
        </label>

        <section>
          <h3>${icon(mdiLabelOutline)} ${t("rules_labels")}</h3>
          ${labels.length
            ? this._chips(
                labels.map(([id, l]) => [id, l.name]),
                "_labels",
                labelColor,
              )
            : html`<p class="hint">${t("rules_no_labels")}</p>`}
        </section>
        ${floors.length
          ? html`<section>
              <h3>${t("rules_floors")}</h3>
              ${this._chips(floors, "_floors")}
            </section>`
          : nothing}
        ${areas.length
          ? html`<section>
              <h3>${t("rules_areas")}</h3>
              ${this._chips(areas, "_areas")}
            </section>`
          : nothing}
        <section>
          <h3>${t("rules_types")}</h3>
          <p class="hint">${t("rules_types_helper")}</p>
          ${this._chips(
            CATEGORIES.map((c) => [c.id, t(c.label)]),
            "_categories",
          )}
        </section>

        <div class="preview ${hasCriteria ? "" : "empty"}">
          ${!hasCriteria
            ? t("rules_none")
            : preview === null
              ? html`<span class="spinner"></span>`
              : html`<strong>${t("rules_preview", { count: preview.length })}</strong>
                  ${preview.length
                    ? html`<div class="names">
                        ${preview
                          .slice(0, 12)
                          .map((id) => names.get(id) ?? id)
                          .join(", ")}${preview.length > 12 ? " …" : ""}
                      </div>`
                    : nothing}`}
        </div>

        ${excluded
          ? html`<label class="enable small" @click=${() => (this._reset = !this._reset)}>
              <span class="enable-sub">${t("rules_excluded", { count: excluded })}</span>
              <button class="switch" role="switch" aria-checked=${String(this._reset)}></button>
            </label>`
          : nothing}

        <button
          slot="actions"
          class="btn outlined"
          @click=${() => this.renderRoot.querySelector<HkmDialog>("hkm-dialog")?.close()}
        >
          ${t("cancel")}
        </button>
        <button slot="actions" class="btn filled" @click=${this._save}>${t("save")}</button>
      </hkm-dialog>
    `;
  }

  static styles = [
    tokens,
    controls,
    css`
      .hero-icon {
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: var(--hkm-tint);
        flex: none;
      }
      .hero-icon svg {
        width: 24px;
        height: 24px;
        fill: var(--hkm-primary);
      }
      .intro {
        margin: 0 0 16px;
        color: var(--hkm-text-2);
        line-height: 1.5;
        font-size: 14px;
      }
      .enable {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 16px;
        border-radius: 14px;
        background: var(--hkm-surface-2);
        cursor: pointer;
      }
      .enable.small {
        margin-top: 14px;
        padding: 10px 14px;
      }
      .enable > span {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .enable-title {
        font-weight: 500;
      }
      .enable-sub {
        font-size: 12px;
        color: var(--hkm-text-2);
      }
      section {
        margin-top: 18px;
      }
      h3 {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0 0 10px;
        font-size: 14px;
        font-weight: 600;
      }
      h3 svg {
        width: 18px;
        height: 18px;
        fill: var(--hkm-text-2);
      }
      .hint {
        margin: -4px 0 10px;
        font-size: 12px;
        color: var(--hkm-text-2);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .swatch {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .preview {
        margin-top: 20px;
        padding: 14px 16px;
        border-radius: 14px;
        background: var(--hkm-tint);
        font-size: 14px;
        line-height: 1.5;
        min-height: 22px;
      }
      .preview.empty {
        background: var(--hkm-surface-2);
        color: var(--hkm-text-2);
      }
      .names {
        margin-top: 4px;
        font-size: 13px;
        color: var(--hkm-text-2);
      }
    `,
  ];
}

if (!customElements.get("hkm-rules-dialog")) {
  customElements.define("hkm-rules-dialog", HkmRulesDialog);
}
