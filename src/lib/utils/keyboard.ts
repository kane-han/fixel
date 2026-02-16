type ShortcutHandler = () => void;

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  handler: ShortcutHandler;
}

export function createKeyboardHandler(shortcuts: Shortcut[]) {
  return (e: KeyboardEvent) => {
    for (const s of shortcuts) {
      const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
      const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;

      if (e.key.toLowerCase() === s.key.toLowerCase() && ctrlMatch && shiftMatch) {
        e.preventDefault();
        s.handler();
        return;
      }
    }
  };
}
