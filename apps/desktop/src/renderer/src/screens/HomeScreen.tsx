import { RefineInputArea } from "@/components/home/RefineInputArea"
import { RecentsSection } from "@/components/home/RecentsSection"

export default function HomeScreen() {
  return (
    <div className="mx-auto max-w-2xl pt-2">
      <RefineInputArea />
      <RecentsSection />
    </div>
  )
}
