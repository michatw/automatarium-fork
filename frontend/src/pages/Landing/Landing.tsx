import { Github } from 'lucide-react'

import { Sections, Section, Banner } from './landingStyle'
import { Main, Button, Header, Table, ProjectCard } from '/src/components'

import ExampleAutomaton from './components/ExampleAutomaton'

const Landing = () => (
  <Main fullWidth style={{ paddingBottom: 0 }}>
    <Header center />
    <Sections>
      <Section>
        <ExampleAutomaton />
        <div className="text">
          <p>Automatarium is a student-built platform for automata and formal language theory.</p>
          <p>The original Automatarium was build by students from the RMIT University. </p>
          <p>This fork builds up on the great work they have done. </p>
          <Button to="/new">Start building!</Button>
        </div>
      </Section>

      <Banner>
        <h3>Automatarium is open-source and free</h3>
        <p>Make sure to visit the original version on GitHub. Special thanks to them for making this open source and publicly accessible!</p>
        <Button
          icon={<Github />}
          href="https://github.com/automatarium/automatarium"
          target="_blank"
          rel="nofollow noreferrer"
        >Visit Github</Button>
      </Banner>

    </Sections>
  </Main>
)

export default Landing
