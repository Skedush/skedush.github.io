import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"
import { brand } from "../brand"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <div class={displayClass}>
      <h1 class="page-title">
        <a href={baseDir}>{title}</a>
      </h1>
      <p class="page-title-subtitle">{brand.subtitle}</p>
    </div>
  )
}

PageTitle.css = `
.page-title {
  margin: 0;
}
.page-title-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--gray);
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
