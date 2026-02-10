import { Camera } from "expo-camera";
import * as Location from "expo-location";

export interface PermissionResult {
  camera: boolean;
  location: boolean;
}

/**
 * Requests camera and foreground location permissions.
 */
export async function requestAllPermissions(): Promise<PermissionResult> {
  const [cameraResult, locationResult] = await Promise.all([
    Camera.requestCameraPermissionsAsync(),
    Location.requestForegroundPermissionsAsync(),
  ]);

  return {
    camera: cameraResult.granted,
    location: locationResult.granted,
  };
}
