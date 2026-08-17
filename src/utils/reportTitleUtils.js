export function formatReportDisposition(value = '') {
  return String(value)
    .trim()
    .replace(/^NATURA\s+/i, '')
    .toLowerCase()
    .replace(/(^|[\s'-])([a-zà-ú])/g, (match, prefix, letter) =>
      `${prefix}${letter.toUpperCase()}`,
    )
}

export function buildProfileSectionTitle(baseTitle, disposition = '') {
  const title = String(baseTitle || '').trim()
  const dispositionLabel = formatReportDisposition(disposition)

  if (!dispositionLabel) return title
  return `${title} (${dispositionLabel})`
}

export function buildFamilyProfileSectionTitle(baseTitle, family = '') {
  const title = String(baseTitle || '').trim()
  const familyLabel = formatReportDisposition(family)

  if (!familyLabel) return title
  return `${title} (Famiglia ${familyLabel})`
}

export function resolveProfileFamilyLabel(profilo = {}, fallbackFamily = '') {
  return String(
    profilo.correnteDominante || profilo.famigliaLabel || fallbackFamily || '',
  ).trim()
}
