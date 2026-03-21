import type { CsvImport } from '../../types/database'

export const mockImportHistory: CsvImport[] = [
  {
    id: 1,
    filename: 'youtube_analytics_mars_2026.csv',
    file_type: 'YouTube Analytics',
    rows_imported: 1842,
    imported_at: '2026-03-18T14:32:00Z',
    imported_by: 'Baptiste',
  },
  {
    id: 2,
    filename: 'youtube_studio_export_feb.csv',
    file_type: 'YouTube Studio',
    rows_imported: 956,
    imported_at: '2026-03-10T09:15:00Z',
    imported_by: 'Baptiste',
  },
  {
    id: 3,
    filename: 'revenue_report_q1_2026.csv',
    file_type: 'Revenue',
    rows_imported: 312,
    imported_at: '2026-02-28T16:45:00Z',
    imported_by: 'Pierre',
  },
  {
    id: 4,
    filename: 'youtube_analytics_janvier.csv',
    file_type: 'YouTube Analytics',
    rows_imported: 2104,
    imported_at: '2026-02-01T11:20:00Z',
    imported_by: 'Baptiste',
  },
  {
    id: 5,
    filename: 'subscribers_export_dec25.csv',
    file_type: 'Subscribers',
    rows_imported: 487,
    imported_at: '2026-01-15T08:00:00Z',
    imported_by: 'Baptiste',
  },
]
