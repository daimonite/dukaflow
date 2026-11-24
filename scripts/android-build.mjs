#!/usr/bin/env node
/**
 * Build the Android debug APK with a JDK that Gradle can run on.
 *
 * Gradle 8.14 / AGP 8.13 support JDK 17-24, but machines often default to a
 * newer JDK. Instead of pinning one machine's path in android/gradle.properties
 * (which breaks every other clone), this script discovers a supported JDK.
 *
 * Resolution order: ANDROID_JAVA_HOME, JAVA_HOME, ~/.jdks, then the usual
 * Android Studio / OS JDK locations. Set ANDROID_JAVA_HOME to override.
 *
 * Usage: npm run android:build [-- gradle tasks...]
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { homedir, platform } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID_DIR = path.join(ROOT, 'android');
const IS_WINDOWS = platform() === 'win32';

// Gradle 8.14 supports up to Java 24; AGP 8.13 requires at least Java 17.
const MIN_MAJOR = 17;
const MAX_MAJOR = 24;

const javaExecutable = dir => path.join(dir, 'bin', IS_WINDOWS ? 'java.exe' : 'java');

function readJdk(dir) {
  if (!dir) return null;
  const executable = javaExecutable(dir);
  if (!existsSync(executable)) return null;

  const result = spawnSync(executable, ['-version'], { encoding: 'utf8' });
  const output = `${result.stderr ?? ''}${result.stdout ?? ''}`;
  const match = output.match(/version "(\d+)(?:\.(\d+))?/);
  if (!match) return null;

  const major = Number(match[1]);
  return { home: dir, major, label: output.split('\n')[0].trim() };
}

function childDirectories(dir) {
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(dir, entry.name));
  } catch {
    return [];
  }
}

function candidateHomes() {
  const programFiles = process.env.ProgramFiles ?? 'C:\\Program Files';
  const localAppData = process.env.LOCALAPPDATA;
  const candidates = [
    process.env.ANDROID_JAVA_HOME,
    process.env.JAVA_HOME,
    ...childDirectories(path.join(homedir(), '.jdks')),
  ];

  if (IS_WINDOWS) {
    candidates.push(path.join(programFiles, 'Android', 'Android Studio', 'jbr'));
    candidates.push(...childDirectories(path.join(programFiles, 'Java')));
    if (localAppData) {
      candidates.push(path.join(localAppData, 'Programs', 'Android Studio', 'jbr'));
    }
  } else if (platform() === 'darwin') {
    for (const root of [
      '/Library/Java/JavaVirtualMachines',
      path.join(homedir(), 'Library', 'Java', 'JavaVirtualMachines'),
    ]) {
      candidates.push(...childDirectories(root).map(dir => path.join(dir, 'Contents', 'Home')));
    }
  } else {
    candidates.push(...childDirectories('/usr/lib/jvm'));
  }

  return candidates;
}

function findSupportedJdk() {
  const seen = new Set();
  const supported = [];

  for (const dir of candidateHomes()) {
    if (!dir) continue;
    const resolved = path.resolve(dir);
    if (seen.has(resolved)) continue;
    seen.add(resolved);

    const jdk = readJdk(resolved);
    if (jdk && jdk.major >= MIN_MAJOR && jdk.major <= MAX_MAJOR) {
      supported.push(jdk);
    }
  }

  supported.sort((a, b) => b.major - a.major);
  return supported[0] ?? null;
}

const jdk = findSupportedJdk();
if (!jdk) {
  console.error(
    `No JDK ${MIN_MAJOR}-${MAX_MAJOR} found. Install one (for example JDK 21) and set ` +
      'ANDROID_JAVA_HOME to its folder, then re-run.'
  );
  process.exit(1);
}

console.log(`Using JDK ${jdk.major} at ${jdk.home}`);

const extraArgs = process.argv.slice(2);
const tasks = extraArgs.length > 0 ? extraArgs : ['clean', 'assembleDebug'];
const gradleEnv = { ...process.env, JAVA_HOME: jdk.home };

// Gradle packages android/app/src/main/assets/public, so the web bundle has to be
// rebuilt and copied there first; otherwise the APK silently ships stale JS.
for (const step of ['npm run build', 'npx cap sync android']) {
  const result = spawnSync(step, { cwd: ROOT, stdio: 'inherit', shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// On Windows the wrapper is gradlew.bat and a bare name is not resolved by cmd
// from android/, so pass the absolute path as one command line (shell: true with
// an args array triggers a Node deprecation warning).
const build = IS_WINDOWS
  ? spawnSync(`"${path.join(ANDROID_DIR, 'gradlew.bat')}" ${tasks.join(' ')}`, {
      cwd: ANDROID_DIR,
      stdio: 'inherit',
      shell: true,
      env: gradleEnv,
    })
  : spawnSync('./gradlew', tasks, {
      cwd: ANDROID_DIR,
      stdio: 'inherit',
      env: gradleEnv,
    });

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

if (tasks.includes('assembleDebug')) {
  const builtApk = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const targetApk = path.join(ROOT, 'apk', 'DukaSmart-v1.0-debug.apk');
  if (!existsSync(builtApk)) {
    console.error(`Gradle reported success but ${builtApk} is missing.`);
    process.exit(1);
  }
  mkdirSync(path.dirname(targetApk), { recursive: true });
  copyFileSync(builtApk, targetApk);
  console.log(`\nAPK copied to ${path.relative(ROOT, targetApk)}`);
}
