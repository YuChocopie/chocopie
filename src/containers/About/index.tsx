import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import SocialProfile from "../../components/SocialProfile/SocialProfile"
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoGithub,
} from "react-icons/io"
import {
  AboutWrapper,
  AboutImage,
  AboutPageTitle,
  AboutDetails,
  SocialProfiles,
} from "./style"
import { Desciption } from "../HomePage/Intro/style"

const SocialLinks = [
  {
    icon: <IoLogoGithub />,
    url: "https://github.com/yuchocopie",
    tooltip: "Github",
  },
  // {
  //   icon: <IoLogoLinkedin />,
  //   url: "https://www.linkedin.com/in/donggeun-lee-568916160/",
  //   tooltip: "Linkedin",
  // },
  {
    icon: <IoLogoInstagram />,
    url: "https://www.instagram.com/u_.jeong/",
    tooltip: "Instagram",
  },
  {
    icon: <IoLogoFacebook />,
    url: "https://www.facebook.com/yuchocopie",
    tooltip: "Facebook",
  },
]

interface AboutProps {}

const About: React.FunctionComponent<AboutProps> = props => {
  const Data = useStaticQuery(graphql`
    query {
      avatar: file(absolutePath: { regex: "/about.jpg/" }) {
        childImageSharp {
          fluid(maxWidth: 1770, quality: 90) {
            ...GatsbyImageSharpFluid
          }
        }
      }
      site {
        siteMetadata {
          author
          about
        }
      }
    }
  `)

  return (
    <AboutWrapper>
      <AboutPageTitle>
        <h2>🙌, 초코파이입니다 .</h2>
        <p>
          좋은 개발자가 되기 위해서는 오직 개발에만 집중하기보다는 여러 직군과
          협업을 해야 한다고 생각합니다. 개발뿐만 아니라 디자인, 기획을 접해보고
          도움이 될만한 것들을 계속 배우고 있습니다.
          {/* 기획에 한계를 주지 않는 개발자 이동근입니다. 기획에 세세한 부분을 사용자 관점에서 채워나가는 것을 좋아합니다.
          주어진 환경에서 가장 최상의 퍼포먼스와 임팩트를 주기 위해 최선을 다하고 있습니다. */}
          <br />
          지금은 이것저것 다양한 안드로이드 앱을 만들고 있습니다.🌝
        </p>
      </AboutPageTitle>
      {/*<AboutImage>*/}
      {/*  <Image fluid={Data.avatar.childImageSharp.fluid} alt="author" />*/}
      {/*</AboutImage>*/}
      <AboutDetails>
        <h2 style={{ marginTop: "32px" }}>단체경력</h2>
        <div>
          <li>Mashup 개발 동아리 : (2018 ~ 현재)</li>
          <li>멋쟁이 사자처럼 (2019)</li>
          <li>UKOV 대학생 벤처기사단(2019)</li>
        </div>
        <SocialProfiles>
          <SocialProfile items={SocialLinks} />
        </SocialProfiles>
      </AboutDetails>
    </AboutWrapper>
  )
}

export default About
