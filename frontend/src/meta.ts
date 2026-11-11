/** Labels and icons for domains, categories and HomeKit accessory types. */

import {
  mdiAirFilter,
  mdiAlarmLight,
  mdiAccountMultiple,
  mdiBlindsHorizontal,
  mdiCctv,
  mdiCheckboxMarkedCircleOutline,
  mdiDotsHorizontal,
  mdiFan,
  mdiFormatListBulleted,
  mdiLightbulb,
  mdiLock,
  mdiPaletteOutline,
  mdiRemoteTv,
  mdiRobotVacuum,
  mdiThermometer,
  mdiToggleSwitchOutline,
  mdiGauge,
  mdiTelevision,
  mdiWaterPump,
} from "@mdi/js";
import type { StringKey } from "./i18n";

export interface Category {
  id: string;
  label: StringKey;
  icon: string;
  domains: string[];
}

export const CATEGORIES: Category[] = [
  { id: "light", label: "cat_light", icon: mdiLightbulb, domains: ["light"] },
  {
    id: "switch",
    label: "cat_switch",
    icon: mdiToggleSwitchOutline,
    domains: ["switch", "input_boolean"],
  },
  {
    id: "climate",
    label: "cat_climate",
    icon: mdiThermometer,
    domains: ["climate", "fan", "humidifier", "water_heater"],
  },
  { id: "cover", label: "cat_cover", icon: mdiBlindsHorizontal, domains: ["cover", "valve"] },
  { id: "sensor", label: "cat_sensor", icon: mdiGauge, domains: ["sensor", "binary_sensor"] },
  {
    id: "security",
    label: "cat_security",
    icon: mdiLock,
    domains: ["alarm_control_panel", "lock", "camera"],
  },
  { id: "media", label: "cat_media", icon: mdiTelevision, domains: ["media_player", "remote"] },
  {
    id: "scene",
    label: "cat_scene",
    icon: mdiPaletteOutline,
    domains: ["scene", "script", "automation", "button", "input_button"],
  },
  {
    id: "select",
    label: "cat_select",
    icon: mdiFormatListBulleted,
    domains: ["select", "input_select"],
  },
  {
    id: "appliance",
    label: "cat_appliance",
    icon: mdiRobotVacuum,
    domains: ["vacuum", "lawn_mower"],
  },
  {
    id: "presence",
    label: "cat_presence",
    icon: mdiAccountMultiple,
    domains: ["person", "device_tracker"],
  },
];

const OTHER: Category = { id: "other", label: "cat_other", icon: mdiDotsHorizontal, domains: [] };

const DOMAIN_TO_CATEGORY = new Map<string, Category>();
for (const cat of CATEGORIES) for (const d of cat.domains) DOMAIN_TO_CATEGORY.set(d, cat);

export const categoryOf = (domain: string): Category => DOMAIN_TO_CATEGORY.get(domain) ?? OTHER;

/** Fallback icons when <ha-state-icon> is not available. */
const DOMAIN_ICONS: Record<string, string> = {
  light: mdiLightbulb,
  switch: mdiToggleSwitchOutline,
  input_boolean: mdiToggleSwitchOutline,
  climate: mdiThermometer,
  fan: mdiFan,
  humidifier: mdiAirFilter,
  water_heater: mdiWaterPump,
  cover: mdiBlindsHorizontal,
  valve: mdiWaterPump,
  sensor: mdiGauge,
  binary_sensor: mdiCheckboxMarkedCircleOutline,
  alarm_control_panel: mdiAlarmLight,
  lock: mdiLock,
  camera: mdiCctv,
  media_player: mdiTelevision,
  remote: mdiRemoteTv,
  vacuum: mdiRobotVacuum,
};

export const domainIcon = (domain: string): string =>
  DOMAIN_ICONS[domain] ?? categoryOf(domain).icon;

type Labels = { de: string; en: string };

const TYPE_LABELS: Record<string, Labels> = {
  SecuritySystem: { de: "Alarmanlage", en: "Security system" },
  BinarySensor: { de: "Sensor", en: "Sensor" },
  Thermostat: { de: "Thermostat", en: "Thermostat" },
  HeaterCooler: { de: "Heiz-/Kühlgerät", en: "Heater/cooler" },
  OzoneSensor: { de: "Luftqualität (O₃)", en: "Air quality (O₃)" },
  SulphurDioxideSensor: { de: "Luftqualität (SO₂)", en: "Air quality (SO₂)" },
  GarageDoorOpener: { de: "Garagentor", en: "Garage door" },
  Window: { de: "Fenster", en: "Window" },
  Door: { de: "Tür", en: "Door" },
  WindowCovering: { de: "Rollladen", en: "Window covering" },
  WindowCoveringBasic: { de: "Rollladen", en: "Window covering" },
  Fan: { de: "Ventilator", en: "Fan" },
  AirPurifier: { de: "Luftreiniger", en: "Air purifier" },
  HumidifierDehumidifier: { de: "Luftbefeuchter", en: "Humidifier" },
  Light: { de: "Licht", en: "Light" },
  Lock: { de: "Schloss", en: "Lock" },
  ReceiverMediaPlayer: { de: "Receiver", en: "Receiver" },
  TelevisionMediaPlayer: { de: "Fernseher", en: "Television" },
  MediaPlayer: { de: "Mediaplayer", en: "Media player" },
  TemperatureSensor: { de: "Temperatur", en: "Temperature" },
  HumiditySensor: { de: "Luftfeuchtigkeit", en: "Humidity" },
  PM10Sensor: { de: "Luftqualität (PM10)", en: "Air quality (PM10)" },
  PM25Sensor: { de: "Luftqualität (PM2.5)", en: "Air quality (PM2.5)" },
  NitrogenDioxideSensor: { de: "Luftqualität (NO₂)", en: "Air quality (NO₂)" },
  VolatileOrganicCompoundsSensor: { de: "Luftqualität (VOC)", en: "Air quality (VOC)" },
  AirQualitySensor: { de: "Luftqualität", en: "Air quality" },
  CarbonMonoxideSensor: { de: "Kohlenmonoxid", en: "Carbon monoxide" },
  CarbonDioxideSensor: { de: "CO₂", en: "CO₂" },
  LightSensor: { de: "Helligkeit", en: "Light level" },
  Switch: { de: "Schalter", en: "Switch" },
  Outlet: { de: "Steckdose", en: "Outlet" },
  ValveSwitch: { de: "Ventil", en: "Valve" },
  Valve: { de: "Ventil", en: "Valve" },
  Vacuum: { de: "Saugroboter", en: "Vacuum" },
  LawnMower: { de: "Mähroboter", en: "Lawn mower" },
  ActivityRemote: { de: "Fernbedienung", en: "Remote" },
  SelectSwitch: { de: "Auswahlschalter", en: "Select switch" },
  WaterHeater: { de: "Warmwasser", en: "Water heater" },
  Camera: { de: "Kamera", en: "Camera" },
};

const BINARY_SENSOR_LABELS: Record<string, Labels> = {
  motion: { de: "Bewegungsmelder", en: "Motion sensor" },
  occupancy: { de: "Präsenzmelder", en: "Occupancy sensor" },
  presence: { de: "Präsenzmelder", en: "Occupancy sensor" },
  door: { de: "Kontaktsensor", en: "Contact sensor" },
  garage_door: { de: "Kontaktsensor", en: "Contact sensor" },
  opening: { de: "Kontaktsensor", en: "Contact sensor" },
  window: { de: "Kontaktsensor", en: "Contact sensor" },
  smoke: { de: "Rauchmelder", en: "Smoke detector" },
  moisture: { de: "Wassersensor", en: "Leak sensor" },
  carbon_monoxide: { de: "CO-Melder", en: "CO detector" },
  gas: { de: "CO-Melder", en: "CO detector" },
};

/** Labels for the user selectable "type" entity option. */
const OPTION_LABELS: Record<string, Labels> = {
  switch: { de: "Schalter", en: "Switch" },
  outlet: { de: "Steckdose", en: "Outlet" },
  valve: { de: "Ventil", en: "Valve" },
  faucet: { de: "Wasserhahn", en: "Faucet" },
  shower: { de: "Dusche", en: "Shower" },
  sprinkler: { de: "Bewässerung", en: "Sprinkler" },
  fan: { de: "Ventilator", en: "Fan" },
  air_purifier: { de: "Luftreiniger", en: "Air purifier" },
  thermostat: { de: "Thermostat", en: "Thermostat" },
  heater_cooler: { de: "Heiz-/Kühlgerät (Klimaanlage)", en: "Heater/cooler (AC)" },
};

const pick = (labels: Labels | undefined, german: boolean, fallback: string) =>
  labels ? (german ? labels.de : labels.en) : fallback;

export const optionLabel = (option: string, german: boolean) =>
  pick(OPTION_LABELS[option], german, option);

export const accessoryTypeLabel = (
  type: string | null,
  domain: string,
  deviceClass: string | null,
  german: boolean,
): string | null => {
  if (!type) return null;
  if (type === "BinarySensor") {
    if (domain === "person" || domain === "device_tracker") {
      return german ? "Anwesenheit" : "Presence";
    }
    if (deviceClass && BINARY_SENSOR_LABELS[deviceClass]) {
      return pick(BINARY_SENSOR_LABELS[deviceClass], german, type);
    }
  }
  return pick(TYPE_LABELS[type], german, type);
};

/** Accessory type resulting from a configured "type" option. */
export const typeFromOption = (domain: string, option: string | null | undefined) => {
  if (!option) return null;
  if (domain === "switch") {
    if (option === "outlet") return "Outlet";
    if (option === "switch") return "Switch";
    return "ValveSwitch";
  }
  if (domain === "fan") return option === "air_purifier" ? "AirPurifier" : "Fan";
  if (domain === "climate") return option === "heater_cooler" ? "HeaterCooler" : "Thermostat";
  return null;
};

const LINK_LABELS: Record<string, Labels> = {
  linked_battery_sensor: { de: "Batteriesensor", en: "Battery sensor" },
  linked_battery_charging_sensor: { de: "Ladezustand (lädt)", en: "Battery charging" },
  linked_motion_sensor: { de: "Bewegungsmelder", en: "Motion sensor" },
  linked_doorbell_sensor: { de: "Türklingel", en: "Doorbell" },
  linked_humidity_sensor: { de: "Luftfeuchtigkeit", en: "Humidity sensor" },
  linked_pm25_sensor: { de: "Feinstaub (PM2.5)", en: "PM2.5 sensor" },
  linked_temperature_sensor: { de: "Temperatur", en: "Temperature sensor" },
  linked_filter_change_indication_binary_sensor: {
    de: "Filterwechsel nötig",
    en: "Filter change indicator",
  },
  linked_filter_life_level_sensor: { de: "Filter-Restlaufzeit", en: "Filter life level" },
  linked_obstruction_sensor: { de: "Hinderniserkennung", en: "Obstruction sensor" },
};

const MEDIA_FEATURE_LABELS: Record<string, Labels> = {
  on_off: { de: "Ein/Aus", en: "On/off" },
  play_pause: { de: "Wiedergabe/Pause", en: "Play/pause" },
  play_stop: { de: "Wiedergabe/Stopp", en: "Play/stop" },
  toggle_mute: { de: "Stummschalten", en: "Mute" },
};

export const linkLabel = (key: string, german: boolean) => pick(LINK_LABELS[key], german, key);

export const mediaFeatureLabel = (key: string, german: boolean) =>
  pick(MEDIA_FEATURE_LABELS[key], german, key);

export const isBatteryLink = (key: string) =>
  key === "linked_battery_sensor" || key === "linked_battery_charging_sensor";
