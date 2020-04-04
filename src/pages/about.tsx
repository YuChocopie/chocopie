import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import About from "../containers/About"

type AboutPageProps = {}

const AboutPage: React.FunctionComponent<AboutPageProps> = props => {
  return (
    <Layout>
      <SEO
        title="유초코 소개 | 춤추는 개발자 블로그"
        description="함께하는걸 좋아하는 개발자 입니다. 현재는 이것저것 다양한 안드로이드 앱을 만들고 있습니다.🌝"
      />
      <About />
    </Layout>
  )
}

export default AboutPage
