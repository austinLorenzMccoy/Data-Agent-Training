import { splitBullets, type Resume } from '@/lib/resume'

// One plain column so applicant-tracking systems read it in order. Printed on
// its own by the @media print rule for #resume-sheet in globals.css.
export function ResumeSheet({ resume: r }: { resume: Resume }) {
  const contact = [r.email, r.phone, r.location].map((s) => s.trim()).filter(Boolean)
  const links = r.links
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
  const experience = r.experience.filter((e) => e.role.trim() || e.org.trim() || e.bullets.trim())
  const education = r.education.filter((e) => e.degree.trim() || e.school.trim())
  const certifications = r.certifications.filter((c) => c.name.trim())
  const languages = r.languages.filter((l) => l.language.trim())

  return (
    <article
      id="resume-sheet"
      className="mx-auto w-full max-w-[8.5in] bg-white px-8 py-9 font-sans text-[13px] leading-snug text-neutral-900 shadow-sm ring-1 ring-black/5 sm:px-12 print:max-w-none print:px-0 print:py-0 print:shadow-none print:ring-0"
    >
      <header className="border-b border-neutral-300 pb-3">
        <h1 className="font-heading text-3xl font-medium leading-tight">{r.name.trim() || 'Your Name'}</h1>
        {r.headline.trim() && <p className="mt-1 text-sm text-neutral-700">{r.headline}</p>}
        {(contact.length > 0 || links.length > 0) && (
          <p className="mt-2 text-xs text-neutral-600">
            {[...contact, ...links].map((item, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1.5 text-neutral-400">|</span>}
                {links.includes(item) ? (
                  <a href={/^https?:\/\//.test(item) ? item : `https://${item}`} className="underline-offset-2 hover:underline">
                    {item.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                ) : (
                  item
                )}
              </span>
            ))}
          </p>
        )}
      </header>

      {r.summary.trim() && (
        <Section title="Summary">
          <p className="whitespace-pre-line">{r.summary}</p>
        </Section>
      )}

      {r.skills.length > 0 && (
        <Section title="Skills">
          <p>{r.skills.join(' · ')}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-3">
            {experience.map((e, i) => (
              <div key={i} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p>
                    <span className="font-semibold">{e.role}</span>
                    {e.role && e.org && ' — '}
                    {e.org}
                  </p>
                  {e.dates && <p className="text-xs text-neutral-600">{e.dates}</p>}
                </div>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {splitBullets(e.bullets).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          <div className="space-y-2">
            {education.map((e, i) => (
              <div key={i} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p>
                    <span className="font-semibold">{e.degree}</span>
                    {e.degree && e.school && ' — '}
                    {e.school}
                  </p>
                  {e.dates && <p className="text-xs text-neutral-600">{e.dates}</p>}
                </div>
                {e.detail && <p className="text-neutral-700">{e.detail}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="space-y-0.5">
            {certifications.map((c, i) => (
              <li key={i}>
                <span className="font-semibold">{c.name}</span>
                {c.issuer && `, ${c.issuer}`}
                {c.date && <span className="text-neutral-600"> ({c.date})</span>}
                {c.url && (
                  <>
                    {' — '}
                    <a href={c.url} className="text-xs text-neutral-600 underline-offset-2 hover:underline">
                      {c.url.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {languages.length > 0 && (
        <Section title="Languages">
          <p>{languages.map((l) => (l.level ? `${l.language} (${l.level})` : l.language)).join(' · ')}</p>
        </Section>
      )}
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500">{title}</h2>
      {children}
    </section>
  )
}
