/**
 * Get filename for audio
 *
 * - adds "IC " to beginning and ".mp4" to end
 *
 * @param identifier identifier of audio
 * @returns filename of audio
 */
export function getAudioFileName(identifier: string): string {
  const newBase = "IC " + identifier + ".mp4";
  return newBase;
}
