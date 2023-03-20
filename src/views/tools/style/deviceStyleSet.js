import { getDeviceType } from "@/utils/device"
export function SetDeviceStyle(){
  let styleLink = getDeviceType() === "Mobile"?'MobileStyle':'PCStyle'
  return styleLink
}
