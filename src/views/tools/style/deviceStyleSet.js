import { getDeviceOS } from "@/utils/device";
export function SetDeviceStyle() {
  let styleLink = getDeviceOS() === "Phone" ? "MobileStyle" : "PCStyle";
  return styleLink;
}
