import React from "react"
import Helmet from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"

type SEOProps = {
  description?: string
  lang?: string
  meta?: any
  keywords?: any
  title: string
  cover?: string
}

const SEO: React.FunctionComponent<SEOProps> = ({
  description,
  lang,
  meta,
  keywords,
  title,
  cover = "https://user-images.githubusercontent.com/26288794/73645628-ffeffa00-46ba-11ea-9b84-a2f2400c5afb.png",
}) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
          }
        }
      }
    `
  )

  const KEYWORDS_SET = [
    "yuchoco",
    "기술블로그",
    "춤추는개발자",
    "김유정",
    "android",
    "안드로이드",
    "yuchocopie",
    "",
  ]
  const currentKeywords = [...keywords, ...KEYWORDS_SET]

  const metaDescription = description || site.siteMetadata.description

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          name: "google-site-verification",
          content: "lV1dh41W1XHmTzJEr5czWbrRk5ARFhgpINCCg0-Wo00",
        },
        {
          property: `og:title`,
          content: `${title}`,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:image`,
          content: cover,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary_large_image`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.author,
        },
        {
          name: `twitter:title`,
          content: `${title}`,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
      ].concat({
        name: "keywords",
        content: currentKeywords.join(", "),
      })}
    />
  )
}

SEO.defaultProps = {
  lang: `ko`,
  meta: [],
  keywords: [],
  description: `춤추는 개발자 유초코의 블로그 입니다.`,
}

export default SEO
