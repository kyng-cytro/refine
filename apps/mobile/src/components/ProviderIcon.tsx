import { SvgXml } from "react-native-svg"

interface Props {
  svg: string
  size?: number
  color?: string
}

export default function ProviderIcon({ svg, size = 20, color }: Props) {
  const xml = color ? svg.replace(/currentColor/g, color) : svg
  return <SvgXml xml={xml} width={size} height={size} />
}
