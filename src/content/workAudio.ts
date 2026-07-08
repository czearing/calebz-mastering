import type { AudioPair } from "./types";
import data from "./workAudio.json";

// Precomputed waveform peaks + loudness for the Work A/B players. Real,
// full-length before/after pairs (whole songs), measured with ffmpeg ebur128:
//   - down ("↓", Jexn Bxptiste): before -9.4 LUFS / +0.2 dBTP, after -9.3 / +0.2
//     (streaming upload vs CalebZ's master; two close masters, shown honestly).
//   - found-you ("Found You (CalebZ Remix)"): raw mix vs refmaster auto-master
//     (ref: Kygo "Higher Love"). before -15.6 / +0.3, after -10.2 / +0.1.
//   - tell-me-im-pretty ("Tell Me I'm Pretty (CalebZ Remix)"): the SoundCloud
//     upload vs the refmaster engine matched against a pop / bass-house library
//     (base ref MEDUZA "Lose Control"; per-section: both drops -> ACRAZE "Do It
//     To It", intro/build -> Dom Dolla "Miracle Maker", breakdown -> "Lose
//     Control"). 126 BPM G#min, sub-forward bouncy drop. before -12.9 / +0.5,
//     after -11.9 / 0.0 (crest 14.8->12.7, LRA 12.3->6.6, densified clean).
//   - bad-dream ("Bad Dream (CalebZ Remix)"): raw mix vs refmaster master toward
//     Skrillex "Scary Monsters" (tight-LRA heavy dubstep) with a raised limiting
//     budget (REFMASTER_MAX_LIMITING=4) + density (--max-reduction 6) so it
//     densifies to dubstep loudness instead of landing soft. before -12.5 / +1.0,
//     after -7.3 / +0.2 (crest 14.9->9.9, intro lifted ~1.7 dB, LRA 4.5, clean).
//   - forest ("Forest"): older SoundCloud original, melodic progressive house
//     (Avicii "Silhouettes" lineage), mastered via refmaster against a curated
//     WARM prog-house library (Kaskade & deadmau5 "I Remember", deadmau5
//     "Strobe", Avicii "Silhouettes"/"Waiting For Love", SHM "Save The World").
//     Refs chosen by tonal centroid to stay in character; both drops match
//     "Silhouettes". before -12.6 / +0.8, after -11.0 / 0.0 (LRA 14.5->5.7,
//     centroid 2114->2300 Hz so the warm/dark identity is kept, low end intact).
// ABPlayer.computeGain reads these LUFS to level-match the A/B so only the master
// differs on playback. Peaks are the per-window amplitude envelope on a shared
// scale, computed across the whole song.
//
// The peak arrays are bulky generated data, so they live in workAudio.json and
// are imported here only to attach the AudioPair type. Keeping the data out of
// this module keeps every source file small and the data trivially regenerable.
export const workAudio: Record<string, AudioPair> = data;
