import { css, html, svg } from "lit";

/** Design tokens derived from the active Home Assistant theme. */
export const tokens = css`
  :host {
    --hkm-primary: var(--primary-color, #03a9f4);
    --hkm-on-primary: var(--text-primary-color, #fff);
    --hkm-bg: var(--primary-background-color, #f6f7f9);
    --hkm-card: var(--card-background-color, var(--ha-card-background, #fff));
    --hkm-text: var(--primary-text-color, #1c1c1e);
    --hkm-text-2: var(--secondary-text-color, #6b7280);
    --hkm-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --hkm-success: var(--success-color, #2e9d5b);
    --hkm-warning: var(--warning-color, #e8a317);
    --hkm-error: var(--error-color, #db4437);
    --hkm-radius: var(--ha-card-border-radius, 16px);
    --hkm-radius-s: 10px;
    --hkm-shadow: var(
      --ha-card-box-shadow,
      0 1px 2px rgba(0, 0, 0, 0.06),
      0 2px 8px rgba(0, 0, 0, 0.04)
    );
    --hkm-tint: color-mix(in srgb, var(--hkm-primary) 12%, transparent);
    --hkm-tint-strong: color-mix(in srgb, var(--hkm-primary) 22%, transparent);
    --hkm-surface-2: color-mix(in srgb, var(--hkm-text) 4%, var(--hkm-card));
    --hkm-surface-3: color-mix(in srgb, var(--hkm-text) 8%, var(--hkm-card));
  }
`;

export const controls = css`
  button {
    font: inherit;
    color: inherit;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 40px;
    padding: 0 18px;
    border-radius: 999px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--hkm-primary);
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 0.01em;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  }
  .btn svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
    flex: none;
  }
  .btn:hover {
    background: var(--hkm-tint);
  }
  .btn:focus-visible {
    outline: 2px solid var(--hkm-primary);
    outline-offset: 2px;
  }
  .btn[disabled] {
    opacity: 0.45;
    pointer-events: none;
  }
  .btn.filled {
    background: var(--hkm-primary);
    color: var(--hkm-on-primary);
    box-shadow: 0 1px 3px color-mix(in srgb, var(--hkm-primary) 40%, transparent);
  }
  .btn.filled:hover {
    background: color-mix(in srgb, var(--hkm-primary) 88%, black);
  }
  .btn.tonal {
    background: var(--hkm-tint);
  }
  .btn.tonal:hover {
    background: var(--hkm-tint-strong);
  }
  .btn.outlined {
    border-color: var(--hkm-divider);
    color: var(--hkm-text);
  }
  .btn.outlined:hover {
    background: var(--hkm-surface-2);
  }
  .btn.danger {
    color: var(--hkm-error);
  }
  .btn.danger:hover {
    background: color-mix(in srgb, var(--hkm-error) 10%, transparent);
  }
  .btn.filled.danger {
    background: var(--hkm-error);
    color: #fff;
  }
  .btn.small {
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
  }
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  .icon-btn:hover {
    background: var(--hkm-surface-3);
  }
  .icon-btn svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
  }

  /* Toggle switch */
  .switch {
    position: relative;
    flex: none;
    width: 46px;
    height: 28px;
    border-radius: 999px;
    border: none;
    padding: 0;
    background: var(--hkm-surface-3);
    box-shadow: inset 0 0 0 1px var(--hkm-divider);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .switch::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s cubic-bezier(0.3, 0.7, 0.4, 1.2);
  }
  .switch[aria-checked="true"] {
    background: var(--hkm-primary);
    box-shadow: none;
  }
  .switch[aria-checked="true"]::after {
    transform: translateX(18px);
  }
  .switch:focus-visible {
    outline: 2px solid var(--hkm-primary);
    outline-offset: 2px;
  }
  .switch[disabled] {
    opacity: 0.4;
    cursor: default;
  }

  /* Text fields */
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field label {
    font-size: 13px;
    font-weight: 500;
    color: var(--hkm-text-2);
  }
  .field input,
  .field select {
    font: inherit;
    font-size: 15px;
    height: 44px;
    padding: 0 14px;
    border-radius: var(--hkm-radius-s);
    border: 1px solid var(--hkm-divider);
    background: var(--hkm-surface-2);
    color: var(--hkm-text);
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .field input:focus,
  .field select:focus {
    border-color: var(--hkm-primary);
    box-shadow: 0 0 0 3px var(--hkm-tint);
  }
  .field .helper {
    font-size: 12px;
    color: var(--hkm-text-2);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid var(--hkm-divider);
    background: var(--hkm-card);
    color: var(--hkm-text);
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }
  .chip svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
  .chip:hover {
    background: var(--hkm-surface-2);
  }
  .chip[aria-pressed="true"] {
    background: var(--hkm-tint);
    border-color: transparent;
    color: var(--hkm-primary);
    font-weight: 500;
  }
  .chip .count {
    font-variant-numeric: tabular-nums;
    color: var(--hkm-text-2);
    font-size: 12px;
  }
  .chip[aria-pressed="true"] .count {
    color: inherit;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 20px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    background: var(--hkm-surface-3);
    color: var(--hkm-text-2);
  }
  .badge svg {
    width: 13px;
    height: 13px;
    fill: currentColor;
  }
  .badge.primary {
    background: var(--hkm-tint);
    color: var(--hkm-primary);
  }
  .badge.success {
    background: color-mix(in srgb, var(--hkm-success) 14%, transparent);
    color: var(--hkm-success);
  }
  .badge.warning {
    background: color-mix(in srgb, var(--hkm-warning) 18%, transparent);
    color: color-mix(in srgb, var(--hkm-warning) 70%, var(--hkm-text));
  }
  .badge.error {
    background: color-mix(in srgb, var(--hkm-error) 12%, transparent);
    color: var(--hkm-error);
  }

  .spinner {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2.5px solid var(--hkm-tint-strong);
    border-top-color: var(--hkm-primary);
    animation: hkm-spin 0.8s linear infinite;
    flex: none;
  }
  @keyframes hkm-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/** Render an MDI path as inline SVG. */
export const icon = (path: string, cls = "") =>
  html`<svg class=${cls} viewBox="0 0 24 24" aria-hidden="true">${svg`<path d=${path}></path>`}</svg>`;
