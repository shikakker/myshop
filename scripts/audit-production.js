const { spawnSync } = require('node:child_process')

const result = spawnSync(
  'yarn',
  ['audit', '--groups', 'dependencies', '--json'],
  { encoding: 'utf8' }
)

if (result.error) throw result.error

const lines = result.stdout
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)

let summary = null
const blocking = []

for (const line of lines) {
  let event
  try {
    event = JSON.parse(line)
  } catch {
    continue
  }

  if (event.type === 'auditSummary') summary = event.data
  if (event.type !== 'auditAdvisory') continue

  const severity = event.data?.advisory?.severity || event.data?.resolution?.severity
  if (severity !== 'high' && severity !== 'critical') continue

  const advisory = {
    severity,
    module: event.data?.advisory?.module_name || 'unknown',
    title: event.data?.advisory?.title || 'security advisory',
    path: event.data?.resolution?.path || 'unknown path',
    recommendation: event.data?.advisory?.recommendation || '',
    vulnerableVersions: event.data?.advisory?.vulnerable_versions || '',
    patchedVersions: event.data?.advisory?.patched_versions || '',
  }

  const key = `${advisory.severity}|${advisory.module}|${advisory.title}|${advisory.path}`
  if (!blocking.some((item) => item.key === key)) {
    blocking.push({ ...advisory, key })
  }
}

if (!summary) {
  console.error(result.stderr || result.stdout || 'Yarn audit produced no audit summary.')
  process.exit(1)
}

const vulnerabilities = summary.vulnerabilities || {}
console.log(
  `Production dependency audit: ${vulnerabilities.critical || 0} critical, ${vulnerabilities.high || 0} high, ${vulnerabilities.moderate || 0} moderate, ${vulnerabilities.low || 0} low.`
)

if (blocking.length > 0) {
  for (const advisory of blocking) {
    const detail = [
      `${advisory.module}: ${advisory.title}`,
      `path=${advisory.path}`,
      advisory.vulnerableVersions && `vulnerable=${advisory.vulnerableVersions}`,
      advisory.patchedVersions && `patched=${advisory.patchedVersions}`,
      advisory.recommendation && `recommendation=${advisory.recommendation}`,
    ].filter(Boolean).join(' | ')

    console.error(`[${advisory.severity}] ${detail}`)
    console.error(`::error title=${advisory.severity.toUpperCase()} dependency advisory::${detail.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')}`)
  }
  process.exit(1)
}
