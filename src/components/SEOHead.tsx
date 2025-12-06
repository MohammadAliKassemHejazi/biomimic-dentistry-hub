import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Biomimetic Dentistry Club - Making Dentistry More Human and Accessible",
  description = "Join the global movement redefining dental care through biomimetic science. Affordable, accessible education for dental professionals worldwide.",
  keywords = "biomimetic dentistry, dental education, natural dentistry, tooth preservation, dental courses, biomimetics, restorative dentistry",
  image = "/og-image.jpg",
  url = "https://biomimetic-dentistry.com",
  type = "website",
  author = "Biomimetic Dentistry Club",
  publishedTime,
  modifiedTime,
  canonical
}) => {
  const siteName = "Biomimetic Dentistry Club";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      
      {/* Medical/Health Content */}
      <meta name="health-topics" content="dentistry, oral health, biomimetic procedures" />
      
      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "name": siteName,
          "description": description,
          "url": url,
          "logo": {
            "@type": "ImageObject",
            "url": `${url}/logo.png`
          },
          "sameAs": [
            "https://instagram.com/biomimetic-dentistry",
            "https://linkedin.com/company/biomimetic-dentistry",
            "https://youtube.com/@biomimetic-dentistry"
          ],
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Global",
            "addressCountry": "Worldwide"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-555-123-4567",
            "contactType": "customer service",
            "email": "info@biomimetic-dentistry.com"
          },
          "offers": {
            "@type": "EducationalOccupationalProgram",
            "name": "Biomimetic Dentistry Courses",
            "description": "Comprehensive education in natural, tooth-preserving dental techniques",
            "provider": {
              "@type": "EducationalOrganization",
              "name": siteName
            }
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;