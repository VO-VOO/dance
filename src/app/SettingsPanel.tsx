import type { TextSettings } from './types'

type SettingsPanelProps = {
  settings: TextSettings
  onSettingsChange: (next: TextSettings) => void
  shortcutsEnabled: boolean
  onShortcutsToggle: () => void
  reducedMotion: boolean
  reducedMotionSource: 'system' | 'manual'
  onReducedMotionChange: (value: boolean | null) => void
}

const COLOR_PRESETS = [
  { label: '墨黑', value: '#1f1b18' },
  { label: '深灰', value: '#37322d' },
  { label: '冷白', value: '#e6e6e6' },
  { label: '强调蓝', value: '#2c4f6b' },
]

export function SettingsPanel({
  settings,
  onSettingsChange,
  shortcutsEnabled,
  onShortcutsToggle,
  reducedMotion,
  reducedMotionSource,
  onReducedMotionChange,
}: SettingsPanelProps) {
  return (
    <details className="settings-panel">
      <summary>显示设置</summary>
      <div className="settings-grid">
        <label className="settings-row" htmlFor="text-scale">
          <span>文字缩放</span>
          <input
            id="text-scale"
            type="range"
            min={0.85}
            max={1.25}
            step={0.05}
            value={settings.textScale}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                textScale: Number(event.target.value),
              })
            }
          />
        </label>

        <label className="settings-row" htmlFor="text-color">
          <span>文字颜色</span>
          <select
            id="text-color"
            value={settings.textColor}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                textColor: event.target.value,
              })
            }
          >
            {COLOR_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <label className="settings-row" htmlFor="reduced-motion-toggle">
          <span>减少动态</span>
          <input
            id="reduced-motion-toggle"
            type="checkbox"
            checked={reducedMotion}
            onChange={(event) => onReducedMotionChange(event.target.checked)}
          />
        </label>

        <div className="settings-actions">
          <button type="button" onClick={onShortcutsToggle}>
            {shortcutsEnabled ? '关闭快捷键' : '开启快捷键'}
          </button>
          <button type="button" onClick={() => onReducedMotionChange(null)}>
            跟随系统
          </button>
        </div>

        <p className="settings-hint">当前动态策略：{reducedMotionSource === 'manual' ? '手动' : '系统'}</p>
      </div>
    </details>
  )
}
