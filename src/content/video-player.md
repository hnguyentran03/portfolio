A vanilla-JS, no-build MPEG-DASH video player built on dash.js for experimenting with Adaptive Bitrate (ABR) algorithms. It plays any DASH manifest (with the Sintel test stream as a default) and lets you swap ABR rules at runtime (a custom BBA-0/throughput hybrid, pinned lowest/highest rules, or dash.js built-ins like BOLA, L2A, and LoLP), with each switch tearing down and rebuilding the player under the selected rule.

## Features

- Plays any DASH manifest URL, with the Sintel test stream as a default
- Runtime-switchable ABR rules: a custom BBA-0/throughput hybrid, pinned lowest/highest, and dash.js built-ins (Throughput, BOLA, L2A, LoLP, and more)
- Real network emulation via a service worker that meters segment downloads with a token-bucket limiter, so dash.js's throughput estimate reflects the cap
- Variable-bandwidth mode that drifts the cap with a bounded random walk at three volatility levels
- Live dual-axis metrics chart sampling throughput, cap, playing bitrate, and buffer level every 500 ms, with quality-switch markers and a hover crosshair
- Timeline stays continuous across rule switches, even though each switch rebuilds the player from scratch

## Implementation details

When a custom rule is active, every built-in rule is disabled, so the decisions on screen come from exactly one algorithm. What makes the testbed honest is that nothing is faked: segments genuinely download slowly through an emulated network cap, dash.js's own throughput estimator measures that constrained bandwidth, and the ABR rules react to it exactly as they would on a real bad connection. A live canvas strip chart plots measured throughput, the emulated cap, the playing bitrate, and buffer level over a rolling 60-second window, so you can watch a rule ride out a bandwidth drop — or fail to.

### The custom ABR rule

The custom rule is a hybrid of buffer-based BBA-0 and throughput-based selection, keyed off the current buffer level. Below a 2-second critical reservoir it drops straight to the lowest rendition to avoid a stall. Between 2 and 5 seconds it plays it safe with throughput: it picks the highest rendition whose bitrate fits under 90% of dash.js's safe average throughput estimate. Once the buffer clears the reservoir, BBA-0 takes over: the buffer's position inside a 10-second cushion is mapped linearly onto the manifest's bitrate range, so quality climbs smoothly as the buffer fills, and past 15 seconds the rule commits to the highest rendition. Playback always starts at the lowest quality, and a switch request is only issued when the target rendition actually changes, which keeps the rule from thrashing.

### Throttling below the network stack

Browser dev-tools throttling doesn't help here, and dash.js v5 fetches segments over XHR rather than `fetch`, so the emulation lives in a service worker — the one place that sits below both. The worker intercepts only media-segment requests (manifests and app assets pass through untouched) and re-streams each response body through a token-bucket rate limiter that releases bytes at the capped rate, with bursts limited to about one second's allowance. The cap is re-read on every chunk, so changing the preset mid-download takes effect immediately.

On top of the fixed presets (300 kbps up to 5 Mbps), a variable-bandwidth mode drives the cap with a random walk: every 500 ms it nudges the cap by a step drawn from the sum of two uniform randoms (biasing toward small moves), scaled by a configurable volatility and clamped to user-set bounds. The result is a plausibly jittery connection for stress-testing how each ABR rule handles congestion rather than a clean step function.
