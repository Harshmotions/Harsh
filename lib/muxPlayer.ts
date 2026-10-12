// The Mux player (with hls.js) is ~1 MB of JS, so it's never in the initial bundle.
// Sharing one loader lets cards warm it up before a video is opened.
export const loadMuxPlayer = () => import('@mux/mux-player-react');

let prefetched = false;

/** Start downloading the player once there's a sign the visitor will open a video. */
export function prefetchMuxPlayer() {
  if (prefetched) return;
  prefetched = true;
  void loadMuxPlayer();
}
