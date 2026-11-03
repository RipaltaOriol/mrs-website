import type { Department, Partner } from '@/lib/content'
import { TeamPartnersVariant } from './Team.prototype'

/** The Team: Partners as editorial blocks, then Employees as a directory by Department. */
export default function Team({
  partners,
  departments,
  variant = 'A',
}: {
  partners: Partner[]
  departments: Department[]
  variant?: string
}) {
  return (
    <div className="mx-auto mt-10 mb-5 max-w-content">
      <TeamPartnersVariant variant={variant} partners={partners} />

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
