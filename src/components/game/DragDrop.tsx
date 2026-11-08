import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Animated, PanResponder, Platform, Pressable, ViewStyle } from 'react-native';

/**
 * Tiny drag & drop system built on PanResponder (works on Android, iOS and web).
 * Kids can also TAP a card then TAP a place — same result as dragging.
 */

type Rect = { x: number; y: number; w: number; h: number };
type HostRef = any; // native host component instance (has .measure)
type ZoneEntry = { ref: HostRef; disabled?: boolean };

type Ctx<T> = {
  selected: T | null;
  select: (item: T | null) => void;
  hovered: string | null;
  register: (id: string, entry: ZoneEntry) => void;
  unregister: (id: string) => void;
  beginDrag: () => Promise<void>;
  moveDrag: (x: number, y: number) => void;
  endDrag: (item: T, x: number, y: number) => void;
  zonePressed: (id: string) => void;
  dragging: boolean;
  tapItem: (item: T) => void;
};

const DndCtx = createContext<Ctx<any> | null>(null);

function measure(ref: HostRef): Promise<Rect | null> {
  return new Promise((resolve) => {
    if (!ref) return resolve(null);
    try {
      ref.measure((_x: number, _y: number, w: number, h: number, pageX: number, pageY: number) => resolve({ x: pageX, y: pageY, w, h }));
    } catch {
      resolve(null);
    }
  });
}

export function DndProvider<T>({
  children,
  onDrop,
  onDragChange,
  autoTarget,
}: {
  children: ReactNode;
  onDrop: (item: T, zoneId: string) => void;
  onDragChange?: (dragging: boolean) => void;
  /** when set, simply tapping a card drops it on this zone */
  autoTarget?: string | null;
}) {
  const zones = useRef(new Map<string, ZoneEntry>());
  const rects = useRef(new Map<string, Rect>());
  const [selected, setSelected] = useState<T | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const onDropRef = useRef(onDrop);
  useEffect(() => {
    onDropRef.current = onDrop;
  }, [onDrop]);

  const hit = (x: number, y: number) => {
    for (const [id, r] of rects.current) {
      const pad = 10; // forgiving targets for small fingers
      if (x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad) return id;
    }
    return null;
  };

  const value = useMemo<Ctx<T>>(
    () => ({
      selected,
      select: setSelected,
      hovered,
      dragging,
      register: (id, entry) => zones.current.set(id, entry),
      unregister: (id) => zones.current.delete(id),
      beginDrag: async () => {
        setDragging(true);
        onDragChange?.(true);
        rects.current.clear();
        const entries = [...zones.current.entries()].filter(([, z]) => !z.disabled);
        const measured = await Promise.all(entries.map(([, z]) => measure(z.ref)));
        entries.forEach(([id], i) => {
          const r = measured[i];
          if (r) rects.current.set(id, r);
        });
      },
      moveDrag: (x, y) => {
        const id = hit(x, y);
        setHovered((h) => (h === id ? h : id));
      },
      endDrag: (item, x, y) => {
        const id = hit(x, y);
        setHovered(null);
        setDragging(false);
        onDragChange?.(false);
        setSelected(null);
        if (id) onDropRef.current(item, id);
      },
      tapItem: (item) => {
        if (autoTarget) {
          setSelected(null);
          onDropRef.current(item, autoTarget);
          return;
        }
        setSelected((cur) => (cur === item ? null : item));
      },
      zonePressed: (id) => {
        if (selected === null) return;
        const item = selected;
        setSelected(null);
        onDropRef.current(item, id);
      },
    }),
    [selected, hovered, dragging, onDragChange, autoTarget]
  );

  return <DndCtx.Provider value={value}>{children}</DndCtx.Provider>;
}

export function useDnd<T>() {
  const ctx = useContext(DndCtx);
  if (!ctx) throw new Error('useDnd outside DndProvider');
  return ctx as Ctx<T>;
}

const webNoTouch: ViewStyle =
  Platform.OS === 'web' ? ({ touchAction: 'none', userSelect: 'none', cursor: 'grab' } as any) : {};

export function Draggable<T>({
  item,
  children,
  disabled,
  style,
}: {
  item: T;
  children: (state: { selected: boolean; dragging: boolean }) => ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const ctx = useDnd<T>();
  const pos = useState(() => new Animated.ValueXY())[0];
  const [lifted, setLifted] = useState(false);
  const ctxRef = useRef(ctx);
  const itemRef = useRef(item);
  const disabledRef = useRef(disabled);
  useEffect(() => {
    ctxRef.current = ctx;
    itemRef.current = item;
    disabledRef.current = disabled;
  }, [ctx, item, disabled]);
  const moved = useRef(false);

  // refs are only read inside the gesture callbacks (never during render)
  const responder = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabledRef.current,
        onMoveShouldSetPanResponder: () => !disabledRef.current,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          moved.current = false;
          pos.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: (_e, g) => {
          if (!moved.current && Math.abs(g.dx) + Math.abs(g.dy) > 8) {
            moved.current = true;
            setLifted(true);
            ctxRef.current.beginDrag();
          }
          if (moved.current) {
            pos.setValue({ x: g.dx, y: g.dy });
            ctxRef.current.moveDrag(g.moveX, g.moveY);
          }
        },
        onPanResponderRelease: (_e, g) => {
          if (!moved.current) {
            // a tap: select / unselect
            ctxRef.current.tapItem(itemRef.current);
          } else {
            ctxRef.current.endDrag(itemRef.current, g.moveX, g.moveY);
          }
          setLifted(false);
          Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 7 }).start();
        },
        onPanResponderTerminate: () => {
          setLifted(false);
          ctxRef.current.endDrag(itemRef.current, -9999, -9999);
          Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        },
      }),
    [pos]
  );

  const isSelected = ctx.selected === item;

  return (
    <Animated.View
      {...responder.panHandlers}
      accessibilityRole="button"
      style={[
        style,
        webNoTouch,
        {
          zIndex: lifted ? 1000 : 1,
          elevation: lifted ? 12 : 0,
          transform: [...pos.getTranslateTransform(), { scale: lifted ? 1.08 : 1 }],
        },
      ]}
    >
      {children({ selected: isSelected, dragging: lifted })}
    </Animated.View>
  );
}

export function DropZone({
  id,
  children,
  style,
  disabled,
}: {
  id: string;
  children: (state: { hovered: boolean; armed: boolean }) => ReactNode;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
}) {
  const ctx = useDnd<unknown>();
  const ref = useRef<HostRef>(null);
  const { register, unregister } = ctx;

  useEffect(() => {
    register(id, { ref: ref.current, disabled });
    return () => unregister(id);
  }, [id, disabled, register, unregister]);

  const onPress = useCallback(() => ctx.zonePressed(id), [ctx, id]);

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={disabled}
      style={style as any}
      accessibilityRole="button"
    >
      {children({ hovered: ctx.hovered === id, armed: ctx.selected !== null && !disabled })}
    </Pressable>
  );
}
