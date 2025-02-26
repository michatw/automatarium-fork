import { Container, FooterItem } from './footerStyle'

const Footer = () =>
  <Container>
    <FooterItem><a href="https://github.com/automatarium/automatarium" target="_blank" rel="noreferrer nofollow">Original Source Code</a></FooterItem>

    <div style={{ flex: 1 }} />

    <FooterItem> Developed by michatw</FooterItem>
    <FooterItem>Licensed under MIT</FooterItem>
  </Container>

export default Footer
