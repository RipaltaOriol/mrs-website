import type { Department, Partner } from '@/lib/content'

/** The Team: Partners as editorial blocks, then Employees as a directory by Department. */
export default function Team({ partners, departments }: { partners: Partner[]; departments: Department[] }) {
  return (
    <div className="mx-auto mt-10 mb-5 max-w-content">
      <div className="border-t border-mist">
        {partners.map(({ name, role, biography }) => (
          <article
            key={name}
            className="grid gap-x-10 gap-y-4 border-b border-mist py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:py-10"
          >
            <header>
              <h3 className="mb-1 text-2xl">{name}</h3>
              <p className="mb-0 text-sm font-medium tracking-widest text-brand uppercase">{role}</p>
            </header>
            <ul className="max-w-measure">
              {biography.map((line) => (
                <li key={line} className="border-t border-mist py-2 text-pretty first:border-t-0 first:pt-0">
                  {line}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map(({ name, employees }) => (
          <div key={name}>
            <h3 className="border-b border-ink pb-2 text-lg">{name}</h3>
            <ul>
              {employees.map(({ name: employeeName, role, email }) => (
                <li key={`${employeeName} ${email}`} className="border-b border-mist py-3">
                  <p className="mb-0 font-medium">{employeeName}</p>
                  <p className="mb-1 text-sm text-stone">{role}</p>
                  <a href={`mailto:${email}`} className="text-sm break-all text-brand underline hover:text-brand-deep">
                    {email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
