import HeroEditAdminClient from './HeroEditAdminClient';

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
  return <HeroEditAdminClient params={params} />;
}
