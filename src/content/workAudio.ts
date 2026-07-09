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
//   - hollywood-perfect ("Hollywood Perfect (CalebZ Remix)"): a dark trap / rap
//     remix (152 BPM, Emin, mid-scooped 808 drop) of Unknown Brain's track,
//     mastered against reference-grade rap masters (21 Savage "Runnin"/"Glock
//     In My Lap"/"a lot", Metro Boomin "Too Many Nights", Future "Mask Off").
//     before -13.0 / +1.0,
//     after -10.2 / 0.0 (sub 0.060 and bass 0.084 held, mid pulled back from a
//     wrong melodic-bass pass, dark rap character, LRA 7.4->4.7).
//   - forest ("Forest"): older SoundCloud original, melodic progressive house
//     (Avicii "Silhouettes" lineage), mastered via refmaster against a tight
//     WARM-CORE prog-house library (Kaskade & deadmau5 "I Remember", deadmau5
//     "Strobe", Avicii "Silhouettes"). Brighter refs (Waiting For Love, Save
//     The World) were dropped because they mapped the two verse instances to
//     divergent sections (0:59 sounded different from the same verse at 2:17);
//     the warm core brings verse divergence back to the arrangement floor while
//     the drops still match "Silhouettes" untouched. before -12.6 / +0.8,
//     after -11.1 / -0.3 (LRA 14.5->6.4, centroid ~2350 Hz, in character).
// ABPlayer.computeGain reads these LUFS to level-match the A/B so only the master
// differs on playback. Peaks are the per-window amplitude envelope on a shared
// scale, computed across the whole song.
//
// The peak arrays are bulky generated data, so they live in workAudio.json and
// are imported here only to attach the AudioPair type. Keeping the data out of
// this module keeps every source file small and the data trivially regenerable.
export const workAudio: Record<string, AudioPair> = data;
