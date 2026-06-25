'use client'

import TemplateEditor from '@/components/admin/template-editor/TemplateEditor'
import Template3Layout from '@/components/templates/Template3Layout'
import { PATTERNS } from '@/components/templates/patterns/template3'
import type { Project, MediaAsset } from '@prisma/client'

type FullProject = Project & { heroImage: MediaAsset | null; ogImage: MediaAsset | null }

export default function Template3Editor({ project }: { project: FullProject }) {
  return <TemplateEditor project={project} patterns={PATTERNS} Layout={Template3Layout} />
}
