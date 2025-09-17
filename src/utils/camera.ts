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

  // Enhanced heuristics for Android compatibility
  const avoid = /ultra|wide|tele|zoom|macro|depth|infrared|ir/i;
  const isBack = (label: string) => /back|rear|environment|camera2|facing back|main/i.test(label);
  const isMain = (label: string) => /main|primary|default|camera 0|cam0/i.test(label);
  
  // Android-specific patterns
  const androidBack = (label: string) => /camera2 \d+, facing back|back facing|rear facing/i.test(label);

  // Score devices: higher is better
  const scored = devices.map(d => {
    const label = d.label || '';
    let score = 0;
    
    // Primary scoring for back cameras
    if (androidBack(label)) score += 15;     // Android-specific back camera patterns
    if (isBack(label)) score += 10;         // General back camera patterns
    if (isMain(label)) score += 8;          // Main/primary camera indicators
    
    // Avoid specialty cameras
    if (!avoid.test(label)) score += 5;     // Prefer standard focal length
    
    // Bonus points for common patterns
    if (/dual|triple|pro|standard/i.test(label)) score += 2;
    if (/camera.*0|cam.*0/i.test(label)) score += 3;  // Often the main camera
    
    // Penalty for front cameras
    if (/front|user|selfie|facing front/i.test(label)) score -= 20;
    
    return { d, score, label };
  }).sort((a, b) => b.score - a.score);

  // Debug logging for development
  console.log('Available cameras:', scored.map(s => ({ label: s.label, score: s.score, id: s.d.deviceId })));

  return scored[0]?.d.deviceId;
}

export async function openPreferredBackCamera(): Promise<MediaStream> {
  // Multiple fallback strategies for better Android compatibility
  
  // Strategy 1: Try exact environment first (works well on many devices)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: { exact: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    console.log('Camera opened with exact environment facingMode');
    return stream;
  } catch (error) {
    console.log('Exact environment failed:', error);
  }

  // Strategy 2: Try our heuristic-based device selection
  try {
    const id = await getPreferredBackCameraId();
    if (id) {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          deviceId: { exact: id },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      console.log('Camera opened with deviceId:', id);
      return stream;
    }
  } catch (error) {
    console.log('DeviceId selection failed:', error);
  }

  // Strategy 3: Try ideal environment (more permissive)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    console.log('Camera opened with ideal environment facingMode');
    return stream;
  } catch (error) {
    console.log('Ideal environment failed:', error);
  }

  // Strategy 4: Try without facingMode constraint (Android fallback)
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    
    // Try the last device (often back camera on Android)
    if (videoDevices.length > 1) {
      const lastDevice = videoDevices[videoDevices.length - 1];
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          deviceId: { exact: lastDevice.deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      console.log('Camera opened with last device:', lastDevice.label);
      return stream;
    }
  } catch (error) {
    console.log('Last device fallback failed:', error);
  }

  // Strategy 5: Final fallback - any video device
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    console.log('Camera opened with basic video constraints');
    return stream;
  } catch (error) {
    console.log('Basic video fallback failed:', error);
    throw new Error('Unable to access any camera device');
  }
}
