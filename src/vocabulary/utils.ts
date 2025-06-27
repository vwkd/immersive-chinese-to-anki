/**
 * Get filename for audio from identifier
 * Add "IC " to beginning and ".mp4" to end
 */
export function getAudioFileName(identifier: string): string {
  const newBase = "IC " + identifier + ".mp4";
  return newBase;
}
