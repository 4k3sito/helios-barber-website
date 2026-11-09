// Configura GA4 + Tag Manager + Search Console vía APIs de Google con la service account.
// Uso (desde la raíz del proyecto):
//   node scripts/google-setup.mjs check            → qué APIs/permisos tiene la service account
//   node scripts/google-setup.mjs gtm [G-XXXXXXX]  → crea etiquetas en GTM y publica
//   node scripts/google-setup.mjs gsc              → verifica el dominio con GTM y crea la propiedad en Search Console
//   node scripts/google-setup.mjs whatsapp         → evento GA4 contact_whatsapp en clics a wa.me y publica
//   node scripts/google-setup.mjs sitemap          → envía /sitemap.xml a Search Console
import { google } from "googleapis"
import { readdirSync } from "node:fs"

const GTM_PUBLIC_ID = "GTM-T76KNH8Z"
const SITE_URL = "https://heliosbarber.com/"
const SITE_HOST = "heliosbarber.com"
const OWNER_EMAIL = process.env.OWNER_EMAIL || "akexanderr123@gmail.com"
const ALL_PAGES_TRIGGER = "2147479553" // trigger integrado "All Pages" de GTM

const keyFile = readdirSync(".").find((f) => /^heliosbarber-.*\.json$/.test(f))
if (!keyFile) throw new Error("No encontré heliosbarber-*.json en la raíz del proyecto")

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: [
    "https://www.googleapis.com/auth/tagmanager.edit.containers",
    "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
    "https://www.googleapis.com/auth/tagmanager.publish",
    "https://www.googleapis.com/auth/tagmanager.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/siteverification",
    "https://www.googleapis.com/auth/webmasters",
  ],
})

const tagmanager = google.tagmanager({ version: "v2", auth })
const analyticsadmin = google.analyticsadmin({ version: "v1beta", auth })
const siteVerification = google.siteVerification({ version: "v1", auth })
const searchconsole = google.searchconsole({ version: "v1", auth })

const errMsg = (e) => e?.response?.data?.error?.message || e?.errors?.[0]?.message || e.message

async function findContainer() {
  const { data } = await tagmanager.accounts.list()
  for (const acc of data.account ?? []) {
    const { data: c } = await tagmanager.accounts.containers.list({ parent: acc.path })
    const hit = (c.container ?? []).find((x) => x.publicId === GTM_PUBLIC_ID)
    if (hit) return hit
  }
  return null
}

async function findMeasurementIds() {
  const out = []
  const { data } = await analyticsadmin.accountSummaries.list()
  for (const acc of data.accountSummaries ?? []) {
    for (const p of acc.propertySummaries ?? []) {
      const { data: s } = await analyticsadmin.properties.dataStreams.list({ parent: p.property })
      for (const st of s.dataStreams ?? []) {
        if (st.webStreamData)
          out.push({ property: p.displayName, uri: st.webStreamData.defaultUri, id: st.webStreamData.measurementId })
      }
    }
  }
  return out
}

async function check() {
  const sa = (await auth.getCredentials()).client_email
  console.log(`Service account: ${sa}\n`)

  try {
    const c = await findContainer()
    console.log(c ? `✔ Tag Manager: acceso a ${GTM_PUBLIC_ID} (${c.path})` : `✘ Tag Manager: API OK, pero sin acceso a ${GTM_PUBLIC_ID}`)
  } catch (e) {
    console.log(`✘ Tag Manager: ${errMsg(e)}`)
  }

  try {
    const ids = await findMeasurementIds()
    console.log(ids.length ? "✔ Analytics:" : "✘ Analytics: API OK, pero sin propiedades visibles")
    ids.forEach((x) => console.log(`    ${x.id}  ${x.property}  ${x.uri ?? ""}`))
  } catch (e) {
    console.log(`✘ Analytics Admin: ${errMsg(e)}`)
  }

  try {
    await siteVerification.webResource.list()
    console.log("✔ Site Verification API habilitada")
  } catch (e) {
    console.log(`✘ Site Verification: ${errMsg(e)}`)
  }

  try {
    const { data } = await searchconsole.sites.list()
    console.log(`✔ Search Console API habilitada (${(data.siteEntry ?? []).length} sitios)`)
  } catch (e) {
    console.log(`✘ Search Console: ${errMsg(e)}`)
  }
}

async function upsert(list, name, create) {
  const found = list.find((x) => x.name === name)
  if (found) {
    console.log(`  = ya existe: ${name}`)
    return found
  }
  const { data } = await create()
  console.log(`  + creado: ${name}`)
  return data
}

async function gtm(measurementIdArg) {
  let measurementId = measurementIdArg
  if (!measurementId) {
    const ids = (await findMeasurementIds()).filter((x) => (x.uri ?? "").includes(SITE_HOST) || /helios/i.test(x.property))
    if (ids.length !== 1) throw new Error(`No pude elegir el ID de GA4 automáticamente (${ids.length} candidatos). Pásalo: gtm G-XXXXXXX`)
    measurementId = ids[0].id
  }
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) throw new Error(`ID de GA4 inválido: ${measurementId}`)
  console.log(`GA4: ${measurementId}`)

  const container = await findContainer()
  if (!container) throw new Error(`Sin acceso al contenedor ${GTM_PUBLIC_ID}`)
  const { data: ws } = await tagmanager.accounts.containers.workspaces.list({ parent: container.path })
  const workspace = ws.workspace[0]
  const parent = workspace.path
  console.log(`Workspace: ${workspace.name}`)

  const [{ data: v }, { data: t }, { data: tg }] = await Promise.all([
    tagmanager.accounts.containers.workspaces.variables.list({ parent }),
    tagmanager.accounts.containers.workspaces.triggers.list({ parent }),
    tagmanager.accounts.containers.workspaces.tags.list({ parent }),
  ])
  const variables = v.variable ?? []
  const triggers = t.trigger ?? []
  const tags = tg.tag ?? []

  const dlv = (key) =>
    upsert(variables, `DLV - ${key}`, () =>
      tagmanager.accounts.containers.workspaces.variables.create({
        parent,
        requestBody: {
          name: `DLV - ${key}`,
          type: "v",
          parameter: [
            { type: "integer", key: "dataLayerVersion", value: "2" },
            { type: "boolean", key: "setDefaultValue", value: "false" },
            { type: "template", key: "name", value: key },
          ],
        },
      }),
    )
  for (const k of ["value", "currency", "item_name"]) await dlv(k)

  const leadTrigger = await upsert(triggers, "CE - generate_lead", () =>
    tagmanager.accounts.containers.workspaces.triggers.create({
      parent,
      requestBody: {
        name: "CE - generate_lead",
        type: "customEvent",
        customEventFilter: [
          {
            type: "equals",
            parameter: [
              { type: "template", key: "arg0", value: "{{_event}}" },
              { type: "template", key: "arg1", value: "generate_lead" },
            ],
          },
        ],
      },
    }),
  )

  await upsert(tags, "Google tag - GA4", () =>
    tagmanager.accounts.containers.workspaces.tags.create({
      parent,
      requestBody: {
        name: "Google tag - GA4",
        type: "googtag",
        parameter: [{ type: "template", key: "tagId", value: measurementId }],
        firingTriggerId: [ALL_PAGES_TRIGGER],
      },
    }),
  )

  const param = (name, value) => ({
    type: "map",
    map: [
      { type: "template", key: "parameter", value: name },
      { type: "template", key: "parameterValue", value },
    ],
  })
  await upsert(tags, "GA4 Event - generate_lead", () =>
    tagmanager.accounts.containers.workspaces.tags.create({
      parent,
      requestBody: {
        name: "GA4 Event - generate_lead",
        type: "gaawe",
        parameter: [
          { type: "template", key: "eventName", value: "generate_lead" },
          { type: "template", key: "measurementIdOverride", value: measurementId },
          {
            type: "list",
            key: "eventSettingsTable",
            list: [
              param("value", "{{DLV - value}}"),
              param("currency", "{{DLV - currency}}"),
              param("item_name", "{{DLV - item_name}}"),
            ],
          },
        ],
        firingTriggerId: [leadTrigger.triggerId],
      },
    }),
  )

  const { data: cv } = await tagmanager.accounts.containers.workspaces.create_version({
    path: parent,
    requestBody: { name: "GA4 + generate_lead", notes: "Creado por scripts/google-setup.mjs" },
  })
  if (cv.compilerError || !cv.containerVersion) throw new Error(`Error al compilar la versión: ${JSON.stringify(cv)}`)
  const { data: pub } = await tagmanager.accounts.containers.versions.publish({ path: cv.containerVersion.path })
  console.log(`✔ Publicada versión ${pub.containerVersion?.containerVersionId} de ${GTM_PUBLIC_ID}`)
}

async function getWorkspace() {
  const container = await findContainer()
  if (!container) throw new Error(`Sin acceso al contenedor ${GTM_PUBLIC_ID}`)
  const { data: ws } = await tagmanager.accounts.containers.workspaces.list({ parent: container.path })
  return ws.workspace[0].path
}

async function publish(parent, name) {
  const { data: cv } = await tagmanager.accounts.containers.workspaces.create_version({
    path: parent,
    requestBody: { name, notes: "Creado por scripts/google-setup.mjs" },
  })
  if (cv.compilerError || !cv.containerVersion) throw new Error(`Error al compilar la versión: ${JSON.stringify(cv)}`)
  const { data: pub } = await tagmanager.accounts.containers.versions.publish({ path: cv.containerVersion.path })
  console.log(`✔ Publicada versión ${pub.containerVersion?.containerVersionId} de ${GTM_PUBLIC_ID}`)
}

// Clics a WhatsApp (wa.me) → evento GA4 "contact_whatsapp"
async function whatsapp(measurementId = "G-PJJZG5G8HF") {
  const parent = await getWorkspace()
  const W = tagmanager.accounts.containers.workspaces

  const { data: bi } = await W.built_in_variables.list({ parent })
  const enabled = new Set((bi.builtInVariable ?? []).map((v) => v.type))
  const missing = ["clickUrl", "clickText"].filter((t) => !enabled.has(t))
  if (missing.length) {
    await W.built_in_variables.create({ parent, type: missing })
    console.log(`  + variables integradas: ${missing.join(", ")}`)
  }

  const [{ data: t }, { data: tg }] = await Promise.all([W.triggers.list({ parent }), W.tags.list({ parent })])
  const trigger = await upsert(t.trigger ?? [], "Click - WhatsApp", () =>
    W.triggers.create({
      parent,
      requestBody: {
        name: "Click - WhatsApp",
        type: "linkClick",
        waitForTags: { type: "boolean", value: "false" },
        checkValidation: { type: "boolean", value: "false" },
        filter: [
          {
            type: "contains",
            parameter: [
              { type: "template", key: "arg0", value: "{{Click URL}}" },
              { type: "template", key: "arg1", value: "wa.me" },
            ],
          },
        ],
      },
    }),
  )

  const param = (name, value) => ({
    type: "map",
    map: [
      { type: "template", key: "parameter", value: name },
      { type: "template", key: "parameterValue", value },
    ],
  })
  await upsert(tg.tag ?? [], "GA4 Event - contact_whatsapp", () =>
    W.tags.create({
      parent,
      requestBody: {
        name: "GA4 Event - contact_whatsapp",
        type: "gaawe",
        parameter: [
          { type: "template", key: "eventName", value: "contact_whatsapp" },
          { type: "template", key: "measurementIdOverride", value: measurementId },
          {
            type: "list",
            key: "eventSettingsTable",
            list: [param("link_url", "{{Click URL}}"), param("link_text", "{{Click Text}}")],
          },
        ],
        firingTriggerId: [trigger.triggerId],
      },
    }),
  )

  await publish(parent, "WhatsApp clicks")
}

async function sitemap() {
  const feedpath = `${SITE_URL}sitemap.xml`
  await searchconsole.sitemaps.submit({ siteUrl: SITE_URL, feedpath })
  const { data } = await searchconsole.sitemaps.get({ siteUrl: SITE_URL, feedpath })
  console.log(`✔ Sitemap enviado: ${data.path} (pendiente: ${data.isPending ?? false}, errores: ${data.errors ?? 0})`)
}

async function gsc() {
  const site = { type: "SITE", identifier: SITE_URL }
  // TAG_MANAGER no usa token: Google revisa que el snippet GTM esté en el sitio y que
  // quien verifica tenga permiso de Publicar en ese contenedor.
  const { data: res } = await siteVerification.webResource.insert({
    verificationMethod: "TAG_MANAGER",
    requestBody: { site },
  })
  console.log(`✔ Verificado: ${res.site.identifier}`)

  const owners = new Set([...(res.owners ?? []), OWNER_EMAIL])
  await siteVerification.webResource.update({ id: res.id, requestBody: { site, owners: [...owners] } })
  console.log(`✔ Propietarios: ${[...owners].join(", ")}`)

  await searchconsole.sites.add({ siteUrl: SITE_URL })
  console.log(`✔ Propiedad agregada en Search Console: ${SITE_URL}`)
}

const [cmd, arg] = process.argv.slice(2)
const run = { check, gtm: () => gtm(arg), gsc, whatsapp: () => whatsapp(arg), sitemap }[cmd]
if (!run) {
  console.log("Uso: node scripts/google-setup.mjs check | gtm [G-XXXXXXX] | gsc | whatsapp [G-XXXXXXX] | sitemap")
  process.exit(1)
}
run().catch((e) => {
  console.error(`✘ ${errMsg(e)}`)
  process.exit(1)
})
