import { AppHeader } from '@/components/app-header'
import { Workspace } from '@/components/workspace'

export default function Page() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <AppHeader />
      <Workspace />
    </div>
  )
}
