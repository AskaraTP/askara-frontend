import CareerDetailAdminClient from './CareerDetailAdminClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: '1' }];
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: PageProps) {
  return <CareerDetailAdminClient params={params} />;
}
