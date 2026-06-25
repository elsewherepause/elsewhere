'use client'

import TemplateEditor from '@/components/admin/template-editor/TemplateEditor'
import Template2Layout from '@/components/templates/Template2Layout'
import { PATTERNS } from '@/components/templates/patterns/template2'
import type { Project, MediaAsset } from '@prisma/client'

type FullProject = Project & { heroImage: MediaAsset | null; ogImage: MediaAsset | null }

export default function Template2Editor({ project }: { project: FullProject }) {
  return <TemplateEditor project={project} patterns={PATTERNS} Layout={Template2Layout} showTitleLight />
}
