// Publishes the portfolio videos: encodes every video in the export folder, uploads the
// results to Cloudflare R2 and writes content/work.json, which the site reads (lib/work.ts).
//
//   node scripts/publish-work.mjs [exportFolder] [--dry] [--force] [--posters]
//   (exportFolder defaults to ../Exports/Portfolio, next to this project)
//
// Settings per file live in content/work-meta.json (keyed by file name): the title the site
// shows, an optional note, and `hero: "desktop" | "mobile"` for the home page showreel.
// Without a title there, the file name is used ("03_Nike film.mov" → "Nike film").
//
// For each piece of work it makes:
//   hd.mp4      up to 1080p (1920 on the long side), up to 60 fps, high bitrate, with sound
//   sd.mp4      up to 720p, up to 30 fps, light: card previews and phones
//   poster      the most detailed of several frames, for the card and the player
//   trail-N     six square frames from across the video, for the hero's cursor trail
// The showreels get the same hd/sd files (silent, leading black trimmed) and a poster that
// is exactly their first frame, so the hand-over from poster to video is seamless.
// All MP4s are H.264 with the index at the front (faststart): playback starts after the
// first chunk arrives instead of waiting for the whole file.
//
// Order on the site = file name order, so prefix files "01 ", "02 "… to arrange them.
// Files already published (same name, size and date) are only re-encoded with --force;
// --posters re-picks their posters, --trail their trail frames. --dry encodes into
// .work-cache/ without uploading.
// Needs ffmpeg/ffprobe on the PATH and R2_* keys in .env.local.

import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const ROOT = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const SRC = resolve(args.find((a) => !a.startsWith('--')) ?? resolve(ROOT, '..', 'Exports', 'Portfolio'));
const DRY = args.includes('--dry');
const FORCE = args.includes('--force');
const POSTERS = args.includes('--posters');
const TRAIL = args.includes('--trail');
const MANIFEST = join(ROOT, 'content', 'work.json');
const META = join(ROOT, 'content', 'work-meta.json');
const CACHE = join(ROOT, '.work-cache');
const VIDEO = new Set(['.mp4', '.mov', '.m4v', '.mkv', '.webm', '.avi', '.mxf']);
const TRAIL_FRAMES = 6;

const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env.local'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^R2_[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
});

// ---------- tools ----------

const probe = (file) =>
  JSON.parse(
    execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], {
      encoding: 'utf8',
      maxBuffer: 1 << 26,
    }),
  );

const ffmpeg = (argv) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...argv], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`ffmpeg failed (${r.status})`);
};

const titleOf = (file) =>
  basename(file, extname(file))
    .replace(/^\s*\d+\s*[-_.)]*\s*/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const slugOf = (title) =>
  title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-') || 'video';

// Fit inside the box for the frame's orientation, never upscaling, even dimensions
const fit = (long, short) =>
  `scale=w='if(gte(iw,ih),min(iw,${long}),min(iw,${short}))':h='if(gte(iw,ih),min(ih,${short}),min(ih,${long}))':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1`;

const encode = (src, out, { long, short, fps, crf, maxrate, level, audioKbps, audio, start = 0 }) =>
  ffmpeg([
    ...(start > 0 ? ['-ss', start.toFixed(3)] : []),
    '-i', src,
    '-map', '0:v:0', ...(audio ? ['-map', '0:a:0'] : []),
    '-map_metadata', '-1',
    '-vf', fit(long, short),
    '-fpsmax', String(fps),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
    '-maxrate', maxrate, '-bufsize', `${parseInt(maxrate, 10) * 2}M`,
    '-profile:v', 'high', '-level', level, '-pix_fmt', 'yuv420p',
    // a keyframe every 2s: quick seeking and loop restarts
    '-force_key_frames', 'expr:gte(t,n_forced*2)',
    ...(audio ? ['-c:a', 'aac', '-b:a', `${audioKbps}k`, '-ac', '2'] : ['-an']),
    '-movflags', '+faststart',
    out,
  ]);

const encodeBoth = (src, dir, { audio, start }) => {
  const hd = join(dir, 'hd.mp4');
  const sd = join(dir, 'sd.mp4');
  if (!existsSync(hd) || FORCE)
    encode(src, hd, { long: 1920, short: 1080, fps: 60, crf: 18, maxrate: '12M', level: '4.2', audioKbps: 192, audio, start });
  if (!existsSync(sd) || FORCE)
    encode(src, sd, { long: 1280, short: 720, fps: 30, crf: 23, maxrate: '3.5M', level: '4.0', audioKbps: 128, audio, start });
  return { hd, sd };
};

/** Seconds of black at the very start (showreels often open on it). */
const leadingBlack = (src) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-t', '6', '-i', src, '-vf', 'blackdetect=d=0.1:pix_th=0.10', '-an', '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /black_start:0(?:\.0+)? black_end:([\d.]+)/.exec(r.stderr || '');
  return m ? parseFloat(m[1]) : 0;
};

/** Small JPEGs at each time; returns them sorted most detailed first (bigger file = more detail). */
const sampleFrames = (video, times, dir, filter) => {
  mkdirSync(dir, { recursive: true });
  return times
    .map((at) => {
      const f = join(dir, `${at.toFixed(2)}.jpg`);
      ffmpeg(['-ss', at.toFixed(2), '-i', video, '-frames:v', '1', '-vf', filter, '-q:v', '5', f]);
      return { at, f, size: existsSync(f) ? statSync(f).size : 0 };
    })
    .sort((a, b) => b.size - a.size);
};

// The poster is the most detailed of several frames: fixed points too often land on a blank
// transition or a fade. Its time goes into the file name, so a new pick never hits an old cache.
const pickPoster = (video, duration, dir) => {
  const tmp = join(dir, '_candidates');
  const [best] = sampleFrames(video, [0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68].map((x) => duration * x), tmp, 'scale=480:-2');
  rmSync(tmp, { recursive: true, force: true });
  const name = `poster-${best.at.toFixed(2)}.jpg`;
  ffmpeg(['-ss', best.at.toFixed(2), '-i', video, '-frames:v', '1', '-q:v', '3', join(dir, name)]);
  return { file: join(dir, name), name };
};

// Six square frames for the hero trail. Every candidate moment is scored on:
//  - content: edge density of the square crop, i.e. how much of it is actual UI, type or
//    imagery rather than empty background. Of the three possible crops (start / centre /
//    end of the long side) the fullest wins
//  - not cut off: crops whose edges are busier than their middle are slicing through the
//    subject (half a word, half a card), so they're marked down
//  - settled: compared with the frame 0.1s later (PSNR), relative to the rest of the piece;
//    frames caught mid-transition or in motion blur drop out
// The opening and the last 18% (every piece ends on the same logo outro) are skipped, and
// the six picks are kept apart in time so no two look alike. Exported at 360×360.
const edgeDensity = (video, at, chain) => {
  const r = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-ss', at.toFixed(2), '-i', video, '-an', '-frames:v', '1',
      '-vf', `${chain},edgedetect=low=0.06:high=0.18,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-`, '-f', 'null', '-'],
    { encoding: 'utf8' },
  );
  const m = /YAVG=([\d.]+)/.exec((r.stdout || '') + (r.stderr || ''));
  return m ? parseFloat(m[1]) : 0;
};

const stillness = (video, at) => {
  const r = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-ss', at.toFixed(2), '-i', video, '-ss', (at + 0.1).toFixed(2), '-i', video,
      '-lavfi', '[0:v]scale=192:-2[a];[1:v]scale=192:-2[b];[a][b]psnr', '-frames:v', '1', '-f', 'null', '-'],
    { encoding: 'utf8' },
  );
  const m = /average:(inf|[\d.]+)/.exec(r.stderr || '');
  return !m ? 0 : m[1] === 'inf' ? 99 : parseFloat(m[1]);
};

// An 8×8 colour thumbnail of a square frame. Two frames whose thumbnails are close show the
// same scene (same layout and colours), even if something in it moved or zoomed a little.
const thumb = (video, c) =>
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-ss', c.at.toFixed(2), '-i', video, '-frames:v', '1',
    '-vf', `${c.crop},scale=8:8:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 20 });
const colourDistance = (a, b) => {
  let d = 0;
  for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]);
  return d / a.length;
};
// below this, two frames read as the same shot (measured: repeats score 0.3 to 6.8,
// genuinely different frames 9 and up)
const LOOKALIKE = 7.5;

const makeTrail = (video, duration, dir) => {
  const { width: w, height: h } = probe(video).streams.find((s) => s.codec_type === 'video');
  const side = Math.min(w, h);
  const span = Math.max(w, h) - side;
  const offsets = span > 8 ? [0, Math.round(span / 2), span] : [0];
  const cropAt = (o) => (w >= h ? `crop=${side}:${side}:${o}:0` : `crop=${side}:${side}:0:${o}`);

  const from = duration * 0.06;
  const to = duration * 0.82;
  const times = Array.from({ length: 32 }, (_, i) => from + ((to - from) * i) / 31);
  const scored = times.map((at) => {
    let best = { score: -1, crop: cropAt(0), full: 0 };
    for (const o of offsets) {
      const crop = cropAt(o);
      const full = edgeDensity(video, at, `${crop},scale=160:160`);
      const inner = edgeDensity(video, at, `${crop},scale=160:160,crop=128:128:16:16`);
      // density of the outer 20% ring, from the whole and the middle
      const ring = (full * 160 * 160 - inner * 128 * 128) / (160 * 160 - 128 * 128);
      const cut = ring > inner * 1.25 ? 0.55 : 1;
      const score = full * cut;
      if (score > best.score) best = { score, crop, full };
    }
    return { at, ...best };
  });
  // keep only frames with real content (at least 45% of this piece's busiest)
  const top = Math.max(...scored.map((c) => c.full));
  // Settled, relative to this piece (motion design is rarely ever fully still): its most
  // moving 30% of moments are dropped, and calmer ones are favoured among the rest
  const full = scored.filter((c) => c.full >= top * 0.45).map((c) => ({ ...c, still: stillness(video, c.at) }));
  const stills = full.map((c) => c.still).sort((a, b) => a - b);
  const floor = stills[Math.floor(stills.length * 0.3)] ?? 0;
  const ceil = stills[stills.length - 1] ?? 1;
  const candidates = full
    .filter((c) => c.still >= floor)
    .map((c) => ({ ...c, score: c.score * (0.55 + 0.45 * ((c.still - floor) / Math.max(1, ceil - floor))) }))
    .sort((a, b) => b.score - a.score);

  // and no lookalikes: a pick must differ visibly from every pick before it
  const gap = duration * 0.05;
  const picks = [];
  for (const c of candidates) {
    if (picks.length === TRAIL_FRAMES) break;
    const t = thumb(video, c);
    if (picks.every((p) => Math.abs(p.at - c.at) >= gap && colourDistance(p.thumb, t) >= LOOKALIKE)) picks.push({ ...c, thumb: t });
  }
  return picks
    .sort((a, b) => a.at - b.at)
    .map((p, i) => {
      const name = `trail-${i}-${p.at.toFixed(2)}.webp`;
      ffmpeg(['-ss', p.at.toFixed(2), '-i', video, '-frames:v', '1', '-vf', `${p.crop},scale=360:360:flags=lanczos`, '-c:v', 'libwebp', '-quality', '82', join(dir, name)]);
      return { file: join(dir, name), name };
    });
};

// Hand-picked trail frames from work-meta.json: '<seconds><s|c|e>', the square cropped from
// the start, centre or end of the frame's long side. Each pick snaps to the sharpest frame
// within ±0.2s (clean moments in motion design last only a few frames)
const makeTrailFromPicks = (video, picks, dir) => {
  const { width: w, height: h } = probe(video).streams.find((s) => s.codec_type === 'video');
  const side = Math.min(w, h);
  const span = Math.max(w, h) - side;
  return picks.map((pick, i) => {
    const m = /^([\d.]+)([sce])$/.exec(String(pick).trim());
    if (!m) throw new Error(`Bad trail pick "${pick}" (use e.g. "4.2c")`);
    const o = { s: 0, c: Math.round(span / 2), e: span }[m[2]];
    const crop = w >= h ? `crop=${side}:${side}:${o}:0` : `crop=${side}:${side}:0:${o}`;
    const around = Array.from({ length: 5 }, (_, k) => Math.max(0, parseFloat(m[1]) + (k - 2) * 0.1));
    const at = around.reduce(
      (best, t) => {
        const d = edgeDensity(video, t, `${crop},scale=240:240`);
        return d > best.d ? { t, d } : best;
      },
      { t: parseFloat(m[1]), d: -1 },
    ).t;
    const name = `trail-${i}-${at.toFixed(2)}${m[2]}.webp`;
    ffmpeg(['-ss', at.toFixed(2), '-i', video, '-frames:v', '1', '-vf', `${crop},scale=360:360:flags=lanczos`, '-c:v', 'libwebp', '-quality', '82', join(dir, name)]);
    return { file: join(dir, name), name };
  });
};

const upload = async (file, key, type) => {
  if (DRY) return;
  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: createReadStream(file),
      ContentLength: statSync(file).size,
      ContentType: type,
      // file names change with every new version, so they can be cached for good
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
};

const mb = (f) => (statSync(f).size / 1048576).toFixed(1) + ' MB';

// ---------- run ----------

const main = async () => {
  if (!existsSync(SRC)) throw new Error(`Export folder not found: ${SRC}`);
  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { items: [] };
  const meta = existsSync(META) ? JSON.parse(readFileSync(META, 'utf8')) : {};
  const previous = new Map(manifest.items.map((i) => [i.source, i]));
  for (const h of Object.values(manifest.hero ?? {})) previous.set(h.source, h);

  const files = readdirSync(SRC)
    .filter((f) => VIDEO.has(extname(f).toLowerCase()) && !f.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  if (files.length === 0) console.log(`No videos in ${SRC}`);

  const items = [];
  const hero = {};
  const usedSlugs = new Set();

  for (const f of files) {
    const src = join(SRC, f);
    const st = statSync(src);
    const hash = createHash('sha1').update(`${f}|${st.size}|${st.mtimeMs}`).digest('hex').slice(0, 8);
    const m = meta[f] ?? {};
    const role = m.hero; // 'desktop' | 'mobile' | undefined
    const title = m.title?.trim() || titleOf(f);
    const notePath = join(SRC, basename(f, extname(f)) + '.txt');
    const note =
      m.note?.trim() ||
      (existsSync(notePath) ? readFileSync(notePath, 'utf8').split(/\r?\n/).map((l) => l.trim()).find(Boolean) : undefined);

    const prev = previous.get(f);
    // up to date = same file, published in the same role (a grid piece or a showreel)
    const fresh = !!prev && prev.hash === hash && (prev.hero ?? null) === (role ?? null) && !FORCE;
    // the slug (and so the R2 folder) stays put once published, even if the title changes
    let slug = fresh ? prev.slug : slugOf(role ? `showreel-${role}` : titleOf(f));
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${slugOf(titleOf(f))}-${n}`;
    usedSlugs.add(slug);
    const dir = join(CACHE, `${slug}-${hash}`);
    const base = `work/${slug}-${hash}`;
    mkdirSync(dir, { recursive: true });

    let item;
    if (fresh) {
      item = { ...prev };
    } else {
      console.log(`\n▶ ${f}${role ? ` (hero, ${role})` : ''}`);
      const info = probe(src);
      const v = info.streams.find((s) => s.codec_type === 'video');
      const hasAudio = info.streams.some((s) => s.codec_type === 'audio');
      const start = role ? leadingBlack(src) : 0;
      const duration = parseFloat(info.format.duration || v.duration || '0') - start;
      // showreels play muted on the home page, so they carry no sound
      const { hd, sd } = encodeBoth(src, dir, { audio: hasAudio && !role, start });
      let poster;
      if (role) {
        poster = { file: join(dir, 'poster-0.jpg'), name: 'poster-0.jpg' };
        ffmpeg(['-i', hd, '-frames:v', '1', '-q:v', '3', poster.file]);
      } else poster = pickPoster(hd, duration, dir);

      const out = probe(hd).streams.find((s) => s.codec_type === 'video');
      item = {
        slug,
        width: out.width,
        height: out.height,
        duration: Math.round(duration * 10) / 10,
        poster: `${base}/${poster.name}`,
        hd: `${base}/hd.mp4`,
        sd: `${base}/sd.mp4`,
        source: f,
        hash,
        ...(role ? { hero: role } : {}),
      };
      console.log(`  ${out.width}×${out.height}, ${item.duration}s${start ? ` (trimmed ${start}s of black)` : ''} · hd ${mb(hd)} · sd ${mb(sd)}`);
      await upload(hd, item.hd, 'video/mp4');
      await upload(sd, item.sd, 'video/mp4');
      await upload(poster.file, item.poster, 'image/jpeg');
    }

    const hdFile = join(dir, 'hd.mp4');
    if (!role && POSTERS && fresh) {
      if (!existsSync(hdFile)) throw new Error(`No local encode for ${f}: run with --force`);
      const p = pickPoster(hdFile, item.duration, dir);
      item.poster = `${base}/${p.name}`;
      await upload(p.file, item.poster, 'image/jpeg');
      console.log(`↻ ${f}: poster at ${p.name.slice(7, -4)}s`);
    }
    if (!role && (!item.trail || !fresh || TRAIL)) {
      if (!existsSync(hdFile)) throw new Error(`No local encode for ${f}: run with --force`);
      const frames = m.trail?.length ? makeTrailFromPicks(hdFile, m.trail, dir) : makeTrail(hdFile, item.duration, dir);
      for (const fr of frames) await upload(fr.file, `${base}/${fr.name}`, 'image/webp');
      item.trail = frames.map((fr) => `${base}/${fr.name}`);
      console.log(`  ${f}: ${frames.length} trail frames`);
    }
    if (fresh) console.log(`= ${f} (already published)`);

    if (role) {
      delete item.trail;
      hero[role] = item;
    } else {
      items.push({ slug: item.slug, title, ...(note ? { note } : {}), ...Object.fromEntries(Object.entries(item).filter(([k]) => !['slug', 'title', 'note'].includes(k))) });
    }
  }

  if (DRY) {
    console.log(`\nDry run: encodes are in ${CACHE}; nothing uploaded, work.json unchanged.`);
    return;
  }
  for (const [source] of previous) if (!files.includes(source)) console.log(`- ${source} (no longer in the folder, removed from the site)`);
  writeFileSync(MANIFEST, JSON.stringify({ hero, items }, null, 2) + '\n');
  console.log(`\nwork.json: ${items.length} pieces${hero.desktop ? ', desktop showreel' : ''}${hero.mobile ? ', mobile showreel' : ''}`);
};

main().catch((e) => {
  console.error('\nERROR:', e.message);
  process.exit(1);
});
