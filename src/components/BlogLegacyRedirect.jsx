import { Navigate, useParams } from 'react-router-dom';

/**
 * Redirige les anciennes URLs /blog/:id/:slug vers /blog/:slug
 * pour conserver le jus SEO des liens existants.
 */
export default function BlogLegacyRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/blog/${slug}`} replace />;
}
