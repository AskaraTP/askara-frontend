import ShowcaseDetailAdminClient from './ShowcaseDetailAdminClient';

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
  return <ShowcaseDetailAdminClient params={params} />;
}
