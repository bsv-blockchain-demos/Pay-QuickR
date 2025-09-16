// camera.ts
// Prefer the back camera with a "standard" (non-ultra-wide/non-telephoto) focal length.

export async function getPreferredBackCameraId(): Promise<string | undefined> {
  // 1) Ask for any camera once so labels are populated (iOS Safari needs this).
  try {
    const tmp = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    tmp.getTracks().forEach(t => t.stop());
  } catch {
    // ignore; we'll still try enumerateDevices
  }

  const devices = (await navigator.mediaDevices.enumerateDevices())
    .filter(d => d.kind === 'videoinput');

  // Heuristics: prefer "back"/"environment"/"rear", avoid "ultra", "wide", "tele", "macro"
  const avoid = /ultra|wide|tele|zoom|macro/i;
  const isBack = (label: string) => /back|rear|environment/i.test(label);

  // Score devices: higher is better
  const scored = devices.map(d => {
    const label = d.label || '';
    let score = 0;
    if (isBack(label)) score += 10;
    if (!avoid.test(label)) score += 5;       // prefer standard focal length
    if (/dual|triple|pro|default/i.test(label)) score += 1;
    return { d, score };
  }).sort((a, b) => b.score - a.score);

  return scored[0]?.d.deviceId;
}

export async function openPreferredBackCamera(): Promise<MediaStream> {
  // Try exact environment first (fast path).
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: 'environment' } }
    });
  } catch {
    // Fallback to explicit deviceId selection using our heuristic.
    const id = await getPreferredBackCameraId();
    if (id) {
      return await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: id } } });
    }
    // Last fallback: generic environment ideal.
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
  }
}
