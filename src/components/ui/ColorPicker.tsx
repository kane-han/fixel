'use client';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const presetColors = [
  '#ffffff', '#000000', '#f8f9fa', '#dee2e6',
  '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c',
  '#16be63', '#4dabf7', '#7950f2', '#f06595',
];

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-700 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 font-mono"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presetColors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
              value === c ? 'border-primary-500' : 'border-gray-700'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}
