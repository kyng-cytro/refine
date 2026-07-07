import { useState } from "react"
import { Send, Palette } from "lucide-react"
import { Button } from "@/components/m3/Button"
import { Chip } from "@/components/m3/Chip"
import { Dialog } from "@/components/m3/Dialog"
import { IconButton } from "@/components/m3/IconButton"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/m3/Menu"
import { SegmentedControl } from "@/components/m3/SegmentedControl"
import { Snackbar } from "@/components/m3/Snackbar"
import { Spinner } from "@/components/m3/Spinner"
import { Surface } from "@/components/m3/Surface"
import { Switch } from "@/components/m3/Switch"
import { TextArea, TextField } from "@/components/m3/TextField"

/** Temporary route to eyeball the M3 components in light/dark. */
export default function KitchenSink() {
  const [checked, setChecked] = useState(false)
  const [snack, setSnack] = useState(false)
  const [dialog, setDialog] = useState(false)
  const [segment, setSegment] = useState("bottom-left")

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-headline-small">Kitchen sink</h1>

      <div className="flex flex-wrap items-center gap-3">
        <Button>Filled</Button>
        <Button variant="tonal">Tonal</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
        <IconButton variant="contained">
          <Send className="h-5 w-5" />
        </IconButton>
        <Spinner />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Menu>
          <MenuTrigger asChild>
            <Chip icon={<Palette />} dropdown>
              Friendly
            </Chip>
          </MenuTrigger>
          <MenuContent>
            <MenuItem selected>Friendly</MenuItem>
            <MenuItem>Formal</MenuItem>
            <MenuItem>Concise</MenuItem>
          </MenuContent>
        </Menu>
        <Chip selected>Selected chip</Chip>
        <Switch checked={checked} onCheckedChange={setChecked} />
      </div>

      <Surface level={2} className="space-y-2 p-4" shadow>
        <TextArea placeholder="Enter text to refine…" rows={4} />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Chip dropdown>gpt-5-mini</Chip>
            <Chip dropdown>Friendly</Chip>
          </div>
          <IconButton variant="contained">
            <Send className="h-5 w-5" />
          </IconButton>
        </div>
      </Surface>

      <TextField label="Server URL" placeholder="https://refine.example.com" />
      <TextField label="With error" error="Required" />

      <SegmentedControl
        options={[
          { value: "bottom-left", label: "Bottom left" },
          { value: "bottom-right", label: "Bottom right" },
        ]}
        value={segment}
        onChange={setSegment}
      />

      <div className="flex gap-3">
        <Button variant="tonal" onClick={() => setSnack(true)}>
          Snackbar
        </Button>
        <Button variant="tonal" onClick={() => setDialog(true)}>
          Dialog
        </Button>
      </div>

      <Snackbar visible={snack} onDismiss={() => setSnack(false)}>
        Something went wrong.
      </Snackbar>
      <Dialog
        open={dialog}
        onOpenChange={setDialog}
        title="Connect device?"
        description="This will replace your current connection."
        actions={
          <>
            <Button variant="text" onClick={() => setDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDialog(false)}>Connect</Button>
          </>
        }
      />
    </div>
  )
}
