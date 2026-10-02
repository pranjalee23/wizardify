import { redirect } from 'next/navigation'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

// The member list moved onto the dashboard; old links still land there with their search
export default async function Members({ searchParams }: Props) {
  const params = new URLSearchParams(Object.entries(await searchParams).flatMap(([k, v]) => (typeof v === 'string' ? [[k, v]] : [])))
  redirect(`/admin${params.size ? `?${params}` : ''}`)
}
