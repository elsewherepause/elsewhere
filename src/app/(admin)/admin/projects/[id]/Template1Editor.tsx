'use client'

import TemplateEditor from '@/components/admin/template-editor/TemplateEditor'
import Template1Layout from '@/components/templates/Template1Layout'
import { PATTERNS } from '@/components/templates/patterns/template1'
import type { Project, MediaAsset } from '@prisma/client'

type FullProject = Project & { heroImage: MediaAsset | null; ogImage: MediaAsset | null }

export default function Template1Editor({ project }: { project: FullProject }) {
  return <TemplateEditor project={project} patterns={PATTERNS} Layout={Template1Layout} />
}
