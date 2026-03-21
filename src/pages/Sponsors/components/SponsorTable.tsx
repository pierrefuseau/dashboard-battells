import DataTable, { type Column } from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import type { Sponsor } from '@/types/database'
import { formatEuros } from '@/lib/formatters'

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral'

const sectorVariants: Record<string, BadgeVariant> = {
  Alimentaire: 'primary',
  Tech: 'info',
  Lifestyle: 'secondary',
  Sport: 'success',
}

const dealTypeLabels: Record<string, string> = {
  integration: 'Intégration',
  dedicated: 'Dédié',
  affiliate: 'Affiliation',
  barter: 'Barter',
  other: 'Autre',
}

const dealTypeVariants: Record<string, BadgeVariant> = {
  integration: 'primary',
  dedicated: 'info',
  affiliate: 'secondary',
  barter: 'warning',
  other: 'neutral',
}

const statusLabels: Record<string, string> = {
  lead: 'Prospect',
  contacted: 'Contacté',
  negotiating: 'En négo',
  signed: 'Confirmé',
  delivered: 'Livré',
  paid: 'Payé',
  lost: 'Perdu',
}

const statusVariants: Record<string, BadgeVariant> = {
  lead: 'neutral',
  contacted: 'info',
  negotiating: 'warning',
  signed: 'success',
  delivered: 'primary',
  paid: 'success',
  lost: 'error',
}

interface SponsorTableProps {
  sponsors: Sponsor[]
}

export default function SponsorTable({ sponsors }: SponsorTableProps) {
  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'brand_name',
      label: 'Marque',
      render: (_, row) => (
        <span className="font-semibold text-text-primary">
          {row.brand_name as string}
        </span>
      ),
    },
    {
      key: 'sector',
      label: 'Secteur',
      render: (_, row) => {
        const sector = row.sector as string | null
        if (!sector) return <span className="text-text-tertiary">—</span>
        return (
          <Badge variant={sectorVariants[sector] ?? 'neutral'}>
            {sector}
          </Badge>
        )
      },
    },
    {
      key: 'contact_name',
      label: 'Contact',
      render: (_, row) => (
        <div>
          <p className="text-text-primary">{String(row.contact_name ?? '—')}</p>
          {row.contact_email ? (
            <p className="text-[11px] text-text-tertiary">{String(row.contact_email)}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'deal_type',
      label: 'Type de deal',
      render: (_, row) => {
        const dt = row.deal_type as string | null
        if (!dt) return <span className="text-text-tertiary">—</span>
        return (
          <Badge variant={dealTypeVariants[dt] ?? 'neutral'}>
            {dealTypeLabels[dt] ?? dt}
          </Badge>
        )
      },
    },
    {
      key: 'amount',
      label: 'Montant',
      sortable: true,
      render: (_, row) => (
        <span className="font-[var(--font-space-grotesk)] font-semibold">
          {row.amount != null ? formatEuros(row.amount as number) : '—'}
        </span>
      ),
    },
    {
      key: 'video_id',
      label: 'Vidéo',
      render: (_, row) => {
        const vid = row.video_id as string | null
        if (!vid) return <span className="text-text-tertiary">—</span>
        return (
          <Badge variant="neutral" size="sm">
            {vid}
          </Badge>
        )
      },
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (_, row) => {
        const s = row.status as string
        return (
          <Badge variant={statusVariants[s] ?? 'neutral'}>
            {statusLabels[s] ?? s}
          </Badge>
        )
      },
    },
  ]

  const tableData = sponsors as unknown as Record<string, unknown>[]

  return (
    <div>
      <h3 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-4">
        Tous les sponsors
      </h3>
      <DataTable columns={columns} data={tableData} pageSize={10} />
    </div>
  )
}
