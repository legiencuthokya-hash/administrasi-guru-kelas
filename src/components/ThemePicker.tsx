import React from 'react';
import { TemaWarnaId } from '../types';
import { THEME_LIST, getThemeConfig, ThemeConfig } from '../services/theme';
import { Check, Sparkles, Palette, ShieldCheck, User } from 'lucide-react';

interface ThemePickerProps {
  currentTheme: TemaWarnaId;
  onSelectTheme: (id: TemaWarnaId) => void;
  title?: string;
  subtitle?: string;
  isAdmin?: boolean;
  isSchoolDefault?: boolean;
  onSetSchoolDefault?: (id: TemaWarnaId) => void;
  compact?: boolean;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  currentTheme,
  onSelectTheme,
  title = 'Pilihan Warna & Tema Halaman',
  subtitle = 'Pilih kombinasi warna tampilan yang sesuai dengan kenyamanan dan selera Anda.',
  isAdmin = false,
  isSchoolDefault = false,
  onSetSchoolDefault,
  compact = false,
}) => {
  const activeConfig = getThemeConfig(currentTheme);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4" style={{ color: activeConfig.hex }} />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">Tema Terpilih:</span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: activeConfig.hex }}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {activeConfig.name}
            </span>
          </div>
        </div>
      )}

      {/* Grid of Themes */}
      <div
        className={`grid gap-3 ${
          compact
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {THEME_LIST.map((theme: ThemeConfig) => {
          const isSelected = currentTheme === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`group relative rounded-xl border p-3.5 transition cursor-pointer text-left flex flex-col justify-between ${
                isSelected
                  ? 'border-2 bg-white shadow-md ring-2 ring-offset-1'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
              style={{
                borderColor: isSelected ? theme.hex : undefined,
                // ringColor is applied inline below
              }}
            >
              <div>
                {/* Top bar with colors and checkmark */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    {/* Primary circle */}
                    <div
                      className="w-6 h-6 rounded-full shadow-xs flex items-center justify-center text-white border-2 border-white"
                      style={{ backgroundColor: theme.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    {/* Secondary circle */}
                    <div
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: theme.secondaryHex }}
                    />
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {theme.category}
                  </span>
                </div>

                {/* Theme Title */}
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                  <span>{theme.name}</span>
                  {isSelected && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.2 rounded text-white"
                      style={{ backgroundColor: theme.hex }}
                    >
                      Aktif
                    </span>
                  )}
                </div>

                {/* Tagline */}
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                  {theme.tagline}
                </p>
              </div>

              {/* Mini Preview Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                <div
                  className="h-2 rounded-full flex-1"
                  style={{
                    background: `linear-gradient(90deg, ${theme.hex} 0%, ${theme.secondaryHex} 100%)`,
                  }}
                />
                <span className="text-[10px] font-mono text-slate-400 font-medium">
                  {theme.hex}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin option to set as School Default */}
      {isAdmin && onSetSchoolDefault && (
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                Jadikan Sebagai Tema Baku Sekolah (Default Semua Guru)
              </p>
              <p className="text-[11px] text-slate-500">
                Guru baru atau guru yang belum menyetel warna khusus akan menggunakan tema ini.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSetSchoolDefault(currentTheme)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Terapkan untuk Sekolah</span>
          </button>
        </div>
      )}
    </div>
  );
};
