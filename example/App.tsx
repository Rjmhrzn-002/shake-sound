import ShakeSound, { ShakeMeter, MEME_SOUNDS } from 'shake-sound';
import * as React from 'react';
import { Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// One screen, read top-to-bottom in the order the module grew:
//   Session 1 — Function(playSound) → AsyncFunction(filterAvailable)
//   Session 2 — Events(onShake)     → Native view(<ShakeMeter/>)
// No tabs: in Session 1 you're at the top, in Session 2 you scroll down.
export default function App() {
  const [available, setAvailable] = React.useState<string[] | null>(null);
  const [count, setCount] = React.useState(0);
  const [intensity, setIntensity] = React.useState(0);
  const [level, setLevel] = React.useState(0);
  const availableRef = React.useRef<string[]>([]);

  // Discover which clips are actually bundled, so JS can pick one to play.
  React.useEffect(() => {
    ShakeSound.filterAvailable([...MEME_SOUNDS]).then((a: string[]) => {
      setAvailable(a);
      availableRef.current = a;
    });
  }, []);

  // Listen for native shake events. Mounting this listener is what starts the
  // accelerometer (OnStartObserving); unmounting stops it (OnStopObserving).
  React.useEffect(() => {
    const sub = ShakeSound.addListener('onShake', ({ intensity }: { intensity: number }) =>
      onShake(intensity)
    );
    return () => sub.remove();
  }, []);

  // Ease the meter back down after a spike.
  React.useEffect(() => {
    if (level <= 0) return;
    const t = setTimeout(() => setLevel((l) => Math.max(0, l - 0.08)), 60);
    return () => clearTimeout(t);
  }, [level]);

  // JS decides what happens on a shake — native only reported how hard it was.
  function onShake(g: number) {
    setCount((c) => c + 1);
    setIntensity(g);
    setLevel(Math.min(1, Math.max(0, (g - 1) / 3)));
    const clips = availableRef.current;
    if (clips.length) {
      ShakeSound.playSound(clips[Math.floor(Math.random() * clips.length)]);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.title}>shake-sound</Text>

          {/* ─────────────── Session 1 — Functions & Async ─────────────── */}
          <Text style={styles.eyebrow}>Session 1 · Functions & Async</Text>

          <Group name="Function — playSound(name)">
            <Text style={styles.hint}>Tap a clip. JS calls native synchronously.</Text>
            <View style={styles.chips}>
              {MEME_SOUNDS.map((name) => (
                <Pressable key={name} style={styles.chip} onPress={() => ShakeSound.playSound(name)}>
                  <Text style={styles.chipText}>{name}</Text>
                </Pressable>
              ))}
            </View>
          </Group>

          <Group name="AsyncFunction — filterAvailable(names)">
            <Text style={styles.hint}>
              Native reports which clips are actually bundled (returns a Promise).
            </Text>
            <Button
              title="Check availability"
              onPress={async () => setAvailable(await ShakeSound.filterAvailable([...MEME_SOUNDS]))}
            />
            {available !== null && (
              <Text style={styles.result}>
                {available.length
                  ? `Bundled: ${available.join(', ')}`
                  : 'None bundled yet — add .mp3 files.'}
              </Text>
            )}
          </Group>

          {/* ─────────────── Session 2 — Events + Native view ─────────────── */}
          <View style={styles.divider} />
          <Text style={styles.eyebrow}>Session 2 · Events & Native View</Text>

          <Group name="Events — onShake">
            <Text style={styles.hint}>Shake the phone (native pushes the event up).</Text>
            <Text style={styles.big}>{count}</Text>
            <Text style={styles.hint}>shakes · last intensity {intensity.toFixed(2)} g</Text>
            <Button title="Fake a shake" onPress={() => onShake(2.5 + Math.random() * 1.5)} />
          </Group>

          <Group name="Native view — <ShakeMeter/>">
            <View style={styles.meterRow}>
              <ShakeMeter level={level} barColor={colorFor(level)} style={styles.meter} />
            </View>
          </Group>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function colorFor(level: number) {
  if (level > 0.66) return '#ff3b30';
  if (level > 0.33) return '#ff9500';
  return '#34c759';
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f2f2f7' },
  body: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#8e8e93',
  },
  divider: { height: 1, backgroundColor: '#d1d1d6', marginTop: 8 },
  group: { backgroundColor: '#fff', borderRadius: 14, padding: 18, gap: 12 },
  groupHeader: { fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 13, color: '#666' },
  result: { fontSize: 14, color: '#0a84ff' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#eef1ff' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#3a3aff' },
  big: { fontSize: 44, fontWeight: '800' },
  meterRow: { height: 200, alignItems: 'center' },
  meter: { width: 80, height: 200 },
});
