// Neo Dashboard Kit — Entity capability helpers
// Small, defensive helpers that answer "does this entity support feature X?".
// Used by Neo Control so it only renders controls the entity actually supports.
// Everything is attribute-first (works without supported_features) and never
// throws when attributes are missing.

// ── Generic ──────────────────────────────────────────────────
export function isUnavailable(s) {
  const st = s?.state;
  return !s || st === "unavailable" || st === "unknown";
}
export function hasAttribute(s, name) {
  return !!s?.attributes && s.attributes[name] != null;
}
export function hasFeature(s, bit) {
  const f = s?.attributes?.supported_features;
  return typeof f === "number" && (f & bit) !== 0;
}

// ── Light ────────────────────────────────────────────────────
// Dimmable = any color mode other than plain on/off (brightness, color_temp,
// hs, rgb, …). Falls back to the brightness attribute if color modes are absent.
export function supportsBrightness(s) {
  const a = s?.attributes;
  if (!a) return false;
  const modes = a.supported_color_modes;
  if (Array.isArray(modes) && modes.length) {
    return modes.some((m) => m && m !== "onoff" && m !== "unknown");
  }
  return a.brightness != null;
}

// ── Fan (FanEntityFeature: SET_SPEED=1, OSCILLATE=2, DIRECTION=4, PRESET=8) ──
export function supportsFanPercentage(s) { return hasAttribute(s, "percentage") || hasFeature(s, 1); }
export function supportsFanPreset(s) {
  const list = s?.attributes?.preset_modes;
  return (Array.isArray(list) && list.length > 0) || hasFeature(s, 8);
}
export function supportsFanOscillate(s) { return hasAttribute(s, "oscillating") || hasFeature(s, 2); }
export function supportsFanDirection(s) { return hasAttribute(s, "direction") || hasFeature(s, 4); }

// ── Cover (CoverEntityFeature: SET_POSITION=4, SET_TILT_POSITION=128) ────────
export function supportsCoverPosition(s) { return hasAttribute(s, "current_position") || hasFeature(s, 4); }
export function supportsCoverTilt(s) { return hasAttribute(s, "current_tilt_position") || hasFeature(s, 128); }

// ── Climate (ClimateEntityFeature: TARGET_TEMP=1, TARGET_HUMIDITY=4,
//    FAN_MODE=8, PRESET_MODE=16, SWING_MODE=32) ─────────────────────────────
export function supportsClimateTemperature(s) { return hasAttribute(s, "temperature") || hasFeature(s, 1); }
export function supportsClimateHvacModes(s) {
  const m = s?.attributes?.hvac_modes; return Array.isArray(m) && m.length > 0;
}
export function supportsClimatePresetModes(s) {
  const m = s?.attributes?.preset_modes; return Array.isArray(m) && m.length > 0;
}
export function supportsClimateFanModes(s) {
  const m = s?.attributes?.fan_modes; return Array.isArray(m) && m.length > 0;
}
export function supportsClimateSwingModes(s) {
  const m = s?.attributes?.swing_modes; return Array.isArray(m) && m.length > 0;
}
export function supportsClimateHumidity(s) {
  return hasAttribute(s, "humidity") || hasAttribute(s, "target_humidity") || hasFeature(s, 4);
}

// ── Media player (MediaPlayerEntityFeature: VOLUME_SET=4, VOLUME_MUTE=8,
//    SELECT_SOURCE=2048) ──────────────────────────────────────────────────
export function supportsMediaVolume(s) { return hasAttribute(s, "volume_level") || hasFeature(s, 4); }
export function supportsMediaMute(s) { return hasAttribute(s, "is_volume_muted") || hasFeature(s, 8); }
export function supportsMediaSource(s) {
  const list = s?.attributes?.source_list;
  return (Array.isArray(list) && list.length > 0) || hasFeature(s, 2048);
}
